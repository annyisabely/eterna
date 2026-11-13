import React, { useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/authStore';
import { AdminLayout } from '../components/AdminLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { BrandsPage } from '../pages/BrandsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CustomersPage } from '../pages/CustomersPage';
import { CouponsPage } from '../pages/CouponsPage';
import { BannersPage } from '../pages/BannersPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { Spinner } from '../../components/ui/Spinner';

export const AdminRoutes: React.FC = () => {
  const { isAuthenticated, checkAuth } = useAdminAuthStore();
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuth().finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-3 font-serif">Verificando sessão de administrador...</p>
      </div>
    );
  }

  // If on login route
  if (location.pathname === '/admin/login') {
    if (isAuthenticated) {
      return <Navigate to="/admin" replace />;
    }
    return <LoginPage />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="pedidos/:id" element={<OrderDetailPage />} />
        <Route path="produtos" element={<ProductsPage />} />
        <Route path="produtos/novo" element={<ProductFormPage />} />
        <Route path="produtos/:id/editar" element={<ProductFormPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="marcas" element={<BrandsPage />} />
        <Route path="estoque" element={<InventoryPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="cupons" element={<CouponsPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

