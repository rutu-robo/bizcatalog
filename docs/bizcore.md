# BizCatalog Builder

## Project Overview

BizCatalog Builder adalah platform SaaS multi-tenant yang memungkinkan UMKM membuat website katalog bisnis profesional tanpa kemampuan teknis.

Platform terdiri dari 3 aplikasi utama:

### 1. Marketing Website

Website milik platform untuk:

* Landing Page
* Pricing
* Feature Showcase
* Login
* Register

Contoh:

```text
https://bizcatalog.com
```

---

### 2. User Dashboard CMS

Panel admin milik user untuk mengelola:

* Company Profile
* Product Catalog
* Asset Library
* Theme
* Website Builder
* Gallery
* Testimonials

Contoh:

```text
https://app.bizcatalog.com
```

---

### 3. Public Generated Website

Website publik yang dapat diakses pelanggan.

Contoh:

```text
https://mebeljaya.bizcatalog.com
```

Website dirender secara dinamis berdasarkan:

* Theme
* Sections
* Company Data
* Products
* Assets

Tidak menggunakan static file generation.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router DOM
* TanStack Query
* Zustand
* TailwindCSS
* Shadcn UI

## Backend

* GoLang
* Gin Framework
* JWT Authentication
* Middleware Architecture
* REST API

## Database

Phase MVP:

* Dummy JSON Database

Future:

* PostgreSQL

## Storage

Phase MVP:

* Local Storage
* Mock Asset URL

Future:

* S3 Compatible Storage

---

# System Architecture

```text
Marketing Website
        │
        ▼
User Registration
        │
        ▼
Dashboard CMS
        │
        ▼
Generated Website
```

---

# Development Phases

---

# Phase 0 — Product Discovery

## Objective

Memvalidasi ide dan kebutuhan sistem.

## Activities

* Market research
* Competitor analysis
* User persona definition
* Feature prioritization
* Business model validation

## Deliverables

* Product Vision
* Product Requirement Document
* Feature Roadmap
* Initial Wireframe

---

# Phase 1 — System Analysis & Architecture

## Objective

Membuat fondasi sistem.

## Activities

### Define Multi-Tenant Structure

Relationship:

```text
User
 └── Website
      ├── Products
      ├── Assets
      ├── Gallery
      ├── Testimonials
      ├── Theme
      └── Sections
```

### Define Data Model

Entities:

* Users
* Websites
* Products
* Assets
* Galleries
* Testimonials
* Themes
* Website Sections
* Subscription Plans

### Define API Structure

REST API specification.

### Define Folder Structure

Frontend and Backend architecture.

## Deliverables

* ERD
* API Documentation
* Route Map
* Folder Structure

---

# Phase 2 — Core Backend Development

## Objective

Membangun API dan business logic.

## Features

### Authentication

Routes:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
```

### User Profile

Routes:

```text
GET /user/profile
PUT /user/profile
```

### Middleware

Implement:

* AuthMiddleware
* LoggerMiddleware
* SubscriptionMiddleware

### Repository Layer

Abstraction layer untuk migrasi PostgreSQL di masa depan.

## Deliverables

* Working API
* JWT Authentication
* Middleware System

---

# Phase 3 — Marketing Website

## Objective

Membangun website utama platform.

## Pages

### Home

* Hero
* Features
* Benefits
* CTA

### Pricing

* Free
* Pro
* Ultimate

### Features

* Product Catalog
* Website Builder
* Asset Library

### Authentication

* Login
* Register

## Deliverables

* Responsive Landing Page
* Registration Flow

---

# Phase 4 — Dashboard Foundation

## Objective

Membangun CMS Dashboard.

## Dashboard Pages

```text
/dashboard
/dashboard/company
/dashboard/products
/dashboard/assets
/dashboard/gallery
/dashboard/theme
/dashboard/builder
/dashboard/settings
```

## Features

* Sidebar Navigation
* Protected Routes
* Dashboard Layout
* User Session

## Deliverables

* Dashboard Shell
* Navigation System

---

# Phase 5 — Company Profile Module

## Objective

Membangun data bisnis user.

## Fields

* Business Name
* Description
* Address
* Phone
* Email
* WhatsApp
* Instagram
* Facebook
* TikTok

## Deliverables

* CRUD Company Profile

---

# Phase 6 — Asset Library Module

## Objective

Membangun media management system.

## Asset Types

* Logo
* Hero Images
* Product Images
* Gallery Images
* Background Images

## Features

* Upload Asset
* Delete Asset
* Preview Asset

## Deliverables

* Asset Management

---

# Phase 7 — Product Catalog Module

## Objective

Membangun katalog produk.

## Product Fields

* Name
* Slug
* Description
* Price
* Category
* Images
* Status

## Features

* Create Product
* Edit Product
* Delete Product

## Deliverables

* Product Management

---

# Phase 8 — Theme System

## Objective

Membangun design language system.

## Themes

### Minimalist

### Solid

### Industrial

### Formal

### Lifestyle

Theme hanya mengatur:

* Typography
* Colors
* Spacing
* Components

## Deliverables

* Theme Engine

---

# Phase 9 — Section Builder

## Objective

Membangun website builder.

## Section Types

* Hero
* About
* Catalog
* Gallery
* Projects
* Testimonials
* Contact
* Footer

## Features

### Add Section

### Remove Section

### Reorder Section

### Change Variant

### Toggle Visibility

## Deliverables

* Functional Builder

---

# Phase 10 — Public Website Renderer

## Objective

Menampilkan website user secara dinamis.

## Example

```text
mebeljaya.bizcatalog.com
```

## Dynamic Data Sources

* Company Profile
* Products
* Assets
* Testimonials
* Theme
* Sections

## Deliverables

* Dynamic Website Rendering

---

# Phase 11 — Subscription System

## Objective

Membatasi penggunaan berdasarkan paket.

## Free

* 1 Website
* 5 Products
* 1 Theme

## Pro

* 25 Products
* All Themes

## Ultimate

* 100 Products
* Multi User

## Deliverables

* Plan Validation
* Subscription Middleware

---

# Phase 12 — QA & Testing

## Objective

Menjamin stabilitas sistem.

## Testing

### Frontend

* Route Testing
* Form Validation

### Backend

* API Testing
* Middleware Testing

### Integration

* User Flow Testing

## Deliverables

* Stable MVP

---

# Phase 13 — MVP Release

## Objective

Merilis versi pertama.

## Included Features

* Authentication
* Dashboard
* Company Profile
* Asset Library
* Product Catalog
* Theme System
* Website Builder
* Public Website

## Excluded Features

* Payment Gateway
* QRIS
* Analytics
* Email Marketing
* AI Features
* Custom Domain

---

# Phase 14 — Post MVP

## Future Features

### Custom Domain

### Analytics

### QRIS Integration

### WhatsApp Lead Tracking

### AI Product Description Generator

### AI Company Profile Generator

### Blog Module

### Multi User Collaboration

### PostgreSQL Migration

### S3 Asset Storage

### White Label Agency Plan

---

# Success Criteria

User dapat:

1. Registrasi akun.
2. Membuat website bisnis.
3. Menambahkan produk.
4. Mengunggah gambar.
5. Memilih tema.
6. Menyesuaikan section website.
7. Mempublikasikan website.
8. Membagikan link website kepada pelanggan.

Target utama MVP:

> UMKM dapat memiliki website katalog bisnis profesional dalam waktu kurang dari 15 menit tanpa perlu memahami coding, hosting, atau desain website.
