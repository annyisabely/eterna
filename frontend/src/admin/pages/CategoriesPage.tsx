import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import adminApi from '../api/adminClient';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/categories');
      setCategories(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setSortOrder('0');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryItem) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description || '');
    setImageUrl(c.image_url || '');
    setSortOrder(String(c.sort_order || 0));
    setIsActive(c.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Informe o nome da categoria.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        sort_order: parseInt(sortOrder, 10) || 0,
        is_active: isActive,
      };

      if (editingId) {
        await adminApi.put(`/categories/${editingId}`, payload);
        toast.success('Categoria atualizada!');
      } else {
        await adminApi.post('/categories', payload);
        toast.success('Categoria criada!');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao salvar categoria.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir a categoria "${name}"?`)) return;
    try {
      await adminApi.delete(`/categories/${id}`);
      toast.success('Categoria excluída!');
      fetchCategories();
    } catch (err: any) {
      toast.error('Não é possível excluir categoria associada a produtos.');
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
            Categorias de Cosméticos
          </h1>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          <span>Nova Categoria</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando categorias...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{c.slug}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{c.description || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 text-gray-500 hover:text-nude-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
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
        title={editingId ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Maquiagem, Skincare, Cabelos..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              rows={2}
              placeholder="Breve descrição da categoria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            />
          </div>

          <Input
            label="URL da Imagem / Ícone"
            placeholder="https://exemplo.com/imagem.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <Input
            label="Ordem de Exibição"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />

          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-nude-600"
            />
            <span className="font-semibold text-gray-800">Categoria Ativa na Loja</span>
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

