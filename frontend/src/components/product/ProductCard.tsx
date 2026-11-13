import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../api/products';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, toggleCart } = useCartStore();
  const { isFavorite, toggle: toggleFavorite } = useFavoritesStore();

  const priceNum = Number(product.price);
  const promoNum = product.promotional_price ? Number(product.promotional_price) : null;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.min_stock_level;
  const favorited = isFavorite(product.id);

  const displayImage = product.primary_image || (product.images && product.images[0]?.url);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: priceNum,
      promotionalPrice: promoNum ?? undefined,
      image: displayImage ?? undefined,
      quantity: 1,
      maxStock: product.stock_quantity,
      slug: product.slug,
    });
    toast.success(`${product.name} adicionado à sacola!`);
    toggleCart();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    if (!favorited) {
      toast.success('Adicionado aos favoritos!');
    } else {
      toast('Removido dos favoritos');
    }
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 hover:border-nude-300 transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden">
      {/* Badges container */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {isOutOfStock ? (
          <Badge variant="out_of_stock">Esgotado</Badge>
        ) : (
          <>
            {promoNum && promoNum < priceNum && (
              <Badge variant="promo">
                {Math.round(((priceNum - promoNum) / priceNum) * 100)}% OFF
              </Badge>
            )}
            {product.is_featured && <Badge variant="default">Destaque</Badge>}
            {isLowStock && <Badge variant="low_stock">Últimas Unidades</Badge>}
          </>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-xs transition-colors ${
          favorited
            ? 'bg-rose-50 text-rose-600'
            : 'bg-white/80 text-gray-400 hover:text-rose-600 hover:bg-white'
        }`}
        title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/produto/${product.slug}`} className="block relative pt-[100%] overflow-hidden bg-gray-50">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-nude-50/60 text-nude-400 p-4 text-center">
            <span className="font-serif text-lg tracking-wider font-semibold text-nude-600">ETERNA</span>
            <span className="text-[10px] tracking-widest text-mocha-400 uppercase mt-1">Cosméticos</span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.brand_name && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-mocha-600 mb-1">
              {product.brand_name}
            </p>
          )}

          <Link to={`/produto/${product.slug}`}>
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-nude-700 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-end justify-between gap-2">
          <div>
            {promoNum && promoNum < priceNum ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(priceNum)}
                </span>
                <span className="text-base font-serif font-bold text-nude-900">
                  {formatCurrency(promoNum)}
                </span>
              </div>
            ) : (
              <span className="text-base font-serif font-bold text-gray-900">
                {formatCurrency(priceNum)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-nude-600 text-white hover:bg-nude-700 active:bg-nude-800'
            }`}
            title={isOutOfStock ? 'Produto esgotado' : 'Adicionar à Sacola'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
