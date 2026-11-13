import React, { useState, useEffect } from 'react';
import { Search, Eye, Phone, Mail, ShoppingBag } from 'lucide-react';
import adminApi from '../api/adminClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

interface CustomerDetail extends CustomerItem {
  orders: Array<{
    id: string;
    order_number: string;
    status: string;
    total: string | number;
    created_at: string;
  }>;
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/customers', { params: { search: search || undefined } });
      setCustomers(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewCustomer = async (id: string) => {
    try {
      setLoadingDetail(true);
      const res = await adminApi.get(`/customers/${id}`);
      setSelectedCustomer(res.data.data);
    } catch (err) {
      console.error('Falha ao carregar cliente:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Relacionamento & Atendimento
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Clientes Cadastrados
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCustomers();
          }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-nude-400 w-64"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando clientes...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhum cliente cadastrado no momento.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Telefone / WhatsApp</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Primeiro Contato</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-gray-600">{c.phone}</td>
                  <td className="py-3 px-4 text-gray-500">{c.email || '—'}</td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleViewCustomer(c.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-nude-50 text-nude-700 hover:bg-nude-100 font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Histórico</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Histórico do Cliente"
      >
        {selectedCustomer && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-cream rounded-xl border border-nude-100 space-y-1">
              <h4 className="font-serif font-bold text-base text-gray-900">
                {selectedCustomer.name}
              </h4>
              <p className="text-gray-600 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-nude-700" />
                <span>{selectedCustomer.phone}</span>
              </p>
              {selectedCustomer.email && (
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-nude-700" />
                  <span>{selectedCustomer.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold uppercase tracking-wider text-gray-700">
                Pedidos Realizados ({selectedCustomer.orders?.length || 0})
              </h5>

              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-gray-400 italic py-4 text-center">
                  Nenhum pedido vinculado a este cliente.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {selectedCustomer.orders?.map((o) => (
                    <div key={o.id} className="p-3 flex justify-between items-center bg-white hover:bg-gray-50">
                      <div>
                        <span className="font-mono font-bold text-nude-800">{o.order_number}</span>
                        <p className="text-[11px] text-gray-400">
                          {new Date(o.created_at).toLocaleDateString('pt-BR')} • {o.status}
                        </p>
                      </div>
                      <span className="font-serif font-bold text-gray-900">
                        {formatCurrency(o.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

