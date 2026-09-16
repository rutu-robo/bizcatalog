package repository

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"bizcatalog/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type DatabaseSchema struct {
	Users        []models.User          `json:"users"`
	Websites     []models.Website       `json:"websites"`
	Categories   []models.Category      `json:"categories"`
	Products     []models.Product       `json:"products"`
	Assets       []models.Asset         `json:"assets"`
	Sections     []models.SectionConfig `json:"sections"`
	Testimonials []models.Testimonial   `json:"testimonials"`
	Galleries    []models.GalleryItem   `json:"galleries"`
	Orders       []models.Order         `json:"orders"`
}

type JSONStore struct {
	filePath string
	mu       sync.RWMutex
	data     DatabaseSchema
}

func NewJSONStore(filePath string) (*JSONStore, error) {
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create directory: %w", err)
	}

	store := &JSONStore{
		filePath: filePath,
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		store.initSeedData()
		if err := store.saveToFile(); err != nil {
			return nil, fmt.Errorf("failed to init seed data: %w", err)
		}
	} else {
		content, err := os.ReadFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("failed to read db file: %w", err)
		}
		if len(content) > 0 {
			if err := json.Unmarshal(content, &store.data); err != nil {
				return nil, fmt.Errorf("failed to parse db file: %w", err)
			}
			repaired := false
			for i := range store.data.Users {
				if store.data.Users[i].PasswordHash == "" {
					if store.data.Users[i].Email == "demo@bizcatalog.com" {
						h, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
						store.data.Users[i].PasswordHash = string(h)
						repaired = true
					}
				}
			}
			for i := range store.data.Websites {
				if store.data.Websites[i].Subdomain == "mebeljaya" && store.data.Websites[i].BankName == "" {
					store.data.Websites[i].BankName = "Bank Central Asia (BCA)"
					store.data.Websites[i].BankAccountNo = "8830-1928-41"
					store.data.Websites[i].BankAccountName = "Mebel Jaya Abadi"
					store.data.Websites[i].QRISImageURL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.LINKAJA.WWW01189360091438830192845204581253033605802ID5916MEBEL+JAYA+ABADI6006JEPARA62070703A01630489AB"
					store.data.Websites[i].EnableBankTransfer = true
					store.data.Websites[i].EnableCOD = true
					repaired = true
				}
			}
			if store.data.Categories == nil {
				store.data.Categories = make([]models.Category, 0)
			}
			// Auto-seed categories from existing products if none exist
			if len(store.data.Categories) == 0 && len(store.data.Products) > 0 {
				catMap := make(map[string]bool)
				now := time.Now()
				for _, p := range store.data.Products {
					if p.Category != "" {
						key := p.WebsiteID + ":" + p.Category
						if !catMap[key] {
							catMap[key] = true
							slug := strings.ToLower(strings.ReplaceAll(p.Category, " ", "-"))
							store.data.Categories = append(store.data.Categories, models.Category{
								ID:        "cat-" + uuid.New().String()[:8],
								WebsiteID: p.WebsiteID,
								Name:      p.Category,
								Slug:      slug,
								CreatedAt: now,
								UpdatedAt: now,
							})
							repaired = true
						}
					}
				}
			}
			if repaired {
				_ = store.saveToFile()
			}
		}
	}

	return store, nil
}

func (s *JSONStore) saveToFile() error {
	bytes, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	tmpFile := s.filePath + ".tmp"
	if err := os.WriteFile(tmpFile, bytes, 0644); err != nil {
		return err
	}
	return os.Rename(tmpFile, s.filePath)
}

