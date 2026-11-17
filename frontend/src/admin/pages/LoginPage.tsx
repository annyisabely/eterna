import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import adminApi from '../api/adminClient';
import { useAdminAuthStore } from '../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor informe o e-mail e a senha.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminApi.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = res.data.token || res.data.data?.token;
      const admin = res.data.admin || res.data.data?.admin;
      if (!token || !admin) {
        throw new Error('Resposta de autenticação inválida');
      }
      login(token, admin);
      toast.success(`Bem-vinda, ${admin.name}!`);
      navigate('/admin');
    } catch (err: any) {
      console.error('Falha no login:', err);
      const msg = err.response?.data?.message || 'E-mail ou senha inválidos.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <img
            src="/logo-eterna.jpg"
            alt="Eterna Cosméticos e Acessórios"
            className="w-16 h-16 rounded-full object-cover shadow-md ring-2 ring-pink-500/30 mb-1"
          />
          <span className="font-serif text-3xl font-bold tracking-wider text-nude-900">
            ETERNA
          </span>
          <p className="text-[11px] uppercase tracking-[0.22em] text-pink-700 font-semibold">
            Cosméticos e Acessórios • Painel Administrativo
          </p>
          <p className="text-xs text-gray-500 pt-1">
            Painel de controle comercial restrito à administração da loja.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail Administrativo"
            type="email"
            placeholder="admin@eterna.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 text-xs"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button variant="primary" fullWidth size="lg" type="submit" loading={loading} className="mt-2">
            <Lock className="w-4 h-4 mr-1.5" />
            <span>Entrar no Painel</span>
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <a
            href="/"
            className="text-xs text-nude-700 hover:text-nude-900 font-medium transition-colors"
          >
            ← Voltar para a Loja Virtual
          </a>
        </div>
      </div>
    </div>
  );
};

