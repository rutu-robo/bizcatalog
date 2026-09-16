package repository

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"bizcatalog/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// LegacyDatabaseSchema represents the old single-file monolithic structure for migration.
type LegacyDatabaseSchema struct {
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

// JSONStore implements Repository using separated per-table file storage.
type JSONStore struct {
	tablesDir         string
	legacyFilePath    string
	usersTable        *TableStore[models.User]
	websitesTable     *TableStore[models.Website]
	categoriesTable   *TableStore[models.Category]
	productsTable     *TableStore[models.Product]
	assetsTable       *TableStore[models.Asset]
	sectionsTable     *TableStore[models.SectionConfig]
	testimonialsTable *TableStore[models.Testimonial]
	galleriesTable    *TableStore[models.GalleryItem]
	ordersTable       *TableStore[models.Order]
}

// NewJSONStore creates or migrates to a separated per-table storage system.
func NewJSONStore(basePath string) (*JSONStore, error) {
	var tablesDir, legacyFilePath string
	if strings.HasSuffix(basePath, ".json") {
		legacyFilePath = basePath
		tablesDir = filepath.Join(filepath.Dir(basePath), "tables")
	} else {
		tablesDir = filepath.Join(basePath, "tables")
		legacyFilePath = filepath.Join(basePath, "db.json")
	}

	if err := os.MkdirAll(tablesDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create tables directory %s: %w", tablesDir, err)
	}

	store := &JSONStore{
		tablesDir:         tablesDir,
		legacyFilePath:    legacyFilePath,
		usersTable:        NewTableStore[models.User](filepath.Join(tablesDir, "users.json")),
		websitesTable:     NewTableStore[models.Website](filepath.Join(tablesDir, "websites.json")),
		categoriesTable:   NewTableStore[models.Category](filepath.Join(tablesDir, "categories.json")),
		productsTable:     NewTableStore[models.Product](filepath.Join(tablesDir, "products.json")),
		assetsTable:       NewTableStore[models.Asset](filepath.Join(tablesDir, "assets.json")),
		sectionsTable:     NewTableStore[models.SectionConfig](filepath.Join(tablesDir, "sections.json")),
		testimonialsTable: NewTableStore[models.Testimonial](filepath.Join(tablesDir, "testimonials.json")),
		galleriesTable:    NewTableStore[models.GalleryItem](filepath.Join(tablesDir, "galleries.json")),
		ordersTable:       NewTableStore[models.Order](filepath.Join(tablesDir, "orders.json")),
	}

	// Determine if migration from legacy db.json is needed
	needsMigration := !store.usersTable.Exists() || !store.websitesTable.Exists()
	if needsMigration && fileExists(legacyFilePath) {
		log.Printf("[BizCatalog DB] Menginisialisasi pemisahan database modular dari file monolitik: %s", legacyFilePath)
		if err := store.migrateFromLegacyDB(legacyFilePath); err != nil {
			log.Printf("[BizCatalog DB] Warning: Migrasi dari legacy gagal: %v, beralih ke seed default", err)
			store.initSeedData()
		}
	} else if !store.usersTable.Exists() {
		log.Printf("[BizCatalog DB] Tidak ada database lama ditemukan. Menginisialisasi seed data ke tables terpisah.")
		store.initSeedData()
	}

	// Auto-repair common data anomalies
	store.autoRepair()

	log.Printf("[BizCatalog DB] Database Modular Terpisah aktif di: %s", tablesDir)
	return store, nil
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

// migrateFromLegacyDB reads db.json and splits it into dedicated table files.
func (s *JSONStore) migrateFromLegacyDB(legacyPath string) error {
	content, err := os.ReadFile(legacyPath)
	if err != nil {
		return err
	}
	if len(content) == 0 {
		return errors.New("legacy db file is empty")
	}

	var legacy LegacyDatabaseSchema
	if err := json.Unmarshal(content, &legacy); err != nil {
		return fmt.Errorf("failed to parse legacy db: %w", err)
	}

	_ = s.usersTable.saveRecords(legacy.Users)
	_ = s.websitesTable.saveRecords(legacy.Websites)
	_ = s.categoriesTable.saveRecords(legacy.Categories)
	_ = s.productsTable.saveRecords(legacy.Products)
	_ = s.assetsTable.saveRecords(legacy.Assets)
	_ = s.sectionsTable.saveRecords(legacy.Sections)
	_ = s.testimonialsTable.saveRecords(legacy.Testimonials)
	_ = s.galleriesTable.saveRecords(legacy.Galleries)
	_ = s.ordersTable.saveRecords(legacy.Orders)

	log.Printf("[BizCatalog DB] Berhasil memisahkan %d users, %d websites, %d products, %d categories, %d orders ke tables terpisah.",
		len(legacy.Users), len(legacy.Websites), len(legacy.Products), len(legacy.Categories), len(legacy.Orders))
	return nil
}

// autoRepair ensures passwords, banks, and categories are in consistent shape.
func (s *JSONStore) autoRepair() {
	// 1. Repair users password if empty
	_ = s.usersTable.Write(func(users *[]models.User) error {
		for i := range *users {
			if (*users)[i].PasswordHash == "" && (*users)[i].Email == "demo@bizcatalog.com" {
				h, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
				(*users)[i].PasswordHash = string(h)
			}
		}
		return nil
	})

	// 2. Repair demo website bank info
	_ = s.websitesTable.Write(func(websites *[]models.Website) error {
		for i := range *websites {
			if (*websites)[i].Subdomain == "mebeljaya" && (*websites)[i].BankName == "" {
				(*websites)[i].BankName = "Bank Central Asia (BCA)"
				(*websites)[i].BankAccountNo = "8830-1928-41"
				(*websites)[i].BankAccountName = "Mebel Jaya Abadi"
				(*websites)[i].QRISImageURL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.LINKAJA.WWW01189360091438830192845204581253033605802ID5916MEBEL+JAYA+ABADI6006JEPARA62070703A01630489AB"
				(*websites)[i].EnableBankTransfer = true
				(*websites)[i].EnableCOD = true
			}
		}
		return nil
	})

	// 3. Auto-seed categories from existing products if empty
	var products []models.Product
	_ = s.productsTable.Read(func(prods []models.Product) error {
		products = prods
		return nil
	})

	_ = s.categoriesTable.Write(func(cats *[]models.Category) error {
		if len(*cats) == 0 && len(products) > 0 {
			catMap := make(map[string]bool)
			now := time.Now()
			for _, p := range products {
				if p.Category != "" {
					key := p.WebsiteID + ":" + p.Category
					if !catMap[key] {
						catMap[key] = true
						slug := strings.ToLower(strings.ReplaceAll(p.Category, " ", "-"))
						*cats = append(*cats, models.Category{
							ID:        "cat-" + uuid.New().String()[:8],
							WebsiteID: p.WebsiteID,
							Name:      p.Category,
							Slug:      slug,
							CreatedAt: now,
							UpdatedAt: now,
						})
					}
				}
			}
		}
		return nil
	})
}

// DefaultSections returns standard sections with 7 modern e-commerce blocks
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
		ID:                 websiteID,
		UserID:             userID,
		Subdomain:          "mebeljaya",
		BusinessName:       "Mebel Jaya Abadi",
		Tagline:            "Spesialis Furnitur Kayu Jati Jepara Kualitas Ekspor",
		Description:        "Mebel Jaya Abadi adalah produsen langsung kerajinan mebel kayu jati dan mahoni asli Jepara. Menyediakan set meja makan, sofa tamu minimalis, lemari pakaian, dan interior custom.",
		Address:            "Jl. Pemuda No. 45, Tahunan, Jepara, Jawa Tengah",
		Phone:              "+62 812-3456-7890",
		Email:              "halo@mebeljaya.com",
		WhatsApp:           "6281234567890",
		Instagram:          "mebeljaya.id",
		Facebook:           "MebelJayaAbadi",
		TikTok:             "mebeljayaofficial",
		LogoURL:            "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&auto=format&fit=crop&q=80",
		ThemeID:            "solid",
		HeaderStyle:        "dynamic-scroll",
		PrimaryColor:       "#2563eb",
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

	_ = s.usersTable.saveRecords([]models.User{demoUser})
	_ = s.websitesTable.saveRecords([]models.Website{demoWebsite})
	_ = s.productsTable.saveRecords(products)
	_ = s.assetsTable.saveRecords([]models.Asset{})
	_ = s.sectionsTable.saveRecords(DefaultSections(websiteID))
	_ = s.testimonialsTable.saveRecords(testimonials)
	_ = s.galleriesTable.saveRecords(galleries)
	_ = s.ordersTable.saveRecords([]models.Order{})
}

// ============================================================================
// USER METHODS
// ============================================================================

func (s *JSONStore) CreateUser(user *models.User) error {
	return s.usersTable.Write(func(users *[]models.User) error {
		for _, u := range *users {
			if u.Email == user.Email {
				return errors.New("email already exists")
			}
		}
		*users = append(*users, *user)
		return nil
	})
}

func (s *JSONStore) GetUserByEmail(email string) (*models.User, error) {
	var found *models.User
	err := s.usersTable.Read(func(users []models.User) error {
		for _, u := range users {
			if u.Email == email {
				userCopy := u
				found = &userCopy
				return nil
			}
		}
		return errors.New("user not found")
	})
	return found, err
}

func (s *JSONStore) GetUserByID(id string) (*models.User, error) {
	var found *models.User
	err := s.usersTable.Read(func(users []models.User) error {
		for _, u := range users {
			if u.ID == id {
				userCopy := u
				found = &userCopy
				return nil
			}
		}
		return errors.New("user not found")
	})
	return found, err
}

func (s *JSONStore) UpdateUser(user *models.User) error {
	return s.usersTable.Write(func(users *[]models.User) error {
		for i, u := range *users {
			if u.ID == user.ID {
				(*users)[i] = *user
				return nil
			}
		}
		return errors.New("user not found")
	})
}

// ============================================================================
// WEBSITE METHODS
// ============================================================================

func (s *JSONStore) CreateWebsite(ws *models.Website) error {
	return s.websitesTable.Write(func(websites *[]models.Website) error {
		for _, w := range *websites {
			if w.Subdomain == ws.Subdomain {
				return errors.New("subdomain already taken")
			}
		}
		*websites = append(*websites, *ws)
		return nil
	})
}

func (s *JSONStore) GetWebsiteByID(id string) (*models.Website, error) {
	var found *models.Website
	err := s.websitesTable.Read(func(websites []models.Website) error {
		for _, w := range websites {
			if w.ID == id {
				copy := w
				found = &copy
				return nil
			}
		}
		return errors.New("website not found")
	})
	return found, err
}

func (s *JSONStore) GetWebsiteByUserID(userID string) (*models.Website, error) {
	var found *models.Website
	err := s.websitesTable.Read(func(websites []models.Website) error {
		for _, w := range websites {
			if w.UserID == userID {
				copy := w
				found = &copy
				return nil
			}
		}
		return errors.New("website not found for user")
	})
	return found, err
}

func (s *JSONStore) GetWebsiteBySubdomain(subdomain string) (*models.Website, error) {
	var found *models.Website
	err := s.websitesTable.Read(func(websites []models.Website) error {
		for _, w := range websites {
			if w.Subdomain == subdomain {
				copy := w
				found = &copy
				return nil
			}
		}
		return errors.New("website not found")
	})
	return found, err
}

func (s *JSONStore) UpdateWebsite(ws *models.Website) error {
	return s.websitesTable.Write(func(websites *[]models.Website) error {
		for i, w := range *websites {
			if w.ID == ws.ID {
				(*websites)[i] = *ws
				return nil
			}
		}
		return errors.New("website not found")
	})
}

// ============================================================================
// CATEGORY METHODS
// ============================================================================

func (s *JSONStore) GetCategoriesByWebsiteID(websiteID string) ([]models.Category, error) {
	var result []models.Category
	err := s.categoriesTable.Read(func(cats []models.Category) error {
		result = make([]models.Category, 0)
		for _, c := range cats {
			if c.WebsiteID == websiteID {
				result = append(result, c)
			}
		}
		sort.Slice(result, func(i, j int) bool {
			return result[i].Name < result[j].Name
		})
		return nil
	})
	return result, err
}

func (s *JSONStore) GetCategoryByID(id string) (*models.Category, error) {
	var found *models.Category
	err := s.categoriesTable.Read(func(cats []models.Category) error {
		for _, c := range cats {
			if c.ID == id {
				copy := c
				found = &copy
				return nil
			}
		}
		return errors.New("kategori tidak ditemukan")
	})
	return found, err
}

func (s *JSONStore) CreateCategory(c *models.Category) error {
	return s.categoriesTable.Write(func(cats *[]models.Category) error {
		for _, existing := range *cats {
			if existing.WebsiteID == c.WebsiteID && strings.EqualFold(existing.Name, c.Name) {
				return errors.New("kategori dengan nama ini sudah ada")
			}
		}
		*cats = append(*cats, *c)
		return nil
	})
}

func (s *JSONStore) UpdateCategory(c *models.Category) error {
	return s.categoriesTable.Write(func(cats *[]models.Category) error {
		for i, existing := range *cats {
			if existing.ID == c.ID && existing.WebsiteID == c.WebsiteID {
				(*cats)[i] = *c
				return nil
			}
		}
		return errors.New("kategori tidak ditemukan")
	})
}

func (s *JSONStore) DeleteCategory(id string) error {
	return s.categoriesTable.Write(func(cats *[]models.Category) error {
		found := false
		var updated []models.Category
		for _, c := range *cats {
			if c.ID == id {
				found = true
				continue
			}
			updated = append(updated, c)
		}
		if !found {
			return errors.New("kategori tidak ditemukan")
		}
		*cats = updated
		return nil
	})
}

// ============================================================================
// PRODUCT METHODS
// ============================================================================

func (s *JSONStore) GetProductsByWebsiteID(websiteID string) ([]models.Product, error) {
	var result []models.Product
	err := s.productsTable.Read(func(products []models.Product) error {
		result = make([]models.Product, 0)
		for _, p := range products {
			if p.WebsiteID == websiteID {
				result = append(result, p)
			}
		}
		return nil
	})
	return result, err
}

func (s *JSONStore) CountProductsByWebsiteID(websiteID string) (int, error) {
	count := 0
	err := s.productsTable.Read(func(products []models.Product) error {
		for _, p := range products {
			if p.WebsiteID == websiteID {
				count++
			}
		}
		return nil
	})
	return count, err
}

func (s *JSONStore) GetProductByID(id string) (*models.Product, error) {
	var found *models.Product
	err := s.productsTable.Read(func(products []models.Product) error {
		for _, p := range products {
			if p.ID == id {
				copy := p
				found = &copy
				return nil
			}
		}
		return errors.New("product not found")
	})
	return found, err
}

func (s *JSONStore) CreateProduct(p *models.Product) error {
	return s.productsTable.Write(func(products *[]models.Product) error {
		*products = append(*products, *p)
		return nil
	})
}

func (s *JSONStore) UpdateProduct(p *models.Product) error {
	return s.productsTable.Write(func(products *[]models.Product) error {
		for i, prod := range *products {
			if prod.ID == p.ID {
				(*products)[i] = *p
				return nil
			}
		}
		return errors.New("product not found")
	})
}

func (s *JSONStore) DeleteProduct(id string) error {
	return s.productsTable.Write(func(products *[]models.Product) error {
		found := false
		var updated []models.Product
		for _, prod := range *products {
			if prod.ID == id {
				found = true
				continue
			}
			updated = append(updated, prod)
		}
		if !found {
			return errors.New("product not found")
		}
		*products = updated
		return nil
	})
}

// ============================================================================
// ASSET METHODS
// ============================================================================

func (s *JSONStore) GetAssetsByWebsiteID(websiteID string) ([]models.Asset, error) {
	var result []models.Asset
	err := s.assetsTable.Read(func(assets []models.Asset) error {
		result = make([]models.Asset, 0)
		for _, a := range assets {
			if a.WebsiteID == websiteID {
				result = append(result, a)
			}
		}
		return nil
	})
	return result, err
}

func (s *JSONStore) CreateAsset(a *models.Asset) error {
	return s.assetsTable.Write(func(assets *[]models.Asset) error {
		*assets = append(*assets, *a)
		return nil
	})
}

func (s *JSONStore) DeleteAsset(id string) error {
	return s.assetsTable.Write(func(assets *[]models.Asset) error {
		found := false
		var updated []models.Asset
		for _, a := range *assets {
			if a.ID == id {
				found = true
				continue
			}
			updated = append(updated, a)
		}
		if !found {
			return errors.New("asset not found")
		}
		*assets = updated
		return nil
	})
}

// ============================================================================
// SECTION METHODS
// ============================================================================

func (s *JSONStore) GetSectionsByWebsiteID(websiteID string) ([]models.SectionConfig, error) {
	var result []models.SectionConfig
	err := s.sectionsTable.Read(func(secs []models.SectionConfig) error {
		result = make([]models.SectionConfig, 0)
		for _, sec := range secs {
			if sec.WebsiteID == websiteID {
				result = append(result, sec)
			}
		}
		sort.Slice(result, func(i, j int) bool {
			return result[i].Order < result[j].Order
		})
		return nil
	})
	return result, err
}

func (s *JSONStore) SaveSections(websiteID string, sections []models.SectionConfig) error {
	return s.sectionsTable.Write(func(secs *[]models.SectionConfig) error {
		var retained []models.SectionConfig
		for _, sec := range *secs {
			if sec.WebsiteID != websiteID {
				retained = append(retained, sec)
			}
		}
		*secs = append(retained, sections...)
		return nil
	})
}

// ============================================================================
// TESTIMONIAL METHODS
// ============================================================================

func (s *JSONStore) GetTestimonialsByWebsiteID(websiteID string) ([]models.Testimonial, error) {
	var result []models.Testimonial
	err := s.testimonialsTable.Read(func(tests []models.Testimonial) error {
		result = make([]models.Testimonial, 0)
		for _, t := range tests {
			if t.WebsiteID == websiteID {
				result = append(result, t)
			}
		}
		return nil
	})
	return result, err
}

func (s *JSONStore) CreateTestimonial(t *models.Testimonial) error {
	return s.testimonialsTable.Write(func(tests *[]models.Testimonial) error {
		*tests = append(*tests, *t)
		return nil
	})
}

func (s *JSONStore) DeleteTestimonial(id string) error {
	return s.testimonialsTable.Write(func(tests *[]models.Testimonial) error {
		found := false
		var updated []models.Testimonial
		for _, t := range *tests {
			if t.ID == id {
				found = true
				continue
			}
			updated = append(updated, t)
		}
		if !found {
			return errors.New("testimonial not found")
		}
		*tests = updated
		return nil
	})
}

// ============================================================================
// GALLERY METHODS
// ============================================================================

func (s *JSONStore) GetGalleriesByWebsiteID(websiteID string) ([]models.GalleryItem, error) {
	var result []models.GalleryItem
	err := s.galleriesTable.Read(func(gals []models.GalleryItem) error {
		result = make([]models.GalleryItem, 0)
		for _, g := range gals {
			if g.WebsiteID == websiteID {
				result = append(result, g)
			}
		}
		sort.Slice(result, func(i, j int) bool {
			return result[i].Order < result[j].Order
		})
		return nil
	})
	return result, err
}

func (s *JSONStore) CreateGalleryItem(g *models.GalleryItem) error {
	return s.galleriesTable.Write(func(gals *[]models.GalleryItem) error {
		*gals = append(*gals, *g)
		return nil
	})
}

func (s *JSONStore) DeleteGalleryItem(id string) error {
	return s.galleriesTable.Write(func(gals *[]models.GalleryItem) error {
		found := false
		var updated []models.GalleryItem
		for _, g := range *gals {
			if g.ID == id {
				found = true
				continue
			}
			updated = append(updated, g)
		}
		if !found {
			return errors.New("gallery item not found")
		}
		*gals = updated
		return nil
	})
}

// ============================================================================
// PUBLIC WEBSITE DATA AGGREGATION
// ============================================================================

func (s *JSONStore) GetPublicWebsiteData(subdomain string) (*models.PublicWebsiteData, error) {
	ws, err := s.GetWebsiteBySubdomain(subdomain)
	if err != nil {
		return nil, err
	}

	products, _ := s.GetProductsByWebsiteID(ws.ID)
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

// ============================================================================
// ORDER METHODS (E-COMMERCE)
// ============================================================================

func (s *JSONStore) CreateOrder(order *models.Order) error {
	return s.ordersTable.Write(func(orders *[]models.Order) error {
		*orders = append(*orders, *order)
		return nil
	})
}

func (s *JSONStore) GetOrdersByWebsiteID(websiteID string) ([]models.Order, error) {
	var result []models.Order
	err := s.ordersTable.Read(func(orders []models.Order) error {
		result = make([]models.Order, 0)
		for _, o := range orders {
			if o.WebsiteID == websiteID {
				result = append(result, o)
			}
		}
		sort.Slice(result, func(i, j int) bool {
			return result[i].CreatedAt.After(result[j].CreatedAt)
		})
		return nil
	})
	return result, err
}

func (s *JSONStore) GetOrderByID(orderID string) (*models.Order, error) {
	var found *models.Order
	err := s.ordersTable.Read(func(orders []models.Order) error {
		for _, o := range orders {
			if o.ID == orderID {
				copy := o
				found = &copy
				return nil
			}
		}
		return errors.New("order not found")
	})
	return found, err
}

func (s *JSONStore) GetOrderByNumber(websiteID string, orderNumber string) (*models.Order, error) {
	var found *models.Order
	err := s.ordersTable.Read(func(orders []models.Order) error {
		for _, o := range orders {
			if o.WebsiteID == websiteID && o.OrderNumber == orderNumber {
				copy := o
				found = &copy
				return nil
			}
		}
		return errors.New("pesanan tidak ditemukan")
	})
	return found, err
}

func (s *JSONStore) UpdateOrderStatus(orderID string, status models.OrderStatus) error {
	return s.ordersTable.Write(func(orders *[]models.Order) error {
		for i, o := range *orders {
			if o.ID == orderID {
				(*orders)[i].Status = status
				(*orders)[i].UpdatedAt = time.Now()
				return nil
			}
		}
		return errors.New("pesanan tidak ditemukan")
	})
}

func (s *JSONStore) UpdateOrder(order *models.Order) error {
	return s.ordersTable.Write(func(orders *[]models.Order) error {
		for i, o := range *orders {
			if o.ID == order.ID {
				order.UpdatedAt = time.Now()
				(*orders)[i] = *order
				return nil
			}
		}
		return errors.New("pesanan tidak ditemukan")
	})
}
