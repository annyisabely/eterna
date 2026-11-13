import React, { useState, useEffect } from 'react';
import { Plus, Tag, Check, X } from 'lucide-react';
import adminApi from '../api/adminClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface CouponItem {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: string | number;
  min_order_value: string | number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  valid_until?: string;
}

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/coupons');
      setCoupons(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar cupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) {
      toast.error('Informe código e valor do cupom.');
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.post('/coupons', {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        type,
        value: parseFloat(value),
        min_order_value: parseFloat(minOrderValue) || 0,
        max_uses: maxUses ? parseInt(maxUses, 10) : undefined,
        valid_until: validUntil ? new Date(validUntil).toISOString() : undefined,
        is_active: true,
      });

      toast.success('Cupom criado com sucesso!');
      setModalOpen(false);
      setCode('');
      setDescription('');
      setValue('');
      setMinOrderValue('0');
      setMaxUses('');
      setValidUntil('');
      fetchCoupons();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao criar cupom.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    try {
      await adminApi.put(`/coupons/${coupon.id}`, {
        ...coupon,
        is_active: !coupon.is_active,
      });
      toast.success(`Cupom ${coupon.is_active ? 'desativado' : 'ativado'}!`);
      fetchCoupons();
    } catch (err) {
      toast.error('Falha ao atualizar cupom.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Campanhas & Promoções
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Cupons de Desconto
          </h1>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          <span>Criar Novo Cupom</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando cupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhum cupom de desconto criado ainda.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Desconto</th>
                <th className="py-3 px-4">Pedido Mínimo</th>
                <th className="py-3 px-4 text-center">Usos</th>
                <th className="py-3 px-4">Validade</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-nude-900 bg-nude-50 px-2 py-0.5 rounded border border-nude-200">
                      {c.code}
                    </span>
                    {c.description && <p className="text-gray-400 text-[11px] mt-0.5">{c.description}</p>}
                  </td>

                  <td className="py-3 px-4 font-bold text-gray-900">
                    {c.type === 'percentage' ? `${c.value}% OFF` : formatCurrency(c.value)}
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    {Number(c.min_order_value) > 0 ? formatCurrency(c.min_order_value) : 'Sem mínimo'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-gray-900">{c.used_count}</span>
                    {c.max_uses && <span className="text-gray-400"> / {c.max_uses}</span>}
                  </td>

                  <td className="py-3 px-4 text-gray-500">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString('pt-BR') : 'Sem expiração'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                        c.is_active
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {c.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Cupom de Desconto">
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <Input
            label="Código do Cupom"
            placeholder="Ex: PRIMEIRACOMPRA, BEMVINDA10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />

          <Input
            label="Descrição Interna"
            placeholder="Ex: Campanha de Dia das Mães"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Tipo de Desconto
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <Input
              label={type === 'percentage' ? 'Porcentagem (ex: 10)' : 'Valor em Reais (ex: 20)'}
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor Mínimo do Pedido (R$)"
              type="number"
              step="0.01"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
            />

            <Input
              label="Limite Máximo de Usos"
              type="number"
              placeholder="Ilimitado"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>

          <Input
            label="Válido até (Opcional)"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Criar Cupom
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

