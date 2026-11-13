import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Category } from '../../api/categories';
import { Button } from '../ui/Button';

interface Brand {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory?: string;
  selectedBrand?: string;
  minPrice?: string;
  maxPrice?: string;
  promoOnly?: boolean;
  onCategoryChange: (id?: string) => void;
  onBrandChange: (id?: string) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onPromoOnlyChange: (val: boolean) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  promoOnly,
  onCategoryChange,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  onPromoOnlyChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-800">
          Filtros
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-nude-600 hover:text-nude-800 flex items-center gap-1 transition-colors"
          title="Limpar todos os filtros"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Promo Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!promoOnly}
            onChange={(e) => onPromoOnlyChange(e.target.checked)}
            className="rounded border-gray-300 text-nude-600 focus:ring-nude-400"
          />
          <span className="font-medium text-rose-700">Apenas Ofertas & Promoções</span>
        </label>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
          Categorias
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-nude-50 text-nude-800 font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id === selectedCategory ? undefined : cat.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-nude-50 text-nude-800 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
            Marcas
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onBrandChange(undefined)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !selectedBrand
                  ? 'bg-nude-50 text-nude-800 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas as Marcas
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onBrandChange(brand.id === selectedBrand ? undefined : brand.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedBrand === brand.id
                    ? 'bg-nude-50 text-nude-800 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
          Faixa de Preço (R$)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice ?? ''}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-1/2 px-2.5 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-nude-400"
            min="0"
          />
          <span className="text-gray-400 text-xs">até</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice ?? ''}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-1/2 px-2.5 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-nude-400"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

