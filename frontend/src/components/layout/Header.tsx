import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Phone, MapPin } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { getCategories, Category } from '../../api/categories';
import { getStoreSettings, StoreSettings } from '../../api/settings';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleCart, itemCount } = useCartStore();
  const { ids: favoriteIds } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats.filter((c) => c.is_active !== false)))
      .catch(() => {});
    getStoreSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const totalFavorites = favoriteIds.length;
  const totalCartItems = itemCount();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-nude-900 text-nude-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-nude-400" />
              <span>{settings.store_address || 'Almirante Tamandaré – PR'}</span>
            </span>
            <span className="hidden sm:inline-block text-nude-300">|</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <span>Eterna • Cosméticos e Acessórios</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/eternacosmeticos/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors hidden sm:flex items-center gap-1 text-pink-300 font-medium"
            >
              <span>@eternacosmeticos</span>
            </a>
            {settings.store_whatsapp && (
              <a
                href={`https://wa.me/${settings.store_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-nude-400" />
                <span>(41) 99994-9204</span>
              </a>
            )}
            <Link to="/sobre" className="hover:text-white transition-colors">
              Sobre a Loja
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700 hover:text-nude-700 focus:outline-none"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo-eterna.jpg"
            alt="Eterna Cosméticos e Acessórios"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm ring-2 ring-pink-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-nude-900 group-hover:text-nude-700 transition-colors">
              ETERNA
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-pink-700 font-semibold">
              Cosméticos e Acessórios
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="O que você está procurando hoje?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-500 bg-gray-50/50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/favoritos"
            className="p-2 text-gray-700 hover:text-nude-700 relative rounded-full hover:bg-gray-100 transition-colors"
            title="Favoritos"
          >
            <Heart className="w-5 h-5" />
            {totalFavorites > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-nude-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalFavorites}
              </span>
            )}
          </Link>

          <button
            onClick={toggleCart}
            className="flex items-center gap-2 p-2 sm:px-3 text-gray-700 hover:text-nude-700 relative rounded-full sm:rounded-lg hover:bg-nude-50 transition-colors"
            title="Minha Sacola"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-nude-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-nude-900">
              Sacola
            </span>
          </button>
        </div>
      </div>

      {/* Category Subnav (Desktop) */}
      <nav className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 py-2.5 text-xs font-semibold tracking-wider uppercase text-gray-700">
            <li>
              <Link
                to="/catalogo"
                className={`hover:text-nude-700 transition-colors pb-1 border-b-2 ${
                  location.pathname === '/catalogo' && !location.search
                    ? 'border-nude-700 text-nude-700'
                    : 'border-transparent'
                }`}
              >
                Todos os Produtos
              </Link>
            </li>
            {categories.slice(0, 7).map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/catalogo?category=${cat.id}`}
                  className="hover:text-nude-700 transition-colors pb-1 border-b-2 border-transparent hover:border-nude-400"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/catalogo?promo=true"
                className="text-rose-700 hover:text-rose-800 font-bold transition-colors pb-1 border-b-2 border-transparent hover:border-rose-300"
              >
                Ofertas & Promoções
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-fadeIn">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar cosméticos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400 bg-gray-50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Mobile Categories */}
          <div className="space-y-1 pt-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-1">
              Categorias
            </p>
            <Link
              to="/catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-nude-50 hover:text-nude-700"
            >
              Todos os Produtos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?category=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-nude-50 hover:text-nude-700"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/catalogo?promo=true"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Ofertas Especiais
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1">
            <Link
              to="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-sm text-gray-600 hover:text-nude-700"
            >
              Sobre a Eterna Cosméticos
            </Link>
            <Link
              to="/contato"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-sm text-gray-600 hover:text-nude-700"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

