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
  UserCheck,
  ShieldCheck,
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
  { name: 'Meu Perfil', path: '/admin/perfil', icon: UserCheck },
];

export const AdminSidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { admin, logout } = useAdminAuthStore();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-100">
        <Link to="/admin" className="flex items-center gap-3 group">
          <img
            src="/logo-eterna.jpg"
            alt="Eterna Cosméticos e Acessórios"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-pink-500/25 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wider text-nude-900 leading-tight">
              ETERNA
            </span>
            <span className="text-[8.5px] uppercase tracking-[0.2em] text-pink-700 font-semibold leading-tight">
              Cosméticos e Acessórios
            </span>
            <span className="inline-block mt-0.5 text-[8px] font-bold uppercase tracking-wider text-nude-600">
              Painel Administrativo
            </span>
          </div>
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-nude-800 text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:bg-nude-50 hover:text-nude-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Card Footer */}
      <div className="p-3.5 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-pink-50/20">
        <Link
          to="/admin/perfil"
          onClick={onCloseMobile}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all border border-transparent hover:border-pink-100 group"
        >
          <div className="relative shrink-0">
            <img
              src="/logo-eterna.jpg"
              alt="Administradora"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-500/30 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-pink-700 transition-colors">
                {admin?.name || 'Eterna Cosméticos'}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 truncate">{admin?.email || 'eterna@gmail.com'}</p>
            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-sm bg-pink-100 text-pink-800 text-[9px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Proprietária</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-200/60 text-xs px-1">
          <Link
            to="/"
            target="_blank"
            className="text-gray-500 hover:text-pink-700 flex items-center gap-1.5 font-medium transition-colors text-[11px]"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors text-[11px]"
            title="Encerrar sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

