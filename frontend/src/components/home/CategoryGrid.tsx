import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../api/categories';
import { Sparkles } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Categorias
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
            Explore por Departamento
          </h2>
        </div>
        <Link
          to="/catalogo"
          className="text-xs font-semibold uppercase tracking-wider text-nude-700 hover:text-nude-900 transition-colors"
        >
          Ver Todas →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            to={`/catalogo?category=${cat.id}`}
            className="group relative rounded-xl overflow-hidden bg-white border border-gray-100 hover:border-nude-300 transition-all duration-300 hover:shadow-md flex flex-col items-center p-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-nude-50 text-nude-700 flex items-center justify-center mb-3 group-hover:bg-nude-100 transition-colors overflow-hidden">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-xs font-semibold text-gray-800 group-hover:text-nude-700 transition-colors line-clamp-1">
              {cat.name}
            </h3>
            {cat.description && (
              <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{cat.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

