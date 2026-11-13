import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Check, Star } from 'lucide-react';
import adminApi from '../api/adminClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [price, setPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images
  const [images, setImages] = useState<Array<{ id?: string; url: string; is_primary?: boolean }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [catRes, brandRes] = await Promise.all([
          adminApi.get('/categories'),
          adminApi.get('/brands'),
        ]);
        setCategories(catRes.data.data ?? []);
        setBrands(brandRes.data.data ?? []);

        if (isEditing) {
          // fetch product data
          // find by id in product list or dedicated endpoint
          const res = await adminApi.get('/products', { params: { limit: 200 } });
          const found = (res.data.data ?? []).find((p: any) => p.id === id);
          if (found) {
            setName(found.name);
            setSku(found.sku || '');
            setDescription(found.description || '');
            setCategoryId(found.category_id || '');
            setBrandId(found.brand_id || '');
            setPrice(String(found.price));
            setPromotionalPrice(found.promotional_price ? String(found.promotional_price) : '');
            setStockQuantity(String(found.stock_quantity));
            setMinStockLevel(String(found.min_stock_level));
            setIsFeatured(!!found.is_featured);
            setIsActive(!!found.is_active);

            // Fetch images
            const detailRes = await adminApi.get(`/products/${found.slug}`);
            if (detailRes.data.data?.images) {
              setImages(detailRes.data.data.images);
            }
          }
        }
      } catch (err) {
        console.error('Falha ao inicializar formulário:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      const res = await adminApi.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = res.data.data.url;
      setImages((prev) => [...prev, { url: newUrl, is_primary: prev.length === 0 }]);
      toast.success('Imagem enviada com sucesso!');
    } catch (err) {
      toast.error('Falha no upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Informe o nome do produto.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Informe um preço válido.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        brand_id: brandId || undefined,
        price: parseFloat(price),
        promotional_price: promotionalPrice ? parseFloat(promotionalPrice) : null,
        stock_quantity: parseInt(stockQuantity, 10) || 0,
        min_stock_level: parseInt(minStockLevel, 10) || 5,
        is_featured: isFeatured,
        is_active: isActive,
      };

      let productId = id;
      if (isEditing) {
        await adminApi.put(`/products/${id}`, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        const res = await adminApi.post('/products', payload);
        productId = res.data.data.id;
        toast.success('Produto cadastrado com sucesso!');
      }

      // If we have images and product id, sync images
      if (productId && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img.id) {
            // newly added image
            await adminApi.post(`/uploads/products/${productId}`, {
              url: img.url,
              sort_order: i,
              is_primary: img.is_primary,
            });
          }
        }
      }

      navigate('/admin/produtos');
    } catch (err: any) {
      console.error('Falha ao salvar produto:', err);
      const msg = err.response?.data?.message || 'Falha ao salvar produto.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-2 font-serif">Carregando dados do produto...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to="/admin/produtos"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-nude-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para lista de produtos</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-nude-700 block">
          {isEditing ? 'Edição' : 'Novo Cadastro'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-0.5">
          {isEditing ? `Editar: ${name}` : 'Cadastrar Novo Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
            Identificação do Produto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome do Produto"
                placeholder="Ex: Batom Líquido Matte Rosa Glamour"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Código / SKU"
                placeholder="Ex: BAT-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Marca
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
              >
                <option value="">Selecione uma marca</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Descrição Detalhada
            </label>
            <textarea
              rows={4}
              placeholder="Descreva benefícios, modo de usar, características e acabamento do produto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
            Valores & Controle de Estoque
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preço Regular (R$)"
              type="number"
              step="0.01"
              placeholder="Ex: 89.90"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <Input
              label="Preço Promocional (R$) (Opcional)"
              type="number"
              step="0.01"
              placeholder="Ex: 69.90"
              value={promotionalPrice}
              onChange={(e) => setPromotionalPrice(e.target.value)}
              helperText="Se preenchido, exibirá badge de desconto no catálogo"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantidade em Estoque"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
              helperText="Chegando a zero, aparecerá como esgotado na loja"
            />

            <Input
              label="Margem Mínima de Estoque"
              type="number"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(e.target.value)}
              helperText="Dispara alerta de reposição necessária no painel"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
            Fotos do Produto
          </h2>

          <div className="flex flex-wrap gap-4 items-center">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(idx)}
                    className={`p-1 rounded-full ${
                      img.is_primary ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'
                    }`}
                    title="Foto principal"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 rounded-full bg-red-600 text-white"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute bottom-1 left-1 bg-nude-800 text-white text-[9px] px-1 rounded font-bold">
                    Capa
                  </span>
                )}
              </div>
            ))}

            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-nude-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50">
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-500 font-semibold">
                {uploadingImage ? 'Enviando...' : 'Adicionar'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs flex flex-wrap gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-nude-600 focus:ring-nude-400 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-xs text-gray-800 uppercase tracking-wider block">
                Produto em Destaque
              </span>
              <span className="text-xs text-gray-500">Aparecerá na vitrine da página inicial</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-nude-600 focus:ring-nude-400 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-xs text-gray-800 uppercase tracking-wider block">
                Produto Ativo
              </span>
              <span className="text-xs text-gray-500">Visível aos clientes para compra</span>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/admin/produtos">
            <Button variant="ghost" size="md">
              Cancelar
            </Button>
          </Link>
          <Button variant="primary" size="lg" type="submit" loading={submitting}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
        </div>
      </form>
    </div>
  );
};

