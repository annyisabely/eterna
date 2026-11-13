import React, { useState, useEffect } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import adminApi from '../api/adminClient';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  brand_name?: string;
  category_name?: string;
  stock_status: 'available' | 'low_stock' | 'out_of_stock' | 'inactive';
}

interface MovementItem {
  id: string;
  product_name: string;
  type: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  created_at: string;
}

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'movements'>('status');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Movement Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [submittingMovement, setSubmittingMovement] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [invRes, movRes] = await Promise.all([
        adminApi.get('/inventory/report'),
        adminApi.get('/inventory/movements?limit=50'),
      ]);
      setItems(invRes.data.data ?? []);
      setMovements(movRes.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await adminApi.get('/reports/inventory-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventario-eterna.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Relatório CSV baixado com sucesso!');
    } catch (err) {
      toast.error('Falha ao exportar CSV.');
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Selecione um produto.');
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      toast.error('Informe uma quantidade válida.');
      return;
    }

    try {
      setSubmittingMovement(true);
      await adminApi.post('/inventory/movements', {
        product_id: selectedProductId,
        type: movementType,
        quantity: qtyNum,
        reason: reason.trim() || undefined,
      });
      toast.success('Movimentação de estoque registrada com sucesso!');
      setModalOpen(false);
      setSelectedProductId('');
      setQuantity('1');
      setReason('');
      fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao registrar movimentação.';
      toast.error(msg);
    } finally {
      setSubmittingMovement(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!statusFilter) return true;
    return item.stock_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Controle Operacional
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Estoque & Movimentações
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>Exportar CSV</span>
          </Button>

          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Registrar Movimentação</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Filter */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-6 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-nude-700 text-nude-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Posição Atual do Estoque ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'movements'
                ? 'border-nude-700 text-nude-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Histórico de Movimentações ({movements.length})
          </button>
        </div>

        {activeTab === 'status' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mb-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none"
          >
            <option value="">Todos os Estados</option>
            <option value="available">Disponível</option>
            <option value="low_stock">Estoque Baixo</option>
            <option value="out_of_stock">Sem Estoque</option>
            <option value="inactive">Inativo</option>
          </select>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando dados de estoque...</p>
          </div>
        ) : activeTab === 'status' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria / Marca</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-center">Nível Mínimo</th>
                  <th className="py-3 px-4 text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredItems.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {p.name}
                        {p.sku && <span className="text-gray-400 text-[10px] block font-mono">SKU: {p.sku}</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {p.category_name || '—'} / {p.brand_name || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sm">
                        {p.stock_quantity} un
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">
                        {p.min_stock_level} un
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.stock_status === 'out_of_stock' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                            Esgotado
                          </span>
                        )}
                        {p.stock_status === 'low_stock' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                            Estoque Baixo
                          </span>
                        )}
                        {p.stock_status === 'available' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Disponível
                          </span>
                        )}
                        {p.stock_status === 'inactive' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                            Inativo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-center">Qtd</th>
                  <th className="py-3 px-4 text-center">Anterior → Novo</th>
                  <th className="py-3 px-4">Motivo / Origem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(m.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {m.product_name}
                    </td>
                    <td className="py-3 px-4">
                      {m.type === 'in' && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Entrada
                        </span>
                      )}
                      {m.type === 'out' && (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Saída
                        </span>
                      )}
                      {m.type === 'sale' && (
                        <span className="text-blue-700 font-bold">Venda</span>
                      )}
                      {m.type === 'adjustment' && (
                        <span className="text-purple-700 font-bold">Ajuste Manual</span>
                      )}
                      {m.type === 'cancellation' && (
                        <span className="text-amber-700 font-bold">Cancelamento</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {m.quantity}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {m.previous_quantity} → <span className="font-bold text-gray-900">{m.new_quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {m.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Movement Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Movimentação de Estoque">
        <form onSubmit={handleCreateMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Selecione o Produto *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            >
              <option value="">Selecione o produto...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Atual: {item.stock_quantity} un)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Tipo de Movimentação *
            </label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            >
              <option value="in">Entrada de Mercadoria (+)</option>
              <option value="out">Saída / Avaria (-)</option>
              <option value="adjustment">Ajuste / Balanço (Define valor exato)</option>
            </select>
          </div>

          <Input
            label={movementType === 'adjustment' ? 'Novo Estoque Total' : 'Quantidade da Movimentação'}
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Motivo do Ajuste *
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Chegada de nota fiscal nº 1234; reposição semanal; produto quebrado..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={submittingMovement}>
              Confirmar Movimentação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

