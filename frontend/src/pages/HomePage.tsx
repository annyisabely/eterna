import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ProductGrid } from '../components/product/ProductGrid';
import { Product, getProducts } from '../api/products';
import { Category, getCategories } from '../api/categories';
import { Sparkles, HeartHandshake, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topSellers, setTopSellers] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [cats, featRes, newRes, topRes, allRes] = await Promise.all([
          getCategories(),
          getProducts({ is_featured: true, limit: 4 }),
          getProducts({ sort: 'newest', limit: 8 }),
          getProducts({ sort: 'popular', limit: 4 }),
          getProducts({ limit: 12 }),
        ]);

        if (!isMounted) return;
        setCategories(cats);
        setFeaturedProducts(featRes.data);
        setNewArrivals(newRes.data);
        setTopSellers(topRes.data.length ? topRes.data : newRes.data.slice(0, 4));
        setPromotions(allRes.data.filter((p) => p.promotional_price && Number(p.promotional_price) > 0));
      } catch (err) {
        console.error('Falha ao carregar dados da página inicial:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Categorias */}
      <CategoryGrid categories={categories} />

      {/* 3. Produtos em Destaque */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
                Seleção Especial
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
                Destaques da Eterna
              </h2>
            </div>
            <Link
              to="/catalogo?sort=featured"
              className="text-xs font-semibold uppercase tracking-wider text-nude-700 hover:text-nude-900 transition-colors"
            >
              Ver Mais →
            </Link>
          </div>
          <ProductGrid products={featuredProducts} loading={loading} />
        </section>
      )}

      {/* 4. Lançamentos & Novidades */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-mocha-600">
              Chegaram na Loja
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
              Lançamentos & Novidades
            </h2>
          </div>
          <Link
            to="/catalogo?sort=newest"
            className="text-xs font-semibold uppercase tracking-wider text-nude-700 hover:text-nude-900 transition-colors"
          >
            Ver Todos →
          </Link>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* 5. Editorial Banner intermediário */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-mocha-900 to-nude-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-block text-xs uppercase tracking-widest font-semibold text-nude-300">
              Almirante Tamandaré – Paraná
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight">
              Sua experiência completa em cosméticos e perfumaria
            </h2>
            <p className="text-xs sm:text-sm text-mocha-200 leading-relaxed">
              Compre online com segurança, escolha entre entrega ou retirada na loja e receba atendimento exclusivo e personalizado pelo nosso WhatsApp.
            </p>
          </div>
          <div className="shrink-0">
            <Link to="/catalogo">
              <Button variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-cream">
                Conhecer Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Ofertas & Promoções */}
      {promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-700">
                Preços Especiais
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
                Ofertas da Semana
              </h2>
            </div>
            <Link
              to="/catalogo?promo=true"
              className="text-xs font-semibold uppercase tracking-wider text-rose-700 hover:text-rose-900 transition-colors"
            >
              Todas as Ofertas →
            </Link>
          </div>
          <ProductGrid products={promotions} loading={loading} />
        </section>
      )}

      {/* 7. Produtos Mais Vendidos */}
      {topSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
                Os Favoritos da Eterna
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
                Produtos Mais Vendidos
              </h2>
            </div>
            <Link
              to="/catalogo?sort=popular"
              className="text-xs font-semibold uppercase tracking-wider text-nude-700 hover:text-nude-900 transition-colors"
            >
              Ver Ranking →
            </Link>
          </div>
          <ProductGrid products={topSellers} loading={loading} />
        </section>
      )}

      {/* 8. Diferenciais */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
              Nossa Garantia
            </span>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mt-1">
              Por que escolher a Eterna Cosméticos?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-nude-100 text-nude-700 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-semibold text-gray-900">Curadoria Rigorosa</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Selecionamos apenas marcas consolidadas e produtos dermatologicamente e tecnicamente testados.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-nude-100 text-nude-700 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-semibold text-gray-900">Atendimento Humano</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dúvidas sobre o produto ideal para sua pele ou cabelo? Nossa equipe atende diretamente pelo WhatsApp.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-nude-100 text-nude-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-semibold text-gray-900">Agilidade Local</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Localizada em Almirante Tamandaré – PR, com facilidade para retirada ou entrega expressa local.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

