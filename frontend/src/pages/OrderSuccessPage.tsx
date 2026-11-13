import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ArrowRight, Store, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();

  const state = (location.state as {
    orderNumber?: string;
    whatsappUrl?: string;
    total?: number;
    customerName?: string;
    fulfillmentType?: 'pickup' | 'delivery';
  }) || {};

  const effectiveOrderNumber = orderNumber || state.orderNumber || 'ETC-PEDIDO';
  const whatsappUrl = state.whatsappUrl;

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center space-y-8">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
          Pedido Registrado
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
          Obrigada pela sua compra!
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          {state.customerName ? `Olá ${state.customerName}! ` : ''}
          Seu pedido foi registrado no sistema com o identificador:
        </p>
        <div className="inline-block px-5 py-2 rounded-lg bg-nude-50 border border-nude-300 font-mono text-base font-bold text-nude-900 mt-2">
          {effectiveOrderNumber}
        </div>
      </div>

      {/* Main WhatsApp Action Card */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-xl text-left space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-gray-900">
              Passo Final: Enviar Pedido pelo WhatsApp
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              O seu pedido já está no banco de dados da loja. Agora clique no botão abaixo para abrir a conversa com a Eterna Cosméticos no WhatsApp com a mensagem detalhada já montada.
            </p>
          </div>
        </div>

        {state.total !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center text-xs">
            <span className="text-gray-600">Valor total do pedido:</span>
            <span className="text-base font-serif font-bold text-nude-900">
              {formatCurrency(state.total)}
            </span>
          </div>
        )}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="primary"
              fullWidth
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 py-4 text-base"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              <span>Abrir WhatsApp e Enviar Pedido</span>
            </Button>
          </a>
        ) : (
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleOpenWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 py-4 text-base"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span>Abrir WhatsApp da Loja</span>
          </Button>
        )}

        {/* Important Warning Notice */}
        <div className="border-t border-gray-100 pt-4 flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50/70 p-3.5 rounded-lg border border-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Atenção:</strong> A venda só é considerada confirmada após o envio da mensagem e o retorno da nossa equipe pelo WhatsApp confirmando a disponibilidade e os detalhes de retirada ou entrega.
          </p>
        </div>
      </div>

      {/* Return to Catalog */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/catalogo">
          <Button variant="outline" size="md">
            Continuar Comprando
          </Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="md">
            Voltar para a Página Inicial
          </Button>
        </Link>
      </div>
    </div>
  );
};

