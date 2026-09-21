package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"bizcatalog/backend/internal/middleware"
	"bizcatalog/backend/internal/models"
	"bizcatalog/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	repo      repository.Repository
	uploadDir string
}

func NewHandler(repo repository.Repository, uploadDir string) *Handler {
	_ = os.MkdirAll(uploadDir, 0755)
	return &Handler{
		repo:      repo,
		uploadDir: uploadDir,
	}
}

// Subdomain regex: lowercase letters, numbers, hyphens (3-30 chars)
var subdomainRegex = regexp.MustCompile(`^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$`)

// Auth Handlers
func (h *Handler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Subdomain = strings.ToLower(strings.TrimSpace(req.Subdomain))

	if !subdomainRegex.MatchString(req.Subdomain) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subdomain harus berupa 3-30 karakter huruf kecil, angka, atau tanda strip (-)"})
		return
	}

	// Check if email taken
	if _, err := h.repo.GetUserByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar"})
		return
	}

	// Check if subdomain taken
	if _, err := h.repo.GetWebsiteBySubdomain(req.Subdomain); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Subdomain sudah digunakan oleh pengguna lain"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi"})
		return
	}

	now := time.Now()
	userID := "usr-" + uuid.New().String()
	user := models.User{
		ID:           userID,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		Plan:         models.PlanFree,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := h.repo.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat akun pengguna: " + err.Error()})
		return
	}

	websiteID := "ws-" + uuid.New().String()
	website := models.Website{
		ID:           websiteID,
		UserID:       userID,
		Subdomain:    req.Subdomain,
		BusinessName: req.BusinessName,
		Tagline:      "Selamat datang di website katalog resmi " + req.BusinessName,
		Description:  "Kami menyediakan produk dan layanan terbaik dengan komitmen kualitas tinggi.",
		Email:        req.Email,
		ThemeID:      "minimalist",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := h.repo.CreateWebsite(&website); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat website pengguna: " + err.Error()})
		return
	}

	// Create default sections
	_ = h.repo.SaveSections(websiteID, repository.DefaultSections(websiteID))

	token, err := middleware.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat sesi autentikasi"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token:   token,
		User:    user.Sanitize(),
		Website: &website,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	user, err := h.repo.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau kata sandi salah"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau kata sandi salah"})
		return
	}

	ws, _ := h.repo.GetWebsiteByUserID(user.ID)

	token, err := middleware.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat sesi autentikasi"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token:   token,
		User:    user.Sanitize(),
		Website: ws,
	})
}

// User Profile Handlers
func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetString("userID")
	user, err := h.repo.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, user.Sanitize())
}

type UpdateProfileRequest struct {
	Name string          `json:"name"`
	Plan models.UserPlan `json:"plan"`
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("userID")
	user, err := h.repo.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Plan != "" {
		user.Plan = req.Plan
	}
	user.UpdatedAt = time.Now()

	if err := h.repo.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui profil"})
		return
	}

	token, _ := middleware.GenerateToken(user)
	c.JSON(http.StatusOK, gin.H{
		"user":  user.Sanitize(),
		"token": token,
	})
}

// Website Handlers
func (h *Handler) GetMyWebsite(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website pengguna tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, ws)
}

func (h *Handler) UpdateMyWebsite(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	var req models.Website
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	// Update permitted fields
	if req.BusinessName != "" {
		ws.BusinessName = req.BusinessName
	}
	ws.Tagline = req.Tagline
	ws.Description = req.Description
	ws.Address = req.Address
	ws.Phone = req.Phone
	ws.Email = req.Email
	ws.WhatsApp = req.WhatsApp
	ws.Instagram = req.Instagram
	ws.Facebook = req.Facebook
	ws.TikTok = req.TikTok
	ws.LogoURL = req.LogoURL
	ws.PrimaryColor = req.PrimaryColor
	ws.OperatingHours = req.OperatingHours
	ws.BankName = req.BankName
	ws.BankAccountNo = req.BankAccountNo
	ws.BankAccountName = req.BankAccountName
	ws.QRISImageURL = req.QRISImageURL
	ws.EnableCOD = req.EnableCOD
	ws.EnableBankTransfer = req.EnableBankTransfer
	if req.HeaderStyle != "" {
		ws.HeaderStyle = req.HeaderStyle
	}
	ws.UpdatedAt = time.Now()

	if err := h.repo.UpdateWebsite(ws); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui data website"})
		return
	}

	c.JSON(http.StatusOK, ws)
}

