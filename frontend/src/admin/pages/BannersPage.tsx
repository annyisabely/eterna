import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, ExternalLink } from 'lucide-react';
import adminApi from '../api/adminClient';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface BannerItem {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active: boolean;
  sort_order: number;
}

export const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/banners');
      setBanners(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setLinkUrl('');
    setButtonText('');
    setSortOrder('0');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingId(b.id);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setImageUrl(b.image_url);
    setLinkUrl(b.link_url || '');
    setButtonText(b.button_text || '');
    setSortOrder(String(b.sort_order || 0));
    setIsActive(b.is_active);
    setModalOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await adminApi.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.data.url);
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Falha no upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error('Informe a URL ou envie a imagem do banner.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        image_url: imageUrl.trim(),
        link_url: linkUrl.trim() || undefined,
        button_text: buttonText.trim() || undefined,
        sort_order: parseInt(sortOrder, 10) || 0,
        is_active: isActive,
      };

      if (editingId) {
        await adminApi.put(`/banners/${editingId}`, payload);
        toast.success('Banner atualizado!');
      } else {
        await adminApi.post('/banners', payload);
        toast.success('Banner criado!');
      }

      setModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error('Falha ao salvar banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este banner?')) return;
    try {
      await adminApi.delete(`/banners/${id}`);
      toast.success('Banner excluído!');
      fetchBanners();
    } catch {
      toast.error('Falha ao excluir banner.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Aparência da Loja
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Banners da Página Inicial
          </h1>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          <span>Novo Banner</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhum banner cadastrado. A loja exibirá o banner padrão elegante.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex flex-col"
              >
                <div className="relative h-44 bg-gray-200 overflow-hidden">
                  <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      b.is_active ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    {b.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    {b.subtitle && (
                      <p className="text-[10px] font-bold uppercase text-nude-700">{b.subtitle}</p>
                    )}
                    <h3 className="font-serif font-bold text-base text-gray-900">
                      {b.title || 'Sem título'}
                    </h3>
                    {b.link_url && (
                      <a
                        href={b.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-500 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <span>{b.link_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs">
                    <span className="text-gray-400">Ordem: {b.sort_order}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 text-gray-600 hover:text-nude-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Banner' : 'Novo Banner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título Principal"
            placeholder="Ex: Coleção Glamour Outono / Inverno"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Subtítulo / Chamada Superior"
            placeholder="Ex: Lançamento Exclusivo"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          <div>
            <Input
              label="URL da Imagem *"
              placeholder="https://exemplo.com/banner.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
            <label className="inline-flex items-center gap-1.5 text-xs text-nude-700 hover:underline cursor-pointer mt-1 font-semibold">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Enviando foto...' : 'Fazer upload de imagem local'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Link de Destino"
              placeholder="/catalogo?promo=true"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />

            <Input
              label="Texto do Botão"
              placeholder="Ex: Ver Coleção"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />
          </div>

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
            <span className="font-semibold text-gray-800">Banner Ativo na Loja</span>
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Salvar Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

