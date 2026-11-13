import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavoritesStore } from '../store/favoritesStore';
import { Product, getProducts } from '../api/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const FavoritesPage: React.FC = () => {
  const { ids, clear } = useFavoritesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Load all products and filter
        const res = await getProducts({ limit: 100 });
        const favProducts = res.data.filter((p) => ids.includes(p.id));
        setProducts(favProducts);
      } catch (err) {
        console.error('Falha ao carregar favoritos:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ids]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Minha Lista
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
            Produtos Favoritos ({ids.length})
          </h1>
        </div>

        {ids.length > 0 && (
          <button
            onClick={clear}
            className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
          >
            Limpar Favoritos
          </button>
        )}
      </div>

      {ids.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-10 h-10" />}
          title="Você ainda não salvou produtos favoritos"
          description="Clique no ícone de coração nos produtos para guardá-los e encontrá-los facilmente aqui."
          actionText="Ver Catálogo"
          actionHref="/catalogo"
        />
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </div>
  );
};