type UpdateThemeRequest struct {
	ThemeID string `json:"theme_id" binding:"required"`
}

func (h *Handler) UpdateTheme(c *gin.Context) {
	userID := c.GetString("userID")
	userPlan := c.MustGet("userPlan").(models.UserPlan)

	var req UpdateThemeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ThemeID diperlukan"})
		return
	}

	if err := middleware.CheckThemeAccess(userPlan, req.ThemeID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": err.Error(),
			"code":  "THEME_LOCKED",
		})
		return
	}

	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	ws.ThemeID = req.ThemeID
	ws.UpdatedAt = time.Now()
	if err := h.repo.UpdateWebsite(ws); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tema"})
		return
	}

	c.JSON(http.StatusOK, ws)
}

// Category Handlers
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (h *Handler) GetCategories(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	categories, err := h.repo.GetCategoriesByWebsiteID(ws.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat kategori"})
		return
	}
	if categories == nil {
		categories = make([]models.Category, 0)
	}
	c.JSON(http.StatusOK, categories)
}

func (h *Handler) CreateCategory(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori wajib diisi"})
		return
	}

	trimmedName := strings.TrimSpace(req.Name)
	if trimmedName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori tidak boleh kosong"})
		return
	}

	now := time.Now()
	slug := strings.ToLower(strings.ReplaceAll(trimmedName, " ", "-"))

	cat := models.Category{
		ID:          "cat-" + uuid.New().String()[:8],
		WebsiteID:   ws.ID,
		Name:        trimmedName,
		Slug:        slug,
		Description: strings.TrimSpace(req.Description),
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := h.repo.CreateCategory(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, cat)
}

func (h *Handler) UpdateCategory(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	catID := c.Param("id")
	cat, err := h.repo.GetCategoryByID(catID)
	if err != nil || cat.WebsiteID != ws.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	if req.Name != "" {
		trimmed := strings.TrimSpace(req.Name)
		cat.Name = trimmed
		cat.Slug = strings.ToLower(strings.ReplaceAll(trimmed, " ", "-"))
	}
	if req.Description != "" {
		cat.Description = strings.TrimSpace(req.Description)
	}
	cat.UpdatedAt = time.Now()

	if err := h.repo.UpdateCategory(cat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kategori"})
		return
	}

	c.JSON(http.StatusOK, cat)
}

