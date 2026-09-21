package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"bizcatalog/backend/internal/handlers"
	"bizcatalog/backend/internal/middleware"
	"bizcatalog/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

func main() {
	// Paths
	baseDir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get working dir: %v", err)
	}

	// Ensure paths resolve correctly whether run from root or backend/
	var dataPath, uploadDir string
	if filepath.Base(baseDir) == "backend" {
		dataPath = filepath.Join(baseDir, "data", "db.json")
		uploadDir = filepath.Join(baseDir, "uploads")
	} else {
		dataPath = filepath.Join(baseDir, "backend", "data", "db.json")
		uploadDir = filepath.Join(baseDir, "backend", "uploads")
	}

	_ = os.MkdirAll(uploadDir, 0755)

	// Initialize JSON store repository
	repo, err := repository.NewJSONStore(dataPath)
	if err != nil {
		log.Fatalf("Failed to initialize database store: %v", err)
	}
	log.Printf("[BizCatalog] Database initialized at: %s", dataPath)

	// Router setup
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.CORSMiddleware())

	// Serve static uploads
	r.Static("/uploads", uploadDir)

	h := handlers.NewHandler(repo, uploadDir)

	// Health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "bizcatalog-backend",
			"version": "1.0.0-mvp",
		})
	})

	// Public routes
	api := r.Group("/api")
	{
		// Auth
		api.POST("/auth/register", h.Register)
		api.POST("/auth/login", h.Login)

		// Public dynamic website renderer & checkout order
		api.GET("/public/website/:subdomain", h.GetPublicWebsite)
		api.POST("/public/website/:subdomain/orders", h.CreatePublicOrder)
		api.GET("/public/website/:subdomain/orders/:order_number", h.GetPublicOrderByNumber)
		api.POST("/public/website/:subdomain/orders/:order_number/payment-proof", h.UploadPaymentProof)
		api.POST("/public/website/:subdomain/orders/:order_number/confirm", h.ConfirmPublicPayment)

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User
			protected.GET("/user/profile", h.GetProfile)
			protected.PUT("/user/profile", h.UpdateProfile)

			// Website
			protected.GET("/website/my", h.GetMyWebsite)
			protected.PUT("/website/my", h.UpdateMyWebsite)
			protected.PUT("/website/theme", h.UpdateTheme)
			protected.GET("/website/sections", h.GetSections)
			protected.PUT("/website/sections", h.SaveSections)

			// Categories
			protected.GET("/categories", h.GetCategories)
			protected.POST("/categories", h.CreateCategory)
			protected.PUT("/categories/:id", h.UpdateCategory)
			protected.DELETE("/categories/:id", h.DeleteCategory)

			// Promotions
			protected.GET("/promotions", h.GetPromotions)
			protected.POST("/promotions", h.CreatePromotion)
			protected.PUT("/promotions/:id", h.UpdatePromotion)
			protected.DELETE("/promotions/:id", h.DeletePromotion)

			// Products (with Subscription limit protection on creation)
			protected.GET("/products", h.GetProducts)
			protected.POST("/products", middleware.SubscriptionLimitMiddleware(repo), h.CreateProduct)
			protected.PUT("/products/:id", h.UpdateProduct)
			protected.DELETE("/products/:id", h.DeleteProduct)

			// Assets
			protected.GET("/assets", h.GetAssets)
			protected.POST("/assets/upload", h.UploadAsset)
			protected.DELETE("/assets/:id", h.DeleteAsset)

			// Testimonials & Gallery
			protected.GET("/testimonials", h.GetTestimonials)
			protected.POST("/testimonials", h.CreateTestimonial)
			protected.DELETE("/testimonials/:id", h.DeleteTestimonial)

			protected.GET("/galleries", h.GetGalleries)
			protected.POST("/galleries", h.CreateGallery)
			protected.DELETE("/galleries/:id", h.DeleteGallery)

			// E-Commerce Orders
			protected.GET("/orders", h.GetOrders)
			protected.PUT("/orders/:id", h.UpdateOrderAdmin)
			protected.PUT("/orders/:id/status", h.UpdateOrderStatus)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("\n🚀 BizCatalog Core Backend listening on port %s\n", port)
	fmt.Printf("👉 Health check: http://localhost:%s/api/health\n", port)
	fmt.Printf("👉 Demo public site: http://localhost:%s/api/public/website/mebeljaya\n\n", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
