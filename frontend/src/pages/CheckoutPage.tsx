import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Store, Truck, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { useCartStore, CartItem } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { createOrder } from '../api/orders';
import { validateCoupon } from '../api/coupons';
import { getStoreSettings, StoreSettings } from '../api/settings';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, subtotal, clearCart } = useCartStore();

  const [settings, setSettings] = useState<StoreSettings>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');

  // Address fields
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Almirante Tamandaré');
  const [state, setState] = useState('PR');
  const [notes, setNotes] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState(searchParams.get('coupon') || '');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(() => {});
  }, []);

  const rawSubtotal = subtotal();

  // Validate coupon on mount if in URL
  useEffect(() => {
    if (couponCode && rawSubtotal > 0 && !appliedCoupon) {
      validateCoupon(couponCode, rawSubtotal)
        .then((res) => {
          setDiscountAmount(res.discount);
          setAppliedCoupon(res.coupon.code);
        })
        .catch(() => {});
    }
  }, [couponCode, rawSubtotal, appliedCoupon]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await validateCoupon(couponCode.trim(), rawSubtotal);
      setDiscountAmount(res.discount);
      setAppliedCoupon(res.coupon.code);
      toast.success(`Cupom ${res.coupon.code} aplicado!`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cupom inválido ou expirado.';
      toast.error(msg);
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Sua sacola está vazia.');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Por favor informe seu nome.');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Por favor informe seu telefone / WhatsApp.');
      return;
    }

    let fullAddress = '';
    if (fulfillmentType === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        toast.error('Por favor preencha rua, número e bairro para entrega.');
        return;
      }
      fullAddress = `${street.trim()}, Nº ${number.trim()}${complement.trim() ? ` (${complement.trim()})` : ''} - Bairro ${neighborhood.trim()}, ${city.trim()} - ${state.trim()}`;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        fulfillment_type: fulfillmentType,
        delivery_address: fullAddress || undefined,
        coupon_code: appliedCoupon || undefined,
        notes: notes.trim() || undefined,
        cart_items: items.map((i: CartItem) => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
      };

      const result = await createOrder(payload);

      // Order created successfully in backend! Clear cart
      clearCart();

      // Navigate to Order Success page
      navigate(`/pedido-confirmado/${result.order_number}`, {
        state: {
          orderNumber: result.order_number,
          whatsappUrl: result.whatsapp_url,
          total: result.total,
          customerName: customerName.trim(),
          fulfillmentType,
        },
      });
    } catch (err: any) {
      console.error('Falha ao criar pedido:', err);
      const msg = err.response?.data?.message || 'Falha ao registrar pedido. Tente novamente.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">Sua sacola está vazia</h2>
        <p className="text-sm text-gray-500 mb-6">Adicione itens à sacola antes de prosseguir com o pedido.</p>
        <Link to="/catalogo">
          <Button variant="primary">Explorar Cosméticos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link to="/carrinho" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-nude-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a sacola</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
          Finalização do Pedido
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Informe seus dados. Seu pedido será registrado no sistema e você poderá confirmar diretamente com nossa equipe pelo WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Identification */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-nude-700 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800">
                Seus Dados de Contato
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Seu Nome Completo"
                placeholder="Ex: Maria Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />

              <Input
                label="Telefone com WhatsApp"
                placeholder="Ex: 41 99999-9999"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                helperText="Número para confirmação do pedido"
              />
            </div>

            <Input
              label="E-mail (opcional)"
              type="email"
              placeholder="Ex: seuemail@exemplo.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          {/* 2. Delivery / Pickup */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-nude-700 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800">
                Forma de Recebimento
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                  fulfillmentType === 'pickup'
                    ? 'border-nude-600 bg-nude-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'pickup'}
                  onChange={() => setFulfillmentType('pickup')}
                  className="mt-1 text-nude-600 focus:ring-nude-400"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                    <Store className="w-4 h-4 text-nude-700" />
                    <span>Retirada na Loja</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Retire gratuitamente na loja em Almirante Tamandaré – PR.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                  fulfillmentType === 'delivery'
                    ? 'border-nude-600 bg-nude-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === 'delivery'}
                  onChange={() => setFulfillmentType('delivery')}
                  className="mt-1 text-nude-600 focus:ring-nude-400"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                    <Truck className="w-4 h-4 text-nude-700" />
                    <span>Entrega no Endereço</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Almirante Tamandaré e cidades vizinhas.
                  </p>
                </div>
              </label>
            </div>

            {/* Address fields if delivery */}
            {fulfillmentType === 'delivery' && (
              <div className="pt-4 border-t border-gray-100 space-y-4 animate-fadeIn">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Endereço para Entrega
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Rua / Avenida"
                      placeholder="Ex: Rua das Flores"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required={fulfillmentType === 'delivery'}
                    />
                  </div>
                  <div>
                    <Input
                      label="Número"
                      placeholder="Ex: 123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      required={fulfillmentType === 'delivery'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Complemento (Apto, Bloco)"
                    placeholder="Ex: Apto 12"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                  <Input
                    label="Bairro"
                    placeholder="Ex: Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    required={fulfillmentType === 'delivery'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="Estado"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800">
              Observações ou Instruções Especiais
            </h2>
            <textarea
              rows={3}
              placeholder="Ex: Gostaria para presente; preferência de horário para entrega, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-800 pb-3 border-b border-gray-100">
              Resumo do Pedido
            </h3>

            {/* Items summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-50">
              {items.map((item: CartItem) => (
                <div key={item.productId} className="pt-2 first:pt-0 flex justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-gray-400">Qtd: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatCurrency((item.promotionalPrice ?? item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon field */}
            <div className="pt-3 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50 text-xs text-emerald-800">
                  <span>Cupom <b>{appliedCoupon}</b> ativo</span>
                  <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 text-xs rounded-md border border-gray-200 uppercase"
                  />
                  <Button variant="outline" size="sm" type="button" onClick={handleApplyCoupon} loading={validatingCoupon}>
                    OK
                  </Button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(rawSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Forma de envio</span>
                <span>{fulfillmentType === 'pickup' ? 'Retirada (Grátis)' : 'Entrega Local'}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total a Pagar</span>
                <span className="text-2xl font-serif font-bold text-nude-900">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Big WhatsApp Checkout Button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              type="submit"
              loading={submitting}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <MessageSquare className="w-5 h-5 mr-1" />
              <span>Finalizar e Enviar pelo WhatsApp</span>
            </Button>

            <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">Como funciona?</p>
              <p>
                1. Seu pedido é registrado com segurança no banco de dados da loja.
              </p>
              <p>
                2. Uma mensagem com todos os itens, valores e forma de entrega é preparada automaticamente.
              </p>
              <p>
                3. A conversa oficial no WhatsApp da Eterna Cosméticos é aberta para você confirmar o envio.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