func (h *Handler) DeleteCategory(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	catID := c.Param("id")
	cat, err := h.repo.GetCategoryByID(catID)
	if err != nil || cat.WebsiteID != ws.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	if err := h.repo.DeleteCategory(catID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}

// Product Handlers
func (h *Handler) GetProducts(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	products, err := h.repo.GetProductsByWebsiteID(ws.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat produk"})
		return
	}
	if products == nil {
		products = make([]models.Product, 0)
	}
	c.JSON(http.StatusOK, products)
}

func (h *Handler) CreateProduct(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	var p models.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	p.ID = "prod-" + uuid.New().String()
	p.WebsiteID = ws.ID
	if p.Slug == "" {
		p.Slug = strings.ToLower(strings.ReplaceAll(p.Name, " ", "-"))
	}
	if p.Status == "" {
		p.Status = models.ProductStatusPublished
	}
	now := time.Now()
	p.CreatedAt = now
	p.UpdatedAt = now

	if err := h.repo.CreateProduct(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat produk: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *Handler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	p, err := h.repo.GetProductByID(productID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
		return
	}

	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	p.Name = req.Name
	p.Description = req.Description
	p.Price = req.Price
	p.Category = req.Category
	p.ImageURL = req.ImageURL
	p.Status = req.Status
	p.Stock = req.Stock
	p.UpdatedAt = time.Now()

	if err := h.repo.UpdateProduct(p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui produk"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *Handler) DeleteProduct(c *gin.Context) {
	productID := c.Param("id")
	if err := h.repo.DeleteProduct(productID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}

// Asset Handlers
func (h *Handler) GetAssets(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	assets, err := h.repo.GetAssetsByWebsiteID(ws.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat aset"})
		return
	}
	if assets == nil {
		assets = make([]models.Asset, 0)
	}
	c.JSON(http.StatusOK, assets)
}

func (h *Handler) UploadAsset(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File diperlukan"})
		return
	}
	defer file.Close()

	assetType := models.AssetType(c.DefaultPostForm("type", string(models.AssetTypeProduct)))

	ext := filepath.Ext(header.Filename)
	uniqueFilename := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	dstPath := filepath.Join(h.uploadDir, uniqueFilename)

	out, err := os.Create(dstPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
		return
	}
	defer out.Close()

	size, err := io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menulis file"})
		return
	}

	assetURL := "/uploads/" + uniqueFilename
	asset := models.Asset{
		ID:        "ast-" + uuid.New().String(),
		WebsiteID: ws.ID,
		Name:      header.Filename,
		Type:      assetType,
		URL:       assetURL,
		SizeBytes: size,
		CreatedAt: time.Now(),
	}

	if err := h.repo.CreateAsset(&asset); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat aset di database"})
		return
	}

	c.JSON(http.StatusCreated, asset)
}

func (h *Handler) DeleteAsset(c *gin.Context) {
	assetID := c.Param("id")
	if err := h.repo.DeleteAsset(assetID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aset tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Aset berhasil dihapus"})
}

// Section Handlers
func (h *Handler) GetSections(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	sections, err := h.repo.GetSectionsByWebsiteID(ws.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat sections"})
		return
	}
	if len(sections) == 0 {
		sections = repository.DefaultSections(ws.ID)
		_ = h.repo.SaveSections(ws.ID, sections)
	}
	c.JSON(http.StatusOK, sections)
}

type SaveSectionsRequest struct {
	Sections []models.SectionConfig `json:"sections" binding:"required"`
}

func (h *Handler) SaveSections(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	var req SaveSectionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	for i := range req.Sections {
		req.Sections[i].WebsiteID = ws.ID
		if req.Sections[i].ID == "" {
			req.Sections[i].ID = "sec-" + uuid.New().String()
		}
	}

	if err := h.repo.SaveSections(ws.ID, req.Sections); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan konfigurasi sections"})
		return
	}

	c.JSON(http.StatusOK, req.Sections)
}

// Testimonials & Gallery Handlers
func (h *Handler) GetTestimonials(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}
	items, _ := h.repo.GetTestimonialsByWebsiteID(ws.ID)
	if items == nil {
		items = make([]models.Testimonial, 0)
	}
	c.JSON(http.StatusOK, items)
}

func (h *Handler) CreateTestimonial(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}
	var t models.Testimonial
	if err := c.ShouldBindJSON(&t); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}
	t.ID = "testi-" + uuid.New().String()
	t.WebsiteID = ws.ID
	t.CreatedAt = time.Now()
	_ = h.repo.CreateTestimonial(&t)
	c.JSON(http.StatusCreated, t)
}

func (h *Handler) DeleteTestimonial(c *gin.Context) {
	_ = h.repo.DeleteTestimonial(c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Testimoni dihapus"})
}

func (h *Handler) GetGalleries(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}
	items, _ := h.repo.GetGalleriesByWebsiteID(ws.ID)
	if items == nil {
		items = make([]models.GalleryItem, 0)
	}
	c.JSON(http.StatusOK, items)
}

func (h *Handler) CreateGallery(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}
	var g models.GalleryItem
	if err := c.ShouldBindJSON(&g); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}
	g.ID = "gal-" + uuid.New().String()
	g.WebsiteID = ws.ID
	g.CreatedAt = time.Now()
	_ = h.repo.CreateGalleryItem(&g)
	c.JSON(http.StatusCreated, g)
}

func (h *Handler) DeleteGallery(c *gin.Context) {
	_ = h.repo.DeleteGalleryItem(c.Param("id"))
	c.JSON(http.StatusOK, gin.H{"message": "Galeri dihapus"})
}