func DefaultSections(websiteID string) []models.SectionConfig {
	return []models.SectionConfig{
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionHero,
			Title:     "Koleksi Mebel Kayu Jati Terbaik",
			Subtitle:  "Dikerjakan langsung oleh pengrajin ahli dari Jepara dengan kualitas ekspor.",
			Variant:   "split",
			IsVisible: true,
			Order:     1,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionPromos,
			Title:     "Promo Spesial Diskon & Kupon Belanja",
			Subtitle:  "Klaim voucher kupon diskon eksklusif untuk hemat lebih banyak hari ini!",
			Variant:   "coupon-ticket",
			IsVisible: true,
			Order:     2,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionCategories,
			Title:     "Kategori Pilihan",
			Subtitle:  "Pilih kategori untuk memfilter koleksi produk favorit Anda.",
			Variant:   "circle-avatar",
			IsVisible: true,
			Order:     3,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionCatalog,
			Title:     "Katalog Produk Unggulan",
			Subtitle:  "Pilihan produk berkualitas tinggi yang siap mempercantik ruangan Anda.",
			Variant:   "standard-card",
			IsVisible: true,
			Order:     4,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionAbout,
			Title:     "Tentang Usaha Kami",
			Subtitle:  "Berpengalaman lebih dari 15 tahun melayani pesanan furnitur rumah tangga, cafe, dan kantor di seluruh Indonesia.",
			Variant:   "split",
			IsVisible: true,
			Order:     5,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionGallery,
			Title:     "Galeri Workshop & Pengiriman",
			Subtitle:  "Dokumentasi proses produksi dan pengiriman pesanan pelanggan.",
			Variant:   "grid",
			IsVisible: true,
			Order:     6,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionTestimonials,
			Title:     "Apa Kata Pelanggan Kami?",
			Subtitle:  "Kepuasan pelanggan adalah prioritas utama setiap karya kami.",
			Variant:   "grid-cards",
			IsVisible: true,
			Order:     7,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionContact,
			Title:     "Hubungi Kami Langsung",
			Subtitle:  "Konsultasikan kebutuhan perabot Anda langsung via WhatsApp.",
			Variant:   "default",
			IsVisible: true,
			Order:     8,
		},
		{
			ID:        uuid.New().String(),
			WebsiteID: websiteID,
			Type:      models.SectionFooter,
			Title:     "",
			Subtitle:  "",
			Variant:   "multi-column",
			IsVisible: true,
			Order:     9,
		},
	}
}

