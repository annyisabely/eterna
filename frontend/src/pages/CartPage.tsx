import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import { useCartStore, CartItem } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { validateCoupon } from '../api/coupons';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const rawSubtotal = subtotal();
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await validateCoupon(couponCode.trim(), rawSubtotal);
      setDiscountAmount(res.discount);
      setAppliedCoupon(res.coupon.code);
      toast.success(`Cupom ${res.coupon.code} aplicado com sucesso!`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cupom inválido ou expirado.';
      toast.error(msg);
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setAppliedCoupon(null);
    toast('Cupom removido');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10" />}
          title="Sua sacola de compras está vazia"
          description="Encontre os melhores cosméticos, maquiagens e produtos de beleza para cuidar de você."
          actionText="Explorar Catálogo"
          actionHref="/catalogo"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Minha Compra
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
            Sacola de Compras
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
        >
          Limpar Sacola
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-xs">
            {items.map((item: CartItem) => (
              <div key={item.productId} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-nude-50 text-nude-400 text-xs font-serif font-medium">
                      Eterna
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/produto/${item.slug}`}
                      className="text-sm sm:text-base font-medium text-gray-900 hover:text-nude-700 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remover produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-nude-800 mt-1">
                    {formatCurrency(item.promotionalPrice ?? item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-serif font-bold text-gray-900">
                      {formatCurrency((item.promotionalPrice ?? item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/catalogo"
            className="inline-block text-xs font-semibold text-nude-700 hover:text-nude-900 pt-2"
          >
            ← Continuar comprando mais produtos
          </Link>
        </div>

        {/* Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-800 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-nude-600" />
              <span>Cupom de Desconto</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <span className="font-bold text-emerald-800">{appliedCoupon}</span>
                  <p className="text-emerald-700">Desconto de {formatCurrency(discountAmount)}</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Remover
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: ETERNA10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 uppercase focus:outline-none focus:ring-1 focus:ring-nude-400"
                />
                <Button variant="outline" size="sm" type="submit" loading={validatingCoupon}>
                  Aplicar
                </Button>
              </form>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-800 pb-3 border-b border-gray-100">
              Resumo do Pedido
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} itens)</span>
                <span className="font-medium text-gray-900">{formatCurrency(rawSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto de Cupom</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Entrega / Retirada</span>
                <span className="text-gray-500">Calculado no checkout</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-serif font-bold text-nude-900">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => {
                const checkoutUrl = appliedCoupon ? `/checkout?coupon=${appliedCoupon}` : '/checkout';
                navigate(checkoutUrl);
              }}
              className="mt-4"
            >
              <span>Fechar Pedido</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <p className="text-[11px] text-gray-400 text-center">
              Você será direcionado para informar os dados de recebimento e confirmar via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