// Public Dynamic Website Handler
func (h *Handler) GetPublicWebsite(c *gin.Context) {
	subdomain := strings.ToLower(c.Param("subdomain"))
	data, err := h.repo.GetPublicWebsiteData(subdomain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":     fmt.Sprintf("Website dengan subdomain '%s' tidak ditemukan", subdomain),
			"subdomain": subdomain,
		})
		return
	}
	c.JSON(http.StatusOK, data)
}

// E-Commerce Order Handlers
func (h *Handler) CreatePublicOrder(c *gin.Context) {
	subdomain := strings.ToLower(c.Param("subdomain"))
	ws, err := h.repo.GetWebsiteBySubdomain(subdomain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website toko tidak ditemukan"})
		return
	}

	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input pesanan tidak valid: " + err.Error()})
		return
	}

	// Calculate subtotal amount
	var subtotal float64
	for _, item := range req.Items {
		subtotal += item.Price * float64(item.Quantity)
	}

	if req.PaymentMethod == "" {
		req.PaymentMethod = "bank_transfer"
	}
	if req.ShippingMethod == "" {
		req.ShippingMethod = "regular"
	}

	total := subtotal + req.ShippingCost

	now := time.Now()
	orderID := "ord-" + uuid.New().String()
	orderNumber := fmt.Sprintf("INV-%s-%s", now.Format("060102"), uuid.New().String()[:5])

	order := models.Order{
		ID:              orderID,
		WebsiteID:       ws.ID,
		OrderNumber:     orderNumber,
		CustomerName:    req.CustomerName,
		CustomerPhone:   req.CustomerPhone,
		Address:         req.Address,
		Notes:           req.Notes,
		Items:           req.Items,
		SubtotalAmount:  subtotal,
		ShippingCost:    req.ShippingCost,
		TotalAmount:     total,
		PaymentMethod:   req.PaymentMethod,
		PaymentStatus:   models.PaymentStatusUnpaid,
		ShippingMethod:  req.ShippingMethod,
		Status:          models.OrderStatusPending,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if err := h.repo.CreateOrder(&order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pesanan: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *Handler) GetPublicOrderByNumber(c *gin.Context) {
	subdomain := c.Param("subdomain")
	orderNumber := c.Param("order_number")

	ws, err := h.repo.GetWebsiteBySubdomain(subdomain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website toko tidak ditemukan"})
		return
	}

	order, err := h.repo.GetOrderByNumber(ws.ID, orderNumber)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order":   order,
		"website": ws,
	})
}

func (h *Handler) UploadPaymentProof(c *gin.Context) {
	subdomain := c.Param("subdomain")
	orderNumber := c.Param("order_number")

	ws, err := h.repo.GetWebsiteBySubdomain(subdomain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website toko tidak ditemukan"})
		return
	}

	order, err := h.repo.GetOrderByNumber(ws.ID, orderNumber)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	file, err := c.FormFile("proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File bukti transfer diperlukan"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format gambar harus JPG, PNG, atau WebP"})
		return
	}

	filename := fmt.Sprintf("proof_%s_%d%s", order.OrderNumber, time.Now().Unix(), ext)
	dst := filepath.Join(h.uploadDir, filename)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file bukti transfer"})
		return
	}

	order.PaymentProofURL = "/uploads/" + filename
	order.PaymentStatus = models.PaymentStatusWaitingVerification
	order.Status = models.OrderStatusProcessing
	order.UpdatedAt = time.Now()

	if err := h.repo.UpdateOrder(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status pesanan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order":   order,
		"message": "Bukti transfer berhasil diunggah! Menunggu verifikasi penjual.",
	})
}

func (h *Handler) ConfirmPublicPayment(c *gin.Context) {
	subdomain := c.Param("subdomain")
	orderNumber := c.Param("order_number")

	ws, err := h.repo.GetWebsiteBySubdomain(subdomain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website toko tidak ditemukan"})
		return
	}

	order, err := h.repo.GetOrderByNumber(ws.ID, orderNumber)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	order.PaymentStatus = models.PaymentStatusWaitingVerification
	order.Status = models.OrderStatusProcessing
	order.UpdatedAt = time.Now()

	if err := h.repo.UpdateOrder(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengonfirmasi pembayaran"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order":   order,
		"message": "Pembayaran berhasil dikonfirmasi! Penjual akan segera memproses pesanan Anda.",
	})
}

