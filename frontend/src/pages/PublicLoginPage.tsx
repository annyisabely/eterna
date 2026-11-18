import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  User,
  Heart,
  Store,
} from 'lucide-react';
import adminApi from '../admin/api/adminClient';
import { useAdminAuthStore } from '../admin/store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const PublicLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: adminLogin, isAuthenticated: isAdminAuth } = useAdminAuthStore();

  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');

  // Client form
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');

  // Admin form
  const [adminEmail, setAdminEmail] = useState('eterna@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim()) {
      toast.error('Por favor informe seu número de WhatsApp.');
      return;
    }
    const cleanPhone = clientPhone.replace(/\D/g, '');
    toast.success(`Olá${clientName ? `, ${clientName}` : ''}! Você está conectada.`);
    navigate('/catalogo');
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error('Informe o e-mail e a senha administrativa.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminApi.post('/auth/login', {
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
      });

      const token = res.data.token || res.data.data?.token;
      const admin = res.data.admin || res.data.data?.admin;
      if (!token || !admin) {
        throw new Error('Falha na resposta de autenticação');
      }

      adminLogin(token, admin);
      toast.success(`Bem-vinda, ${admin.name}!`);
      navigate('/admin');
    } catch (err: any) {
      console.error('Falha no login:', err);
      const msg = err.response?.data?.message || 'E-mail ou senha administrativa inválidos.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-block group">
            <img
              src="/logo-eterna.jpg"
              alt="Eterna Cosméticos e Acessórios"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md ring-4 ring-pink-500/20 group-hover:scale-105 transition-transform mx-auto mb-2"
            />
          </Link>
          <span className="font-serif text-3xl font-bold tracking-wider text-nude-900">
            ETERNA
          </span>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-pink-700 font-semibold">
            Cosméticos e Acessórios
          </p>
          <p className="text-xs text-gray-500 pt-1">
            Identifique-se para uma experiência personalizada e acompanhamento de compras.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'client'
                ? 'bg-white text-nude-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4 text-pink-600" />
            <span>Sou Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-white text-nude-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-pink-600" />
            <span>Administradora</span>
          </button>
        </div>

        {/* Client Login Tab */}
        {activeTab === 'client' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                Acesse sua Conta
              </h2>
              <p className="text-xs text-gray-500">
                Acompanhe seus pedidos e consulte seus produtos favoritos.
              </p>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seu Nome
                </label>
                <Input
                  type="text"
                  placeholder="Como gostaria de ser chamada?"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp / Celular <span className="text-pink-600">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="(41) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Usado para localizar seus pedidos e enviar atualizações.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2 mt-2"
              >
                <span>Acessar Loja & Meus Pedidos</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center">
              <Link
                to="/catalogo"
                className="text-xs text-pink-700 hover:text-pink-800 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Continuar explorando cosméticos sem login</span>
              </Link>
            </div>
          </div>
        )}

        {/* Admin Login Tab */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Acesso Administrativo</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-gray-900">
                Painel da Loja
              </h2>
              <p className="text-xs text-gray-500">
                Acesso restrito para gestão de pedidos, catálogo e estoque.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  E-mail Administrativo
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="eterna@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2 mt-2"
                disabled={loading}
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Entrando no Painel...' : 'Entrar como Administradora'}</span>
              </Button>
            </form>

            <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 text-[11px] text-gray-600">
              <p className="font-semibold text-pink-900">Credenciais Oficiais:</p>
              <p>E-mail: <strong className="text-gray-900">eterna@gmail.com</strong></p>
              <p>Senha: <strong className="text-gray-900">eterna123</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
