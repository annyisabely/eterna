import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={toggleCart} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-cream">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-nude-700" />
              <h2 className="text-base font-serif font-semibold text-gray-900">
                Sua Sacola ({itemCount()})
              </h2>
            </div>
            <button
              onClick={toggleCart}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-nude-50 flex items-center justify-center text-nude-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-gray-800 font-serif font-medium mb-1">Sua sacola está vazia</p>
                <p className="text-sm text-gray-500 mb-6">Explore nossos cosméticos e produtos de beleza!</p>
                <Button variant="outline" size="sm" onClick={toggleCart}>
                  Continuar comprando
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-nude-50 text-nude-400 text-xs font-serif font-medium">
                        Eterna
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/produto/${item.slug}`}
                          onClick={toggleCart}
                          className="text-sm font-medium text-gray-800 hover:text-nude-700 line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-nude-800 mt-1">
                        {formatCurrency(item.promotionalPrice ?? item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-gray-700">
                        {formatCurrency((item.promotionalPrice ?? item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-cream">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-serif font-bold text-gray-900">
                  {formatCurrency(subtotal())}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mb-4">
                Frete e descontos calculados na etapa seguinte.
              </p>
              <div className="space-y-2">
                <Link to="/checkout" onClick={toggleCart} className="block">
                  <Button variant="primary" fullWidth size="lg">
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/carrinho" onClick={toggleCart} className="block">
                  <Button variant="outline" fullWidth size="md">
                    Ver Sacola Completa
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

