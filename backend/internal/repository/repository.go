package repository

import "bizcatalog/backend/internal/models"

type Repository interface {
	// User
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id string) (*models.User, error)
	UpdateUser(user *models.User) error

	// Website
	CreateWebsite(ws *models.Website) error
	GetWebsiteByID(id string) (*models.Website, error)
	GetWebsiteByUserID(userID string) (*models.Website, error)
	GetWebsiteBySubdomain(subdomain string) (*models.Website, error)
	UpdateWebsite(ws *models.Website) error

	// Categories
	GetCategoriesByWebsiteID(websiteID string) ([]models.Category, error)
	GetCategoryByID(id string) (*models.Category, error)
	CreateCategory(c *models.Category) error
	UpdateCategory(c *models.Category) error
	DeleteCategory(id string) error

	// Products
	GetProductsByWebsiteID(websiteID string) ([]models.Product, error)
	GetProductByID(id string) (*models.Product, error)
	CreateProduct(p *models.Product) error
	UpdateProduct(p *models.Product) error
	DeleteProduct(id string) error
	CountProductsByWebsiteID(websiteID string) (int, error)

	// Assets
	GetAssetsByWebsiteID(websiteID string) ([]models.Asset, error)
	CreateAsset(a *models.Asset) error
	DeleteAsset(id string) error

	// Sections
	GetSectionsByWebsiteID(websiteID string) ([]models.SectionConfig, error)
	SaveSections(websiteID string, sections []models.SectionConfig) error

	// Testimonials
	GetTestimonialsByWebsiteID(websiteID string) ([]models.Testimonial, error)
	CreateTestimonial(t *models.Testimonial) error
	DeleteTestimonial(id string) error

	// Gallery
	GetGalleriesByWebsiteID(websiteID string) ([]models.GalleryItem, error)
	CreateGalleryItem(g *models.GalleryItem) error
	DeleteGalleryItem(id string) error

	// Public Website Data
	GetPublicWebsiteData(subdomain string) (*models.PublicWebsiteData, error)

	// Orders (E-Commerce)
	CreateOrder(order *models.Order) error
	GetOrdersByWebsiteID(websiteID string) ([]models.Order, error)
	GetOrderByID(orderID string) (*models.Order, error)
	GetOrderByNumber(websiteID string, orderNumber string) (*models.Order, error)
	UpdateOrderStatus(orderID string, status models.OrderStatus) error
	UpdateOrder(order *models.Order) error

	// Promotions
	GetPromotionsByWebsiteID(websiteID string) ([]models.Promotion, error)
	GetPromotionByID(id string) (*models.Promotion, error)
	CreatePromotion(promo *models.Promotion) error
	UpdatePromotion(promo *models.Promotion) error
	DeletePromotion(id string) error
}

