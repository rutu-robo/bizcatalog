package models

import "time"

type UserPlan string

const (
	PlanFree     UserPlan = "free"
	PlanPro      UserPlan = "pro"
	PlanUltimate UserPlan = "ultimate"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash,omitempty"`
	Name         string    `json:"name"`
	Plan         UserPlan  `json:"plan"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) Sanitize() *User {
	if u == nil {
		return nil
	}
	cpy := *u
	cpy.PasswordHash = ""
	return &cpy
}

type Website struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	Subdomain      string    `json:"subdomain"`
	BusinessName   string    `json:"business_name"`
	Tagline        string    `json:"tagline"`
	Description    string    `json:"description"`
	Address        string    `json:"address"`
	Phone          string    `json:"phone"`
	Email          string    `json:"email"`
	WhatsApp       string    `json:"whatsapp"`
	Instagram      string    `json:"instagram"`
	Facebook       string    `json:"facebook"`
	TikTok         string    `json:"tiktok"`
	LogoURL        string    `json:"logo_url"`
	ThemeID            string    `json:"theme_id"` // minimalist, solid, industrial, formal, lifestyle
	PrimaryColor       string    `json:"primary_color,omitempty"`
	OperatingHours     string    `json:"operating_hours,omitempty"`
	BankName           string    `json:"bank_name,omitempty"`
	BankAccountNo      string    `json:"bank_account_no,omitempty"`
	BankAccountName    string    `json:"bank_account_name,omitempty"`
	QRISImageURL       string    `json:"qris_image_url,omitempty"`
	EnableCOD          bool      `json:"enable_cod"`
	EnableBankTransfer bool      `json:"enable_bank_transfer"`
	HeaderStyle        string    `json:"header_style,omitempty"` // solid, floating, dynamic-scroll
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type ProductStatus string

const (
	ProductStatusPublished ProductStatus = "published"
	ProductStatusDraft     ProductStatus = "draft"
)

type Category struct {
	ID          string    `json:"id"`
	WebsiteID   string    `json:"website_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Product struct {
	ID          string        `json:"id"`
	WebsiteID   string        `json:"website_id"`
	Name        string        `json:"name"`
	Slug        string        `json:"slug"`
	Description string        `json:"description"`
	Price       float64       `json:"price"`
	Category    string        `json:"category"`
	ImageURL    string        `json:"image_url"`
	Status      ProductStatus `json:"status"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type AssetType string

const (
	AssetTypeLogo       AssetType = "logo"
	AssetTypeHero       AssetType = "hero"
	AssetTypeProduct    AssetType = "product"
	AssetTypeGallery    AssetType = "gallery"
	AssetTypeBackground AssetType = "background"
)

type Asset struct {
	ID        string    `json:"id"`
	WebsiteID string    `json:"website_id"`
	Name      string    `json:"name"`
	Type      AssetType `json:"type"`
	URL       string    `json:"url"`
	SizeBytes int64     `json:"size_bytes"`
	CreatedAt time.Time `json:"created_at"`
}

type SectionType string

const (
	SectionHero         SectionType = "hero"
	SectionPromos       SectionType = "promos"
	SectionCategories   SectionType = "categories"
	SectionCatalog      SectionType = "catalog"
	SectionAbout        SectionType = "about"
	SectionGallery      SectionType = "gallery"
	SectionProjects     SectionType = "projects"
	SectionTestimonials SectionType = "testimonials"
	SectionContact      SectionType = "contact"
	SectionFooter       SectionType = "footer"
)

type SectionConfig struct {
	ID        string      `json:"id"`
	WebsiteID string      `json:"website_id"`
	Type      SectionType `json:"type"`
	Title     string      `json:"title"`
	Subtitle  string      `json:"subtitle"`
	Variant   string      `json:"variant"` // default, split, centered, grid, list, banner
	IsVisible bool        `json:"is_visible"`
	Order     int         `json:"order"`
}

type GalleryItem struct {
	ID        string    `json:"id"`
	WebsiteID string    `json:"website_id"`
	Title     string    `json:"title"`
	ImageURL  string    `json:"image_url"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"created_at"`
}

type Testimonial struct {
	ID            string    `json:"id"`
	WebsiteID     string    `json:"website_id"`
	ClientName    string    `json:"client_name"`
	RoleOrCompany string    `json:"role_or_company"`
	Feedback      string    `json:"feedback"`
	Rating        int       `json:"rating"` // 1 - 5
	AvatarURL     string    `json:"avatar_url"`
	CreatedAt     time.Time `json:"created_at"`
}

// Request & Response DTOs
type RegisterRequest struct {
	Name         string `json:"name" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Password     string `json:"password" binding:"required,min=6"`
	Subdomain    string `json:"subdomain" binding:"required"`
	BusinessName string `json:"business_name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token   string   `json:"token"`
	User    *User    `json:"user"`
	Website *Website `json:"website"`
}

type PublicWebsiteData struct {
	Website      *Website         `json:"website"`
	Categories   []Category       `json:"categories"`
	Products     []Product        `json:"products"`
	Sections     []SectionConfig  `json:"sections"`
	Testimonials []Testimonial    `json:"testimonials"`
	Galleries    []GalleryItem    `json:"galleries"`
	Assets       []Asset          `json:"assets"`
}

// E-Commerce Order Models
type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusCompleted  OrderStatus = "completed"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type PaymentStatus string

const (
	PaymentStatusUnpaid              PaymentStatus = "unpaid"
	PaymentStatusWaitingVerification PaymentStatus = "waiting_verification"
	PaymentStatusPaid                PaymentStatus = "paid"
	PaymentStatusRefunded            PaymentStatus = "refunded"
)

type OrderItem struct {
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	ImageURL    string  `json:"image_url,omitempty"`
}

type Order struct {
	ID              string        `json:"id"`
	WebsiteID       string        `json:"website_id"`
	OrderNumber     string        `json:"order_number"`
	CustomerName    string        `json:"customer_name"`
	CustomerPhone   string        `json:"customer_phone"`
	Address         string        `json:"address"`
	Notes           string        `json:"notes,omitempty"`
	Items           []OrderItem   `json:"items"`
	SubtotalAmount  float64       `json:"subtotal_amount"`
	ShippingCost    float64       `json:"shipping_cost"`
	TotalAmount     float64       `json:"total_amount"`
	PaymentMethod   string        `json:"payment_method"` // bank_transfer, qris, cod
	PaymentStatus   PaymentStatus `json:"payment_status"` // unpaid, waiting_verification, paid
	PaymentProofURL string        `json:"payment_proof_url,omitempty"`
	ShippingMethod  string        `json:"shipping_method,omitempty"` // cargo, regular, pickup
	ShippingCourier string        `json:"shipping_courier,omitempty"`
	TrackingNumber  string        `json:"tracking_number,omitempty"`
	Status          OrderStatus   `json:"status"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type CreateOrderRequest struct {
	CustomerName   string      `json:"customer_name" binding:"required"`
	CustomerPhone  string      `json:"customer_phone" binding:"required"`
	Address        string      `json:"address" binding:"required"`
	Notes          string      `json:"notes"`
	PaymentMethod  string      `json:"payment_method"`
	ShippingMethod string      `json:"shipping_method"`
	ShippingCost   float64     `json:"shipping_cost"`
	Items          []OrderItem `json:"items" binding:"required,min=1"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" binding:"required"`
}

type UpdateOrderAdminRequest struct {
	Status          OrderStatus   `json:"status"`
	PaymentStatus   PaymentStatus `json:"payment_status"`
	TrackingNumber  string        `json:"tracking_number"`
	ShippingCourier string        `json:"shipping_courier"`
}

