import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product, getProducts } from '../api/products';
import { Category, getCategories } from '../api/categories';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters } from '../components/product/ProductFilters';
import api from '../api/client';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current query params
  const categoryParam = searchParams.get('category') || undefined;
  const brandParam = searchParams.get('brand') || undefined;
  const minPriceParam = searchParams.get('min') || '';
  const maxPriceParam = searchParams.get('max') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = (searchParams.get('sort') as any) || 'newest';
  const promoParam = searchParams.get('promo') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Load categories and brands
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    api.get('/brands').then((res) => setBrands(res.data.data ?? [])).catch(() => {});
  }, []);

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        category_id: categoryParam,
        brand_id: brandParam,
        min_price: minPriceParam ? parseFloat(minPriceParam) : undefined,
        max_price: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
        search: searchParam || undefined,
        sort: sortParam,
        page: pageParam,
        limit: 16,
      });

      let items = res.data;
      if (promoParam) {
        items = items.filter((p) => p.promotional_price && Number(p.promotional_price) > 0);
      }

      setProducts(items);
      setTotalPages(res.pagination.pages || 1);
      setTotalItems(res.pagination.total || items.length);
    } catch (err) {
      console.error('Falha ao carregar catálogo:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, brandParam, minPriceParam, maxPriceParam, searchParam, sortParam, promoParam, pageParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update helpers
  const updateQuery = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    // reset to page 1 on filter change if not explicitly page
    if (!('page' in updates)) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Catálogo
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
            {searchParam
              ? `Resultados para "${searchParam}"`
              : promoParam
              ? 'Ofertas & Promoções Especiais'
              : 'Todos os Cosméticos'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {totalItems} {totalItems === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortParam}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-nude-400"
            >
              <option value="newest">Mais Recentes</option>
              <option value="popular">Mais Vendidos</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="featured">Destaques</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={categoryParam}
              selectedBrand={brandParam}
              minPrice={minPriceParam}
              maxPrice={maxPriceParam}
              promoOnly={promoParam}
              onCategoryChange={(id) => updateQuery({ category: id })}
              onBrandChange={(id) => updateQuery({ brand: id })}
              onMinPriceChange={(val) => updateQuery({ min: val })}
              onMaxPriceChange={(val) => updateQuery({ max: val })}
              onPromoOnlyChange={(val) => updateQuery({ promo: val ? 'true' : undefined })}
              onReset={handleResetFilters}
            />
          </div>
        </aside>

        {/* Mobile Filter Modal / Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="font-serif font-bold text-gray-900">Filtrar Produtos</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs uppercase tracking-wider text-nude-700 font-bold"
                >
                  Fechar
                </button>
              </div>
              <ProductFilters
                categories={categories}
                brands={brands}
                selectedCategory={categoryParam}
                selectedBrand={brandParam}
                minPrice={minPriceParam}
                maxPrice={maxPriceParam}
                promoOnly={promoParam}
                onCategoryChange={(id) => updateQuery({ category: id })}
                onBrandChange={(id) => updateQuery({ brand: id })}
                onMinPriceChange={(val) => updateQuery({ min: val })}
                onMaxPriceChange={(val) => updateQuery({ max: val })}
                onPromoOnlyChange={(val) => updateQuery({ promo: val ? 'true' : undefined })}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <section className="lg:col-span-3 space-y-8">
          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100">
              <button
                onClick={() => updateQuery({ page: String(pageParam - 1) })}
                disabled={pageParam <= 1}
                className="px-3.5 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="text-xs font-medium text-gray-600 px-3">
                Página {pageParam} de {totalPages}
              </span>

              <button
                onClick={() => updateQuery({ page: String(pageParam + 1) })}
                disabled={pageParam >= totalPages}
                className="px-3.5 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

