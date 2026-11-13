import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShieldCheck, Truck, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Product, getProductBySlug, getRelatedProducts } from '../api/products';
import { formatCurrency } from '../utils/formatCurrency';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ProductGrid } from '../components/product/ProductGrid';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import toast from 'react-hot-toast';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem, toggleCart } = useCartStore();
  const { isFavorite, toggle: toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const p = await getProductBySlug(slug!);
        if (!isMounted) return;
        setProduct(p);
        const initialImg = p.primary_image || (p.images && p.images[0]?.url) || null;
        setSelectedImage(initialImg);
        setQuantity(1);

        if (p.category_id) {
          getRelatedProducts(p.category_id, p.slug)
            .then((items) => {
              if (isMounted) setRelated(items);
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error('Produto não encontrado:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-3 font-serif">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">Produto não encontrado</h2>
        <p className="text-sm text-gray-500 mb-6">O produto solicitado pode ter sido descontinuado ou o link está incorreto.</p>
        <Link to="/catalogo">
          <Button variant="primary">Voltar ao Catálogo</Button>
        </Link>
      </div>
    );
  }

  const priceNum = Number(product.price);
  const promoNum = product.promotional_price ? Number(product.promotional_price) : null;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.min_stock_level;
  const favorited = isFavorite(product.id);

  const allImages = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.primary_image
    ? [product.primary_image]
    : [];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: priceNum,
      promotionalPrice: promoNum ?? undefined,
      image: selectedImage ?? undefined,
      quantity,
      maxStock: product.stock_quantity,
      slug: product.slug,
    });
    toast.success(`${quantity}x ${product.name} adicionado à sacola!`);
    toggleCart();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    if (!favorited) {
      toast.success('Adicionado aos favoritos!');
    } else {
      toast('Removido dos favoritos');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-nude-700 transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-nude-700 transition-colors">
          Catálogo
        </Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link
              to={`/catalogo?category=${product.category_id}`}
              className="hover:text-nude-700 transition-colors"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-nude-50 text-nude-400 p-8 text-center">
                <span className="font-serif text-3xl tracking-wider font-bold text-nude-800">
                  ETERNA
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-mocha-600 font-medium mt-1">
                  Cosméticos
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {isOutOfStock ? (
                <Badge variant="out_of_stock">Esgotado</Badge>
              ) : (
                <>
                  {promoNum && promoNum < priceNum && (
                    <Badge variant="promo">
                      {Math.round(((priceNum - promoNum) / priceNum) * 100)}% OFF
                    </Badge>
                  )}
                  {product.is_featured && <Badge variant="default">Destaque da Loja</Badge>}
                  {isLowStock && <Badge variant="low_stock">Poucas Unidades</Badge>}
                </>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    selectedImage === img ? 'border-nude-700' : 'border-gray-200 hover:border-nude-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {product.brand_name && (
              <p className="text-xs font-semibold uppercase tracking-widest text-mocha-600">
                {product.brand_name}
              </p>
            )}

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {product.sku && (
              <p className="text-xs text-gray-400 font-mono">Cód / SKU: {product.sku}</p>
            )}

            {/* Price section */}
            <div className="pt-2 pb-4 border-b border-gray-100">
              {promoNum && promoNum < priceNum ? (
                <div className="space-y-1">
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(priceNum)}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-serif font-bold text-nude-900">
                      {formatCurrency(promoNum)}
                    </span>
                    <span className="text-xs font-semibold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      Economize {formatCurrency(priceNum - promoNum)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-serif font-bold text-gray-900">
                  {formatCurrency(priceNum)}
                </span>
              )}

              {/* Stock status indicator */}
              <div className="mt-3">
                {isOutOfStock ? (
                  <p className="text-xs font-semibold text-gray-500">
                    Produto indisponível no momento
                  </p>
                ) : isLowStock ? (
                  <p className="text-xs font-semibold text-orange-700">
                    Últimas unidades em estoque!
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Em estoque para entrega ou retirada
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Descrição do Produto
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-3 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity || isOutOfStock}
                  className="p-3 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to bag */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingBag className="w-5 h-5 mr-1" />
                <span>{isOutOfStock ? 'Esgotado' : 'Adicionar à Sacola'}</span>
              </Button>

              {/* Favorite */}
              <button
                onClick={handleToggleFavorite}
                className={`p-3.5 rounded-lg border transition-colors ${
                  favorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Store guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-gray-600">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                <Truck className="w-4 h-4 text-nude-600 shrink-0" />
                <span>Retirada em Almirante Tamandaré ou entrega local</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-nude-600 shrink-0" />
                <span>Confirmação segura via WhatsApp oficial</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-10 border-t border-gray-100">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
              Você também pode gostar
            </span>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mt-1">
              Produtos Relacionados
            </h2>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
};
