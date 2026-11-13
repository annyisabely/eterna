import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Archive, AlertTriangle } from 'lucide-react';
import adminApi from '../api/adminClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: string | number;
  promotional_price?: string | number;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  is_featured: boolean;
  category_name?: string;
  brand_name?: string;
  primary_image?: string;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/products', {
        params: { search: search || undefined, limit: 100 },
      });
      setProducts(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleArchive = async (id: string, name: string) => {
    if (!window.confirm(`Deseja arquivar o produto "${name}"? Ele deixará de aparecer no catálogo da loja, mas o histórico de pedidos será preservado.`)) {
      return;
    }

    try {
      await adminApi.patch(`/products/${id}/archive`);
      toast.success('Produto arquivado com sucesso!');
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao arquivar produto.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Catálogo & Estoque
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Gestão de Produtos
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchProducts();
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-nude-400"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link to="/admin/produtos/novo">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1" />
              <span>Novo Produto</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhum produto cadastrado. Clique em "Novo Produto" para adicionar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria / Marca</th>
                  <th className="py-3 px-4 text-center">Estoque</th>
                  <th className="py-3 px-4 text-right">Preço</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {products.map((p) => {
                  const isOutOfStock = p.stock_quantity <= 0;
                  const isLowStock = !isOutOfStock && p.stock_quantity <= p.min_stock_level;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.primary_image ? (
                              <img src={p.primary_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-serif text-nude-500">EC</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block line-clamp-1">
                              {p.name}
                            </span>
                            {p.sku && <span className="text-gray-400 text-[10px] font-mono">SKU: {p.sku}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="block text-gray-800">{p.category_name || '—'}</span>
                        <span className="text-gray-400 text-[11px]">{p.brand_name || '—'}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold">
                          {isOutOfStock ? (
                            <span className="text-rose-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> 0 un
                            </span>
                          ) : isLowStock ? (
                            <span className="text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> {p.stock_quantity} un
                            </span>
                          ) : (
                            <span className="text-emerald-700">{p.stock_quantity} un</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {p.promotional_price && Number(p.promotional_price) > 0 ? (
                          <div>
                            <span className="text-[11px] text-gray-400 line-through block">
                              {formatCurrency(p.price)}
                            </span>
                            <span className="font-serif font-bold text-nude-900">
                              {formatCurrency(p.promotional_price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-serif font-bold text-gray-900">
                            {formatCurrency(p.price)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/produtos/${p.id}/editar`}
                            className="p-1 text-gray-500 hover:text-nude-700 transition-colors"
                            title="Editar produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleArchive(p.id, p.name)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Arquivar produto"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

