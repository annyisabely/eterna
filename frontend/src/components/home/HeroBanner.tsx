import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Banner, getBanners } from '../../api/banners';
import { Button } from '../ui/Button';

export const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getBanners()
      .then((data) => setBanners(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    // Default elegant editorial hero
    return (
      <div className="relative bg-gradient-to-r from-nude-100 via-cream to-mocha-100 overflow-hidden border-b border-nude-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/80 text-pink-900 text-xs font-semibold uppercase tracking-wider border border-pink-200/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Eterna • Cosméticos e Acessórios</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
              Sua beleza merece o cuidado mais sofisticado.
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Descubra nossa curadoria exclusiva de maquiagens, perfumaria importada, skincare, cuidados capilares e acessórios em Almirante Tamandaré. Monte sua sacola e confirme pelo WhatsApp oficial com atendimento exclusivo.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link to="/catalogo">
                <Button variant="primary" size="lg">
                  Explorar Catálogo
                </Button>
              </Link>
              <Link to="/catalogo?promo=true">
                <Button variant="outline" size="lg">
                  Ver Ofertas Especiais
                </Button>
              </Link>
            </div>
          </div>

          {/* Editorial Card Showcase */}
          <div className="w-full md:w-1/2 max-w-md rounded-3xl bg-white/90 backdrop-blur-xs border border-pink-100 p-6 sm:p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />
            <div className="relative mb-3">
              <img
                src="/logo-eterna.jpg"
                alt="Eterna Cosméticos e Acessórios"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-pink-500/20 shadow-md group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-nude-900">ETERNA</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-pink-700 font-semibold mt-0.5">
              Cosméticos e Acessórios
            </span>
            <div className="w-16 h-0.5 bg-pink-300/80 my-3 rounded-full" />
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "Realçando sua essência com produtos originais, marcas consagradas e atendimento próximo em Almirante Tamandaré."
            </p>

            {/* Quick badges preview */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-gray-100 text-[10px]">
              <div className="p-2 rounded-xl bg-pink-50/60 font-semibold text-pink-900">
                ✨ Maquiagem
              </div>
              <div className="p-2 rounded-xl bg-pink-50/60 font-semibold text-pink-900">
                🌸 Perfumaria
              </div>
              <div className="p-2 rounded-xl bg-pink-50/60 font-semibold text-pink-900">
                🌿 Skincare
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative bg-nude-50 overflow-hidden border-b border-gray-100">
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.image_url}
              alt={banner.title || 'Banner Eterna Cosméticos'}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-lg text-white space-y-4">
                  {banner.subtitle && (
                    <span className="inline-block text-xs uppercase tracking-widest font-semibold text-nude-300">
                      {banner.subtitle}
                    </span>
                  )}
                  {banner.title && (
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                      {banner.title}
                    </h2>
                  )}
                  {banner.link_url && (
                    <div className="pt-2">
                      <Link to={banner.link_url}>
                        <Button variant="primary" size="lg">
                          {banner.button_text || 'Conhecer Mais'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/70 hover:bg-white text-gray-800 backdrop-blur-xs transition-colors shadow-md"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/70 hover:bg-white text-gray-800 backdrop-blur-xs transition-colors shadow-md"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-nude-600 w-6' : 'bg-white/60 hover:bg-white'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

