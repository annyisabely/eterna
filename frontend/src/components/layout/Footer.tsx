import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Mail, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { getStoreSettings, StoreSettings } from '../../api/settings';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <footer className="bg-mocha-900 text-mocha-100 border-t border-mocha-800">
      {/* Value propositions banner */}
      <div className="border-b border-mocha-800/60 bg-mocha-950/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-nude-600/20 text-nude-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Produtos 100% Originais</h4>
              <p className="text-xs text-mocha-200">Garantia de procedência e alta qualidade cosmética</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-nude-600/20 text-nude-300 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Entrega & Retirada</h4>
              <p className="text-xs text-mocha-200">Almirante Tamandaré e região metropolitana de Curitiba</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-nude-600/20 text-nude-300 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Atendimento Personalizado</h4>
              <p className="text-xs text-mocha-200">Consultoria e suporte direto pelo WhatsApp oficial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Story */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-eterna.jpg"
                alt="Eterna Cosméticos e Acessórios"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/40 shadow-md"
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-white">
                  ETERNA
                </span>
                <p className="text-[10px] uppercase tracking-[0.22em] text-pink-300 font-semibold">
                  Cosméticos e Acessórios
                </p>
              </div>
            </div>
            <p className="text-xs text-mocha-200 leading-relaxed">
              {settings.store_about ||
                'Sua loja de referência em cosméticos, maquiagem, skincare, cuidados capilares e acessórios em Almirante Tamandaré – PR. Beleza, sofisticação e cuidado em cada detalhe.'}
            </p>
            {settings.store_instagram && (
              <a
                href={settings.store_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-pink-300 hover:text-white transition-colors font-medium"
              >
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <span>@eternacosmeticos</span>
              </a>
            )}
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-nude-300 mb-4">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="hover:text-white transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link to="/catalogo?promo=true" className="hover:text-white transition-colors">
                  Promoções & Ofertas
                </Link>
              </li>
              <li>
                <Link to="/favoritos" className="hover:text-white transition-colors">
                  Meus Favoritos
                </Link>
              </li>
              <li>
                <Link to="/carrinho" className="hover:text-white transition-colors">
                  Sacola de Compras
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-nude-300 mb-4">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">
                  Sobre a Eterna
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">
                  Atendimento & Contato
                </Link>
              </li>
              <li>
                <span className="text-mocha-400">Política de Privacidade & LGPD</span>
              </li>
              <li>
                <span className="text-mocha-400">Termos de Compra e Retirada</span>
              </li>
            </ul>
          </div>

          {/* Local Store & Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-nude-300 mb-4">
              Loja & Atendimento
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-nude-400 shrink-0 mt-0.5" />
                <span>{settings.store_address || 'Almirante Tamandaré – Paraná'}</span>
              </li>
              {settings.store_whatsapp && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-nude-400 shrink-0" />
                  <a
                    href={`https://wa.me/${settings.store_whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white underline decoration-nude-500/50"
                  >
                    WhatsApp: (41) 99994-9204
                  </a>
                </li>
              )}
              {settings.store_email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-nude-400 shrink-0" />
                  <span>{settings.store_email}</span>
                </li>
              )}
              {settings.store_hours && (
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-nude-400 shrink-0 mt-0.5" />
                  <span>{settings.store_hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-mocha-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-mocha-300 gap-4">
          <p>© {new Date().getFullYear()} Eterna Cosméticos. Todos os direitos reservados. Almirante Tamandaré – PR.</p>
          <p className="text-mocha-400">
            Plataforma Profissional Eterna Cosméticos
          </p>
        </div>
      </div>
    </footer>
  );
};