func (s *JSONStore) initSeedData() {
	now := time.Now()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	userID := "usr-demo-001"
	demoUser := models.User{
		ID:           userID,
		Email:        "demo@bizcatalog.com",
		PasswordHash: string(hashedPassword),
		Name:         "Budi Santoso",
		Plan:         models.PlanPro,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	websiteID := "ws-mebeljaya-001"
	demoWebsite := models.Website{
		ID:             websiteID,
		UserID:         userID,
		Subdomain:      "mebeljaya",
		BusinessName:   "Mebel Jaya Abadi",
		Tagline:        "Spesialis Furnitur Kayu Jati Jepara Kualitas Ekspor",
		Description:    "Mebel Jaya Abadi adalah produsen langsung kerajinan mebel kayu jati dan mahoni asli Jepara. Menyediakan set meja makan, sofa tamu minimalis, lemari pakaian, dan interior custom.",
		Address:        "Jl. Pemuda No. 45, Tahunan, Jepara, Jawa Tengah",
		Phone:          "+62 812-3456-7890",
		Email:          "halo@mebeljaya.com",
		WhatsApp:       "6281234567890",
		Instagram:      "mebeljaya.id",
		Facebook:       "MebelJayaAbadi",
		TikTok:         "mebeljayaofficial",
		LogoURL:        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&auto=format&fit=crop&q=80",
		ThemeID:        "solid",
		PrimaryColor:   "#2563eb",
		OperatingHours:     "Senin - Sabtu: 08:00 - 17:00 WIB",
		BankName:           "Bank Central Asia (BCA)",
		BankAccountNo:      "8830-1928-41",
		BankAccountName:    "Mebel Jaya Abadi",
		QRISImageURL:       "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.LINKAJA.WWW01189360091438830192845204581253033605802ID5916MEBEL+JAYA+ABADI6006JEPARA62070703A01630489AB",
		EnableBankTransfer: true,
		EnableCOD:          true,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	products := []models.Product{
		{
			ID:          "prod-001",
			WebsiteID:   websiteID,
			Name:        "Meja Makan Kayu Jati Solid 6 Kursi",
			Slug:        "meja-makan-jati-solid-6-kursi",
			Description: "Set meja makan kayu jati solid tanpa sambungan dengan 6 kursi ergonomis. Finishing natural teak oil tahan gores.",
			Price:       4850000,
			Category:    "Ruang Makan",
			ImageURL:    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80",
			Status:      models.ProductStatusPublished,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          "prod-002",
			WebsiteID:   websiteID,
			Name:        "Sofa Tamu Minimalis Scandinavian 3 Seater",
			Slug:        "sofa-tamu-minimalis-scandinavian",
			Description: "Rangka kayu mahoni oven solid anti rayap dengan bantalan busa royal foam empuk berlapis kain kanvas premium.",
			Price:       3200000,
			Category:    "Ruang Tamu",
			ImageURL:    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
			Status:      models.ProductStatusPublished,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          "prod-003",
			WebsiteID:   websiteID,
			Name:        "Lemari Pakaian 3 Pintu Kaca Tempered",
			Slug:        "lemari-pakaian-3-pintu-kaca",
			Description: "Lemari pakaian desain modern dengan kaca tempered, laci perhiasan dengan kunci, dan lampu LED sensor gerak.",
			Price:       5400000,
			Category:    "Kamar Tidur",
			ImageURL:    "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80",
			Status:      models.ProductStatusPublished,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          "prod-004",
			WebsiteID:   websiteID,
			Name:        "Meja Kerja Ergonomis Jati Industrial",
			Slug:        "meja-kerja-jati-industrial",
			Description: "Kombinasi kayu jati tua dengan rangka besi hollow tebal berfinishing powder coating hitam doff.",
			Price:       1850000,
			Category:    "Ruang Kerja",
			ImageURL:    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
			Status:      models.ProductStatusPublished,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	testimonials := []models.Testimonial{
		{
			ID:            "testi-001",
			WebsiteID:     websiteID,
			ClientName:    "Drs. Bambang Wijaya",
			RoleOrCompany: "Pemilik Cafe Kopi Senja, Bandung",
			Feedback:      "Pesan 12 set meja kursi cafe di Mebel Jaya Abadi. Pengiriman tepat waktu dan kayunya benar-benar jati tua solid. Sangat puas!",
			Rating:        5,
			AvatarURL:     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
			CreatedAt:     now,
		},
		{
			ID:            "testi-002",
			WebsiteID:     websiteID,
			ClientName:    "Ibu Rini Kartika",
			RoleOrCompany: "Residensial, Jakarta Selatan",
			Feedback:      "Sofa Scandinavian dan meja makannya sangat estetik di ruang tamu baru kami. Pelayanan konsultasi via WA ramah sekali.",
			Rating:        5,
			AvatarURL:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
			CreatedAt:     now,
		},
	}

	galleries := []models.GalleryItem{
		{
			ID:        "gal-001",
			WebsiteID: websiteID,
			Title:     "Proses Perakitan Meja Jati",
			ImageURL:  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
			Order:     1,
			CreatedAt: now,
		},
		{
			ID:        "gal-002",
			WebsiteID: websiteID,
			Title:     "Finishing Natural Teak Oil",
			ImageURL:  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&auto=format&fit=crop&q=80",
			Order:     2,
			CreatedAt: now,
		},
		{
			ID:        "gal-003",
			WebsiteID: websiteID,
			Title:     "Showroom Mebel Jaya Jepara",
			ImageURL:  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80",
			Order:     3,
			CreatedAt: now,
		},
	}

	s.data = DatabaseSchema{
		Users:        []models.User{demoUser},
		Websites:     []models.Website{demoWebsite},
		Products:     products,
		Assets:       []models.Asset{},
		Sections:     DefaultSections(websiteID),
		Testimonials: testimonials,
		Galleries:    galleries,
	}
}

// User methods
func (s *JSONStore) CreateUser(user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, u := range s.data.Users {
		if u.Email == user.Email {
			return errors.New("email already exists")
		}
	}
	s.data.Users = append(s.data.Users, *user)
	return s.saveToFile()
}

func (s *JSONStore) GetUserByEmail(email string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, u := range s.data.Users {
		if u.Email == email {
			userCopy := u
			return &userCopy, nil
		}
	}
	return nil, errors.New("user not found")
}

func (s *JSONStore) GetUserByID(id string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, u := range s.data.Users {
		if u.ID == id {
			userCopy := u
			return &userCopy, nil
		}
	}
	return nil, errors.New("user not found")
}

func (s *JSONStore) UpdateUser(user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, u := range s.data.Users {
		if u.ID == user.ID {
			s.data.Users[i] = *user
			return s.saveToFile()
		}
	}
	return errors.New("user not found")
}

// Website methods
func (s *JSONStore) CreateWebsite(ws *models.Website) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, w := range s.data.Websites {
		if w.Subdomain == ws.Subdomain {
			return errors.New("subdomain already taken")
		}
	}
	s.data.Websites = append(s.data.Websites, *ws)
	return s.saveToFile()
}

func (s *JSONStore) GetWebsiteByID(id string) (*models.Website, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, w := range s.data.Websites {
		if w.ID == id {
			copy := w
			return &copy, nil
		}
	}
	return nil, errors.New("website not found")
}

func (s *JSONStore) GetWebsiteByUserID(userID string) (*models.Website, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, w := range s.data.Websites {
		if w.UserID == userID {
			copy := w
			return &copy, nil
		}
	}
	return nil, errors.New("website not found for user")
}

func (s *JSONStore) GetWebsiteBySubdomain(subdomain string) (*models.Website, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, w := range s.data.Websites {
		if w.Subdomain == subdomain {
			copy := w
			return &copy, nil
		}
	}
	return nil, errors.New("website not found")
}

func (s *JSONStore) UpdateWebsite(ws *models.Website) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, w := range s.data.Websites {
		if w.ID == ws.ID {
			s.data.Websites[i] = *ws
			return s.saveToFile()
		}
	}
	return errors.New("website not found")
}

// Category methods
func (s *JSONStore) GetCategoriesByWebsiteID(websiteID string) ([]models.Category, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.Category, 0)
	for _, c := range s.data.Categories {
		if c.WebsiteID == websiteID {
			result = append(result, c)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})
	return result, nil
}

func (s *JSONStore) GetCategoryByID(id string) (*models.Category, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, c := range s.data.Categories {
		if c.ID == id {
			return &c, nil
		}
	}
	return nil, errors.New("kategori tidak ditemukan")
}

func (s *JSONStore) CreateCategory(c *models.Category) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, existing := range s.data.Categories {
		if existing.WebsiteID == c.WebsiteID && strings.EqualFold(existing.Name, c.Name) {
			return errors.New("kategori dengan nama ini sudah ada")
		}
	}

	s.data.Categories = append(s.data.Categories, *c)
	return s.saveToFile()
}

