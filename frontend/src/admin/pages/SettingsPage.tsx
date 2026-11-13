import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings
  const [storeName, setStoreName] = useState('Eterna Cosméticos');
  const [storeAddress, setStoreAddress] = useState('Almirante Tamandaré – Paraná');
  const [storePhone, setStorePhone] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeInstagram, setStoreInstagram] = useState('');
  const [storeHours, setStoreHours] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await adminApi.get('/settings');
        const s = res.data.data ?? {};
        if (s.store_name) setStoreName(s.store_name);
        if (s.store_address) setStoreAddress(s.store_address);
        if (s.store_phone) setStorePhone(s.store_phone);
        if (s.store_whatsapp) setStoreWhatsapp(s.store_whatsapp);
        if (s.store_email) setStoreEmail(s.store_email);
        if (s.store_instagram) setStoreInstagram(s.store_instagram);
        if (s.store_hours) setStoreHours(s.store_hours);
        if (s.store_about) setStoreAbout(s.store_about);
        if (s.delivery_enabled !== undefined) setDeliveryEnabled(s.delivery_enabled === 'true');
        if (s.pickup_enabled !== undefined) setPickupEnabled(s.pickup_enabled === 'true');
        if (s.min_order_value) setMinOrderValue(s.min_order_value);
        if (s.low_stock_threshold) setLowStockThreshold(s.low_stock_threshold);
      } catch (err) {
        console.error('Falha ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminApi.put('/settings', {
        store_name: storeName.trim(),
        store_address: storeAddress.trim(),
        store_phone: storePhone.trim(),
        store_whatsapp: storeWhatsapp.trim().replace(/\D/g, ''),
        store_email: storeEmail.trim(),
        store_instagram: storeInstagram.trim(),
        store_hours: storeHours.trim(),
        store_about: storeAbout.trim(),
        delivery_enabled: deliveryEnabled ? 'true' : 'false',
        pickup_enabled: pickupEnabled ? 'true' : 'false',
        min_order_value: minOrderValue,
        low_stock_threshold: lowStockThreshold,
      });
      toast.success('Configurações da loja salvas com sucesso!');
    } catch (err) {
      toast.error('Falha ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-2 font-serif">Carregando configurações da loja...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
          Loja & Atendimento
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
          Configurações da Eterna Cosméticos
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          As informações salvas aqui refletem automaticamente no rodapé, páginas institucionais e links de WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Store Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
            Identidade & Localização
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Comercial da Loja"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />

            <Input
              label="Endereço Completo / Cidade"
              placeholder="Ex: Av. Principal, 100 - Almirante Tamandaré - PR"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Sobre a Loja (História & Apresentação)
            </label>
            <textarea
              rows={3}
              value={storeAbout}
              onChange={(e) => setStoreAbout(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nude-400"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
            Canais de Atendimento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Número Oficial do WhatsApp *"
              placeholder="Ex: 5541999999999 (apenas dígitos com DDD)"
              value={storeWhatsapp}
              onChange={(e) => setStoreWhatsapp(e.target.value)}
              required
              helperText="Usado para geração do link direto de confirmação do pedido"
            />

            <Input
              label="Telefone Fixo / Celular Comercial"
              placeholder="Ex: (41) 3333-3333"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail de Contato"
              type="email"
              placeholder="contato@eternacosmeticos.com.br"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
            />

            <Input
              label="Link do Instagram Oficial"
              placeholder="https://instagram.com/eterna.cosmeticos"
              value={storeInstagram}
              onChange={(e) => setStoreInstagram(e.target.value)}
            />
          </div>

          <Input
            label="Horário de Atendimento da Loja"
            placeholder="Ex: Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"
            value={storeHours}
            onChange={(e) => setStoreHours(e.target.value)}
          />
        </div>

        {/* Commercial Rules */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
            Regras de Envio & Estoque
          </h2>

          <div className="flex flex-wrap gap-8 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                className="rounded border-gray-300 text-nude-600"
              />
              <span>Opção de Retirada na Loja Habilitada</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="rounded border-gray-300 text-nude-600"
              />
              <span>Opção de Entrega Habilitada</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Valor Mínimo para Pedido (R$)"
              type="number"
              step="0.01"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
            />

            <Input
              label="Alerta de Estoque Baixo Padrão (unidades)"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="primary" size="lg" type="submit" loading={saving}>
            Salvar Todas as Configurações
          </Button>
        </div>
      </form>
    </div>
  );
};

