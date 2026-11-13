import React from 'react';
import { Product } from '../../api/products';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyTitle = 'Nenhum produto encontrado',
  emptyDescription = 'Tente ajustar os filtros ou buscar por outro termo.',
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse space-y-3"
          >
            <div className="w-full pt-[100%] bg-gray-100 rounded-lg" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-5 bg-gray-100 rounded w-1/2 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 py-8">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionText="Ver todos os produtos"
          actionHref="/catalogo"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

