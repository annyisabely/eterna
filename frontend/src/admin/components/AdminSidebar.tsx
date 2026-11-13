import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Sparkles,
  BarChart3,
  Users,
  Tag,
  Image,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAdminAuthStore } from '../store/authStore';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
  { name: 'Produtos', path: '/admin/produtos', icon: Package },
  { name: 'Categorias', path: '/admin/categorias', icon: Layers },
  { name: 'Marcas', path: '/admin/marcas', icon: Sparkles },
  { name: 'Estoque', path: '/admin/estoque', icon: BarChart3 },
  { name: 'Clientes', path: '/admin/clientes', icon: Users },
  { name: 'Cupons', path: '/admin/cupons', icon: Tag },
  { name: 'Banners', path: '/admin/banners', icon: Image },
  { name: 'Relatórios', path: '/admin/relatorios', icon: FileSpreadsheet },
  { name: 'Configurações', path: '/admin/configuracoes', icon: Settings },
];

export const AdminSidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { admin, logout } = useAdminAuthStore();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link to="/admin" className="flex flex-col">
          <span className="font-serif text-xl font-bold tracking-wider text-nude-900">
            ETERNA
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-mocha-600 font-medium">
            Painel Administrativo
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-nude-700 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-nude-50 hover:text-nude-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
        <div className="text-xs">
          <p className="font-semibold text-gray-900 truncate">{admin?.name || 'Administrador'}</p>
          <p className="text-[11px] text-gray-400 truncate">{admin?.email}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
          <Link
            to="/"
            target="_blank"
            className="text-gray-500 hover:text-nude-700 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

