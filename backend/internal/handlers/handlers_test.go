package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"bizcatalog/backend/internal/handlers"
	"bizcatalog/backend/internal/middleware"
	"bizcatalog/backend/internal/models"
	"bizcatalog/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

func setupTestRouter(t *testing.T) (*gin.Engine, repository.Repository, string) {
	gin.SetMode(gin.TestMode)
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test_db.json")
	uploadDir := filepath.Join(tmpDir, "uploads")

	repo, err := repository.NewJSONStore(dbPath)
	if err != nil {
		t.Fatalf("failed to create test json store: %v", err)
	}

	h := handlers.NewHandler(repo, uploadDir)
	r := gin.New()

	api := r.Group("/api")
	{
		api.POST("/auth/register", h.Register)
		api.POST("/auth/login", h.Login)
		api.GET("/public/website/:subdomain", h.GetPublicWebsite)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/user/profile", h.GetProfile)
			protected.GET("/website/my", h.GetMyWebsite)
			protected.PUT("/website/theme", h.UpdateTheme)
			protected.GET("/products", h.GetProducts)
			protected.POST("/products", middleware.SubscriptionLimitMiddleware(repo), h.CreateProduct)
		}
	}

	return r, repo, uploadDir
}

func TestAuthAndPublicWebsite(t *testing.T) {
	r, _, _ := setupTestRouter(t)

	// 1. Register new user
	regPayload := models.RegisterRequest{
		Name:         "Pak Joko",
		Email:        "joko@example.com",
		Password:     "secret123",
		Subdomain:    "kuejoko",
		BusinessName: "Kue Tradisional Joko",
	}
	body, _ := json.Marshal(regPayload)
	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", w.Code, w.Body.String())
	}

	var authRes models.AuthResponse
	_ = json.Unmarshal(w.Body.Bytes(), &authRes)
	if authRes.Token == "" {
		t.Fatal("expected token in response")
	}
	if authRes.Website.Subdomain != "kuejoko" {
		t.Fatalf("expected subdomain kuejoko, got %s", authRes.Website.Subdomain)
	}

	// 2. Query public website
	pubReq := httptest.NewRequest(http.MethodGet, "/api/public/website/kuejoko", nil)
	pubW := httptest.NewRecorder()
	r.ServeHTTP(pubW, pubReq)
	if pubW.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", pubW.Code, pubW.Body.String())
	}

	var pubData models.PublicWebsiteData
	_ = json.Unmarshal(pubW.Body.Bytes(), &pubData)
	if pubData.Website.BusinessName != "Kue Tradisional Joko" {
		t.Fatalf("expected business name Kue Tradisional Joko, got %s", pubData.Website.BusinessName)
	}
	if len(pubData.Sections) == 0 {
		t.Fatal("expected default sections to be initialized")
	}

	// 3. Subscription Limiter Test on Free Tier (max 5 products)
	for i := 1; i <= 5; i++ {
		prodPayload := models.Product{
			Name:     "Kue Lapis Legit",
			Price:    50000,
			Category: "Kue Basah",
		}
		pBytes, _ := json.Marshal(prodPayload)
		pReq := httptest.NewRequest(http.MethodPost, "/api/products", bytes.NewBuffer(pBytes))
		pReq.Header.Set("Content-Type", "application/json")
		pReq.Header.Set("Authorization", "Bearer "+authRes.Token)
		pW := httptest.NewRecorder()
		r.ServeHTTP(pW, pReq)
		if pW.Code != http.StatusCreated {
			t.Fatalf("product %d should succeed, got code %d: %s", i, pW.Code, pW.Body.String())
		}
	}

	// 6th product should be blocked with 403 Forbidden
	prod6 := models.Product{
		Name:     "Kue Bolu Kukus",
		Price:    30000,
		Category: "Kue Basah",
	}
	p6Bytes, _ := json.Marshal(prod6)
	p6Req := httptest.NewRequest(http.MethodPost, "/api/products", bytes.NewBuffer(p6Bytes))
	p6Req.Header.Set("Content-Type", "application/json")
	p6Req.Header.Set("Authorization", "Bearer "+authRes.Token)
	p6W := httptest.NewRecorder()
	r.ServeHTTP(p6W, p6Req)
	if p6W.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for 6th product on free plan, got %d: %s", p6W.Code, p6W.Body.String())
	}

	// 4. Free plan theme restriction: choosing "industrial" should fail
	themeReqPayload := handlers.UpdateThemeRequest{
		ThemeID: "industrial",
	}
	tBytes, _ := json.Marshal(themeReqPayload)
	tReq := httptest.NewRequest(http.MethodPut, "/api/website/theme", bytes.NewBuffer(tBytes))
	tReq.Header.Set("Content-Type", "application/json")
	tReq.Header.Set("Authorization", "Bearer "+authRes.Token)
	tW := httptest.NewRecorder()
	r.ServeHTTP(tW, tReq)
	if tW.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for non-minimalist theme on free plan, got %d", tW.Code)
	}
}