func (s *JSONStore) UpdateCategory(c *models.Category) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, existing := range s.data.Categories {
		if existing.ID == c.ID && existing.WebsiteID == c.WebsiteID {
			s.data.Categories[i] = *c
			return s.saveToFile()
		}
	}
	return errors.New("kategori tidak ditemukan")
}

func (s *JSONStore) DeleteCategory(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	found := false
	var updated []models.Category
	for _, c := range s.data.Categories {
		if c.ID == id {
			found = true
			continue
		}
		updated = append(updated, c)
	}
	if !found {
		return errors.New("kategori tidak ditemukan")
	}
	s.data.Categories = updated
	return s.saveToFile()
}

// Product methods
func (s *JSONStore) GetProductsByWebsiteID(websiteID string) ([]models.Product, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.Product, 0)
	for _, p := range s.data.Products {
		if p.WebsiteID == websiteID {
			result = append(result, p)
		}
	}
	return result, nil
}

func (s *JSONStore) CountProductsByWebsiteID(websiteID string) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	count := 0
	for _, p := range s.data.Products {
		if p.WebsiteID == websiteID {
			count++
		}
	}
	return count, nil
}

func (s *JSONStore) GetProductByID(id string) (*models.Product, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, p := range s.data.Products {
		if p.ID == id {
			copy := p
			return &copy, nil
		}
	}
	return nil, errors.New("product not found")
}

func (s *JSONStore) CreateProduct(p *models.Product) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.Products = append(s.data.Products, *p)
	return s.saveToFile()
}