func (h *Handler) GetOrders(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	orders, err := h.repo.GetOrdersByWebsiteID(ws.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat pesanan"})
		return
	}
	if orders == nil {
		orders = make([]models.Order, 0)
	}
	c.JSON(http.StatusOK, orders)
}

func (h *Handler) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	var req models.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status pesanan tidak valid"})
		return
	}

	if err := h.repo.UpdateOrderStatus(orderID, req.Status); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	updated, _ := h.repo.GetOrderByID(orderID)
	c.JSON(http.StatusOK, updated)
}

func (h *Handler) UpdateOrderAdmin(c *gin.Context) {
	orderID := c.Param("id")
	order, err := h.repo.GetOrderByID(orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	var req models.UpdateOrderAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	if req.Status != "" {
		order.Status = req.Status
	}
	if req.PaymentStatus != "" {
		order.PaymentStatus = req.PaymentStatus
	}
	if req.TrackingNumber != "" {
		order.TrackingNumber = req.TrackingNumber
	}
	if req.ShippingCourier != "" {
		order.ShippingCourier = req.ShippingCourier
	}
	order.UpdatedAt = time.Now()

	if err := h.repo.UpdateOrder(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui pesanan"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// ============================================================================
// PROMOTIONS HANDLERS
// ============================================================================

type CreatePromotionRequest struct {
	Title            string            `json:"title" binding:"required"`
	Subtitle         string            `json:"subtitle"`
	Type             models.PromoType  `json:"type" binding:"required"`
	Code             string            `json:"code"`
	DiscountPercent  int               `json:"discount_percent"`
	DiscountAmount   float64           `json:"discount_amount"`
	MinSpend         float64           `json:"min_spend"`
	CountdownDays    int               `json:"countdown_days"`
	CountdownHours   int               `json:"countdown_hours"`
	CountdownMinutes int               `json:"countdown_minutes"`
	Badge            string            `json:"badge"`
	ButtonText       string            `json:"button_text"`
	ButtonLink       string            `json:"button_link"`
	TargetType       models.TargetType `json:"target_type"`
	TargetCategory   string            `json:"target_category"`
	ProductIDs       []string          `json:"product_ids"`
	IsActive         *bool             `json:"is_active"`
}

type UpdatePromotionRequest struct {
	Title            string            `json:"title"`
	Subtitle         string            `json:"subtitle"`
	Type             models.PromoType  `json:"type"`
	Code             string            `json:"code"`
	DiscountPercent  *int              `json:"discount_percent"`
	DiscountAmount   *float64          `json:"discount_amount"`
	MinSpend         *float64          `json:"min_spend"`
	CountdownDays    *int              `json:"countdown_days"`
	CountdownHours   *int              `json:"countdown_hours"`
	CountdownMinutes *int              `json:"countdown_minutes"`
	Badge            string            `json:"badge"`
	ButtonText       string            `json:"button_text"`
	ButtonLink       string            `json:"button_link"`
	TargetType       models.TargetType `json:"target_type"`
	TargetCategory   string            `json:"target_category"`
	ProductIDs       []string          `json:"product_ids"`
	IsActive         *bool             `json:"is_active"`
}

func (h *Handler) GetPromotions(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	promos, err := h.repo.GetPromotionsByWebsiteID(ws.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat promo"})
		return
	}
	if promos == nil {
		promos = make([]models.Promotion, 0)
	}
	c.JSON(http.StatusOK, promos)
}

func (h *Handler) CreatePromotion(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	var req CreatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input promo tidak valid: " + err.Error()})
		return
	}

	title := strings.TrimSpace(req.Title)
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Judul promo wajib diisi"})
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	targetType := req.TargetType
	if targetType == "" {
		targetType = models.TargetAll
	}

	buttonText := req.ButtonText
	if buttonText == "" {
		if req.Type == models.PromoTypeCountdown {
			buttonText = "Shop The Sale"
		} else if req.Type == models.PromoTypeCoupon {
			buttonText = "Salin Kode"
		} else {
			buttonText = "Lihat Promo"
		}
	}

	buttonLink := req.ButtonLink
	if buttonLink == "" {
		buttonLink = "#katalog"
	}

	badge := req.Badge
	if badge == "" {
		if req.Type == models.PromoTypeCountdown {
			badge = "Limited Time Offer"
		} else if req.Type == models.PromoTypeCoupon {
			badge = "Kupon Spesial"
		} else {
			badge = "Penawaran Terbatas"
		}
	}

	now := time.Now()
	promo := models.Promotion{
		ID:               "promo-" + uuid.New().String()[:8],
		WebsiteID:        ws.ID,
		Title:            title,
		Subtitle:         strings.TrimSpace(req.Subtitle),
		Type:             req.Type,
		Code:             strings.ToUpper(strings.TrimSpace(req.Code)),
		DiscountPercent:  req.DiscountPercent,
		DiscountAmount:   req.DiscountAmount,
		MinSpend:         req.MinSpend,
		CountdownDays:    req.CountdownDays,
		CountdownHours:   req.CountdownHours,
		CountdownMinutes: req.CountdownMinutes,
		Badge:            badge,
		ButtonText:       buttonText,
		ButtonLink:       buttonLink,
		TargetType:       targetType,
		TargetCategory:   req.TargetCategory,
		ProductIDs:       req.ProductIDs,
		IsActive:         isActive,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	if promo.ProductIDs == nil {
		promo.ProductIDs = make([]string, 0)
	}

	if err := h.repo.CreatePromotion(&promo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan promo"})
		return
	}

	c.JSON(http.StatusCreated, promo)
}

func (h *Handler) UpdatePromotion(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	promoID := c.Param("id")
	promo, err := h.repo.GetPromotionByID(promoID)
	if err != nil || promo.WebsiteID != ws.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promo tidak ditemukan"})
		return
	}

	var req UpdatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input promo tidak valid"})
		return
	}

	if req.Title != "" {
		promo.Title = strings.TrimSpace(req.Title)
	}
	if req.Subtitle != "" {
		promo.Subtitle = strings.TrimSpace(req.Subtitle)
	}
	if req.Type != "" {
		promo.Type = req.Type
	}
	if req.Code != "" {
		promo.Code = strings.ToUpper(strings.TrimSpace(req.Code))
	}
	if req.DiscountPercent != nil {
		promo.DiscountPercent = *req.DiscountPercent
	}
	if req.DiscountAmount != nil {
		promo.DiscountAmount = *req.DiscountAmount
	}
	if req.MinSpend != nil {
		promo.MinSpend = *req.MinSpend
	}
	if req.CountdownDays != nil {
		promo.CountdownDays = *req.CountdownDays
	}
	if req.CountdownHours != nil {
		promo.CountdownHours = *req.CountdownHours
	}
	if req.CountdownMinutes != nil {
		promo.CountdownMinutes = *req.CountdownMinutes
	}
	if req.Badge != "" {
		promo.Badge = req.Badge
	}
	if req.ButtonText != "" {
		promo.ButtonText = req.ButtonText
	}
	if req.ButtonLink != "" {
		promo.ButtonLink = req.ButtonLink
	}
	if req.TargetType != "" {
		promo.TargetType = req.TargetType
	}
	if req.TargetCategory != "" {
		promo.TargetCategory = req.TargetCategory
	}
	if req.ProductIDs != nil {
		promo.ProductIDs = req.ProductIDs
	}
	if req.IsActive != nil {
		promo.IsActive = *req.IsActive
	}
	promo.UpdatedAt = time.Now()

	if err := h.repo.UpdatePromotion(promo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui promo"})
		return
	}

	c.JSON(http.StatusOK, promo)
}

func (h *Handler) DeletePromotion(c *gin.Context) {
	userID := c.GetString("userID")
	ws, err := h.repo.GetWebsiteByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website tidak ditemukan"})
		return
	}

	promoID := c.Param("id")
	promo, err := h.repo.GetPromotionByID(promoID)
	if err != nil || promo.WebsiteID != ws.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promo tidak ditemukan"})
		return
	}

	if err := h.repo.DeletePromotion(promoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus promo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Promo berhasil dihapus"})
}


