import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X, ExternalLink, ShieldCheck, UserCheck } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useAdminAuthStore } from '../store/authStore';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { admin } = useAdminAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link to="/admin" className="flex items-center gap-2.5">
          <img
            src="/logo-eterna.jpg"
            alt="Eterna Cosméticos"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500/20"
          />
          <div className="flex flex-col">
            <span className="font-serif text-base font-bold text-nude-900 leading-none">ETERNA</span>
            <span className="text-[8.5px] uppercase tracking-wider text-pink-700 font-semibold leading-tight">
              Cosméticos e Acessórios • Admin
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full bg-white h-full z-10">
            <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar for Desktop */}
        <header className="hidden md:flex bg-white border-b border-gray-100 px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Painel Seguro • Operando Normal</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-medium">
              Eterna Cosméticos e Acessórios • Almirante Tamandaré/PR
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold text-nude-800 hover:text-pink-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50/30 transition-all shadow-2xs"
            >
              <span>Ver Loja Virtual</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/admin/perfil"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <img
                src="/logo-eterna.jpg"
                alt="Foto Administradora"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500/30 shadow-2xs"
              />
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-gray-900">
                  {admin?.name || 'Eterna Cosméticos'}
                </span>
                <span className="text-[10px] text-pink-700 font-semibold mt-0.5">
                  Proprietária
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

