import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Mail, Clock, MessageSquare, Send } from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { getStoreSettings, StoreSettings } from '../api/settings';
import { Button } from '../components/ui/Button';

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(() => {});
  }, []);

  const whatsappUrl = settings.store_whatsapp
    ? `https://wa.me/${settings.store_whatsapp}?text=${encodeURIComponent(
        'Olá Eterna Cosméticos! Gostaria de tirar uma dúvida sobre os produtos.'
      )}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
          Canais de Atendimento
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
          Fale com a Eterna Cosméticos
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Estamos prontos para atender você com toda a atenção e carinho que você merece.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WhatsApp Highlight Card */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-8 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Atendimento via WhatsApp
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Nosso canal principal para tirar dúvidas sobre produtos, confirmar pedidos montados no site, consultar disponibilidade e combinar entregas.
              </p>
            </div>

            {settings.store_whatsapp && (
              <p className="font-mono text-sm font-semibold text-emerald-800">
                +{settings.store_whatsapp}
              </p>
            )}
          </div>

          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                <span>Conversar no WhatsApp</span>
              </Button>
            </a>
          ) : (
            <Button variant="primary" fullWidth size="lg" disabled>
              WhatsApp em configuração
            </Button>
          )}
        </div>

        {/* Store Info Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-serif font-bold text-gray-900 pb-3 border-b border-gray-100">
            Informações da Loja
          </h2>

          <div className="space-y-4 text-xs text-gray-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-nude-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Localização</p>
                <p>{settings.store_address || 'Almirante Tamandaré – Paraná'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-nude-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Horário de Atendimento</p>
                <p>{settings.store_hours || 'Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h'}</p>
              </div>
            </div>

            {settings.store_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-nude-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">E-mail</p>
                  <p>{settings.store_email}</p>
                </div>
              </div>
            )}

            {settings.store_instagram && (
              <div className="flex items-start gap-3">
                <InstagramIcon className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Instagram</p>
                  <a
                    href={settings.store_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-700 hover:text-pink-800 font-medium hover:underline flex items-center gap-1"
                  >
                    @eternacosmeticos
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
