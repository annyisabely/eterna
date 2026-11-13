import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import adminApi from '../api/adminClient';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
}

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/brands');
      setBrands(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar marcas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setLogoUrl('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: BrandItem) => {
    setEditingId(b.id);
    setName(b.name);
    setLogoUrl(b.logo_url || '');
    setIsActive(b.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Informe o nome da marca.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        logo_url: logoUrl.trim() || undefined,
        is_active: isActive,
      };

      if (editingId) {
        await adminApi.put(`/brands/${editingId}`, payload);
        toast.success('Marca atualizada!');
      } else {
        await adminApi.post('/brands', payload);
        toast.success('Marca criada!');
      }

      setModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao salvar marca.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir a marca "${name}"?`)) return;
    try {
      await adminApi.delete(`/brands/${id}`);
      toast.success('Marca excluída!');
      fetchBrands();
    } catch (err: any) {
      toast.error('Não é possível excluir marca com produtos associados.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Catálogo
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Marcas & Fabricantes
          </h1>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          <span>Nova Marca</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando marcas...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhuma marca cadastrada.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Marca</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-3">
                    {b.logo_url && (
                      <img src={b.logo_url} alt="" className="w-6 h-6 object-contain rounded" />
                    )}
                    <span>{b.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">{b.slug}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {b.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 text-gray-500 hover:text-nude-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Marca' : 'Nova Marca'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Marca"
            placeholder="Ex: Ruby Rose, Eudora, Boca Rosa, O Boticário..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="URL da Logo (Opcional)"
            placeholder="https://exemplo.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />

          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-nude-600"
            />
            <span className="font-semibold text-gray-800">Marca Ativa na Loja</span>
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