func (s *JSONStore) UpdateProduct(p *models.Product) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, prod := range s.data.Products {
		if prod.ID == p.ID {
			s.data.Products[i] = *p
			return s.saveToFile()
		}
	}
	return errors.New("product not found")
}

func (s *JSONStore) DeleteProduct(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	found := false
	var updated []models.Product
	for _, p := range s.data.Products {
		if p.ID == id {
			found = true
			continue
		}
		updated = append(updated, p)
	}
	if !found {
		return errors.New("product not found")
	}
	s.data.Products = updated
	return s.saveToFile()
}

// Asset methods
func (s *JSONStore) GetAssetsByWebsiteID(websiteID string) ([]models.Asset, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.Asset, 0)
	for _, a := range s.data.Assets {
		if a.WebsiteID == websiteID {
			result = append(result, a)
		}
	}
	return result, nil
}

func (s *JSONStore) CreateAsset(a *models.Asset) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.Assets = append(s.data.Assets, *a)
	return s.saveToFile()
}

func (s *JSONStore) DeleteAsset(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	found := false
	var updated []models.Asset
	for _, a := range s.data.Assets {
		if a.ID == id {
			found = true
			continue
		}
		updated = append(updated, a)
	}
	if !found {
		return errors.New("asset not found")
	}
	s.data.Assets = updated
	return s.saveToFile()
}

// Section methods
func (s *JSONStore) GetSectionsByWebsiteID(websiteID string) ([]models.SectionConfig, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.SectionConfig, 0)
	for _, sec := range s.data.Sections {
		if sec.WebsiteID == websiteID {
			result = append(result, sec)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Order < result[j].Order
	})
	return result, nil
}

func (s *JSONStore) SaveSections(websiteID string, sections []models.SectionConfig) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Filter out existing sections for this website
	var retained []models.SectionConfig
	for _, sec := range s.data.Sections {
		if sec.WebsiteID != websiteID {
			retained = append(retained, sec)
		}
	}
	s.data.Sections = append(retained, sections...)
	return s.saveToFile()
}

// Testimonials
func (s *JSONStore) GetTestimonialsByWebsiteID(websiteID string) ([]models.Testimonial, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.Testimonial, 0)
	for _, t := range s.data.Testimonials {
		if t.WebsiteID == websiteID {
			result = append(result, t)
		}
	}
	return result, nil
}

func (s *JSONStore) CreateTestimonial(t *models.Testimonial) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.Testimonials = append(s.data.Testimonials, *t)
	return s.saveToFile()
}

func (s *JSONStore) DeleteTestimonial(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	found := false
	var updated []models.Testimonial
	for _, t := range s.data.Testimonials {
		if t.ID == id {
			found = true
			continue
		}
		updated = append(updated, t)
	}
	if !found {
		return errors.New("testimonial not found")
	}
	s.data.Testimonials = updated
	return s.saveToFile()
}

// Gallery
func (s *JSONStore) GetGalleriesByWebsiteID(websiteID string) ([]models.GalleryItem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.GalleryItem, 0)
	for _, g := range s.data.Galleries {
		if g.WebsiteID == websiteID {
			result = append(result, g)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Order < result[j].Order
	})
	return result, nil
}

func (s *JSONStore) CreateGalleryItem(g *models.GalleryItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.Galleries = append(s.data.Galleries, *g)
	return s.saveToFile()
}

func (s *JSONStore) DeleteGalleryItem(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	found := false
	var updated []models.GalleryItem
	for _, g := range s.data.Galleries {
		if g.ID == id {
			found = true
			continue
		}
		updated = append(updated, g)
	}
	if !found {
		return errors.New("gallery item not found")
	}
	s.data.Galleries = updated
	return s.saveToFile()
}

