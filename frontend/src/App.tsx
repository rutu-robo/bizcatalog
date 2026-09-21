import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/marketing/LandingPage';
import { LoginPage } from './pages/marketing/LoginPage';
import { RegisterPage } from './pages/marketing/RegisterPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { CompanyProfilePage } from './pages/dashboard/CompanyProfilePage';
import { ProductCatalogPage } from './pages/dashboard/ProductCatalogPage';
import { CategoriesPage } from './pages/dashboard/CategoriesPage';
import { AssetLibraryPage } from './pages/dashboard/AssetLibraryPage';
import { GalleryTestimonialsPage } from './pages/dashboard/GalleryTestimonialsPage';
import { ThemeSelectorPage } from './pages/dashboard/ThemeSelectorPage';
import { SectionBuilderPage } from './pages/dashboard/SectionBuilderPage';
import { PromotionsPage } from './pages/dashboard/PromotionsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { PublicWebsiteView } from './pages/public/PublicWebsiteView';
import { PublicOrderDetailPage } from './pages/public/PublicOrderDetailPage';
import { PublicProductsPage } from './pages/public/PublicProductsPage';

export const App: React.FC = () => {
  const host = window.location.hostname;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || isIp;

  // Only enable host-based subdomain routing in production with bizcatalog.com
  const isSubdomainHost =
    !isLocalhost &&
    host.includes('bizcatalog.com') &&
    host.split('.').length > 2 &&
    !['www', 'app', 'admin'].includes(host.split('.')[0]);

  if (isSubdomainHost) {
    const subdomain = host.split('.')[0];
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/order/:orderNumber" element={<PublicOrderDetailPage />} />
          <Route path="/products" element={<PublicProductsPage />} />
          <Route path="/katalog" element={<PublicProductsPage />} />
          <Route path="*" element={<PublicWebsiteView />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing Website Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard CMS Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="company" element={<CompanyProfilePage />} />
          <Route path="products" element={<ProductCatalogPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="promos" element={<PromotionsPage />} />
          <Route path="assets" element={<AssetLibraryPage />} />
          <Route path="gallery" element={<GalleryTestimonialsPage />} />
          <Route path="theme" element={<ThemeSelectorPage />} />
          <Route path="builder" element={<SectionBuilderPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Dynamic Public Generated Website Route & Order Invoice */}
        <Route path="/site/:subdomain" element={<PublicWebsiteView />} />
        <Route path="/site/:subdomain/products" element={<PublicProductsPage />} />
        <Route path="/site/:subdomain/katalog" element={<PublicProductsPage />} />
        <Route path="/site/:subdomain/order/:orderNumber" element={<PublicOrderDetailPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
