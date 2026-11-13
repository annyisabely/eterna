import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Heart, ShieldCheck, Clock, Phone } from 'lucide-react';
import { getStoreSettings, StoreSettings } from '../api/settings';
import { Button } from '../components/ui/Button';

export const AboutPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
          Nossa História
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
          Sobre a Eterna Cosméticos
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Localizada em Almirante Tamandaré – Paraná, oferecendo produtos de beleza selecionados com cuidado e dedicação.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-xs space-y-6 leading-relaxed text-gray-700 text-sm">
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            Beleza, Confiança e Cuidado
          </h2>
          <p>
            {settings.store_about ||
              'A Eterna Cosméticos nasceu com a missão de proporcionar uma experiência sofisticada e acolhedora no universo da beleza e dos cosméticos em Almirante Tamandaré. Acreditamos que o autocuidado diário é uma forma de expressão e valorização pessoal.'}
          </p>
          <p>
            Trabalhamos com marcas consagradas de maquiagem, dermocosméticos, cuidados faciais, perfumaria e tratamento capilar, sempre priorizando a qualidade e a satisfação de cada cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-nude-100 text-nude-700 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-gray-900">Nossa Missão</h3>
            <p className="text-xs text-gray-500">
              Elevar a autoestima e o bem-estar de nossos clientes com os melhores cosméticos do mercado.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-nude-100 text-nude-700 flex items-center justify-center mb-2">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-gray-900">Atendimento Próximo</h3>
            <p className="text-xs text-gray-500">
              Consultoria e carinho no atendimento, ajudando você a escolher os produtos ideais.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-nude-100 text-nude-700 flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-gray-900">Autenticidade</h3>
            <p className="text-xs text-gray-500">
              Produtos 100% originais com procedência garantida e respeito total ao consumidor.
            </p>
          </div>
        </div>
      </div>

      {/* Store Location Info Card */}
      <div className="bg-nude-50/70 rounded-2xl border border-nude-200/70 p-8 sm:p-10 space-y-5">
        <h2 className="text-lg font-serif font-bold text-gray-900">
          Informações da Loja
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-700">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-nude-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Endereço</p>
              <p>{settings.store_address || 'Almirante Tamandaré – Paraná'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-nude-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Horário de Atendimento</p>
              <p>{settings.store_hours || 'Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h'}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link to="/catalogo">
            <Button variant="primary">Conhecer o Catálogo</Button>
          </Link>
          <Link to="/contato">
            <Button variant="outline">Falar Conosco</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