// Public Website Data Aggregation
func (s *JSONStore) GetPublicWebsiteData(subdomain string) (*models.PublicWebsiteData, error) {
	ws, err := s.GetWebsiteBySubdomain(subdomain)
	if err != nil {
		return nil, err
	}

	products, _ := s.GetProductsByWebsiteID(ws.ID)
	// Only published products for public
	publishedProducts := make([]models.Product, 0)
	for _, p := range products {
		if p.Status == models.ProductStatusPublished {
			publishedProducts = append(publishedProducts, p)
		}
	}

	categories, _ := s.GetCategoriesByWebsiteID(ws.ID)
	if categories == nil {
		categories = make([]models.Category, 0)
	}

	sections, _ := s.GetSectionsByWebsiteID(ws.ID)
	if len(sections) == 0 {
		sections = DefaultSections(ws.ID)
		_ = s.SaveSections(ws.ID, sections)
	} else {
		// Ensure promos and categories sections exist for existing websites
		hasPromos := false
		hasCategories := false
		for _, sec := range sections {
			if sec.Type == models.SectionPromos {
				hasPromos = true
			}
			if sec.Type == models.SectionCategories {
				hasCategories = true
			}
		}
		needSave := false
		if !hasPromos {
			sections = append(sections, models.SectionConfig{
				ID:        uuid.New().String(),
				WebsiteID: ws.ID,
				Type:      models.SectionPromos,
				Title:     "Promo Spesial Diskon & Kupon Belanja",
				Subtitle:  "Klaim voucher kupon diskon eksklusif untuk hemat lebih banyak hari ini!",
				Variant:   "coupon-ticket",
				IsVisible: true,
				Order:     2,
			})
			needSave = true
		}
		if !hasCategories {
			sections = append(sections, models.SectionConfig{
				ID:        uuid.New().String(),
				WebsiteID: ws.ID,
				Type:      models.SectionCategories,
				Title:     "Kategori Pilihan",
				Subtitle:  "Pilih kategori untuk memfilter koleksi produk favorit Anda.",
				Variant:   "circle-avatar",
				IsVisible: true,
				Order:     3,
			})
			needSave = true
		}
		if needSave {
			_ = s.SaveSections(ws.ID, sections)
		}
	}

	testimonials, _ := s.GetTestimonialsByWebsiteID(ws.ID)
	if testimonials == nil {
		testimonials = make([]models.Testimonial, 0)
	}

	galleries, _ := s.GetGalleriesByWebsiteID(ws.ID)
	if galleries == nil {
		galleries = make([]models.GalleryItem, 0)
	}

	assets, _ := s.GetAssetsByWebsiteID(ws.ID)
	if assets == nil {
		assets = make([]models.Asset, 0)
	}

	return &models.PublicWebsiteData{
		Website:      ws,
		Categories:   categories,
		Products:     publishedProducts,
		Sections:     sections,
		Testimonials: testimonials,
		Galleries:    galleries,
		Assets:       assets,
	}, nil
}

// Order methods (E-Commerce)
func (s *JSONStore) CreateOrder(order *models.Order) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.Orders = append(s.data.Orders, *order)
	return s.saveToFile()
}

func (s *JSONStore) GetOrdersByWebsiteID(websiteID string) ([]models.Order, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.Order, 0)
	for _, o := range s.data.Orders {
		if o.WebsiteID == websiteID {
			result = append(result, o)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt.After(result[j].CreatedAt)
	})
	return result, nil
}

func (s *JSONStore) GetOrderByID(orderID string) (*models.Order, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, o := range s.data.Orders {
		if o.ID == orderID {
			copy := o
			return &copy, nil
		}
	}
	return nil, errors.New("order not found")
}

func (s *JSONStore) GetOrderByNumber(websiteID string, orderNumber string) (*models.Order, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, o := range s.data.Orders {
		if o.WebsiteID == websiteID && o.OrderNumber == orderNumber {
			copy := o
			return &copy, nil
		}
	}
	return nil, errors.New("pesanan tidak ditemukan")
}

func (s *JSONStore) UpdateOrderStatus(orderID string, status models.OrderStatus) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, o := range s.data.Orders {
		if o.ID == orderID {
			s.data.Orders[i].Status = status
			s.data.Orders[i].UpdatedAt = time.Now()
			return s.saveToFile()
		}
	}
	return errors.New("pesanan tidak ditemukan")
}

func (s *JSONStore) UpdateOrder(order *models.Order) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, o := range s.data.Orders {
		if o.ID == order.ID {
			order.UpdatedAt = time.Now()
			s.data.Orders[i] = *order
			return s.saveToFile()
		}
	}
	return errors.New("pesanan tidak ditemukan")
}

