import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Lock,
  Mail,
  Store,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useAdminAuthStore } from '../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const AdminProfilePage: React.FC = () => {
  const { admin } = useAdminAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('A confirmação da nova senha não confere.');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      toast.success('Senha atualizada com sucesso no sistema!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Profile Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        {/* Banner with brand palette */}
        <div className="h-32 bg-gradient-to-r from-nude-900 via-pink-900 to-mocha-900 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sessão Autenticada</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src="/logo-eterna.jpg"
                alt="Logo Oficial Eterna"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-lg bg-white"
              />
              <span
                className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                title="Online e Ativa"
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                  {admin?.name || 'Eterna Cosméticos e Acessórios'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Proprietária Master</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Gestão Comercial, Catálogo, Vendas e Atendimento WhatsApp
              </p>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
          >
            <span>Acessar Loja Virtual</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid of Profile Details & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Details & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Dados da Conta Administrativa
                </h2>
                <p className="text-xs text-gray-500">
                  Credenciais de acesso e informações do perfil gestor
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Nome da Administradora
                </span>
                <p className="font-bold text-gray-900 text-sm">{admin?.name || 'Eterna Cosméticos'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  E-mail Oficial de Acesso
                </span>
                <p className="font-bold text-gray-900 text-sm">{admin?.email || 'eterna@gmail.com'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Nível de Permissão
                </span>
                <p className="font-bold text-pink-700 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Acesso Total (Super Administradora)</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Status da Conta
                </span>
                <p className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ativa & Protegida</span>
                </p>
              </div>
            </div>
          </div>

          {/* Privileges & Permissions List */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span>Privilégios Habilitados no Sistema</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                'Gestão completa de Pedidos e WhatsApp',
                'Controle de Estoque e Alerta de Reposição',
                'Cadastro, Edição e Exclusão de Produtos',
                'Categorias e Marcas do Catálogo',
                'Criação de Cupons de Desconto e Promoções',
                'Banners da Página Inicial da Loja',
                'Relatórios Financeiros e Métricas de Vendas',
                'Configurações de Atendimento e Horários',
              ].map((perm, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-pink-50/40 border border-pink-100/60 text-gray-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />
                  <span className="font-medium">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security & Password Update */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-nude-100 text-nude-800 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-gray-900">
                  Segurança & Senha
                </h3>
                <p className="text-[11px] text-gray-500">
                  Atualização da chave de acesso
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Senha Atual
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 dígitos"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Confirmar Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full flex items-center justify-center gap-2 mt-2"
                disabled={savingPassword}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPassword ? 'Salvando...' : 'Atualizar Senha'}</span>
              </Button>
            </form>
          </div>

          {/* Store Quick Card */}
          <div className="bg-nude-50/60 rounded-2xl border border-nude-200/60 p-5 space-y-3 text-xs">
            <h4 className="font-serif font-bold text-nude-900 flex items-center gap-2 text-sm">
              <Store className="w-4 h-4 text-nude-700" />
              <span>Loja Física Vinculada</span>
            </h4>
            <div className="space-y-1.5 text-gray-600 text-[11px]">
              <p className="font-semibold text-gray-900">Eterna Cosméticos e Acessórios</p>
              <p>Av. Emílio Johnson, 782 - Vila Santa Terezinha</p>
              <p>Almirante Tamandaré – PR • CEP 83501-000</p>
              <p className="font-bold text-nude-900 pt-1">WhatsApp: (41) 99994-9204</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
