# 🌸 Eterna Cosméticos — E-commerce

E-commerce profissional para a **Eterna Cosméticos**, loja de produtos de beleza localizada em Almirante Tamandaré – PR.

## Visão Geral

Sistema completo com:
- **Loja virtual** (frontend React + Vite + TypeScript)
- **API REST** (backend Node.js + Express + TypeScript)
- **Painel administrativo** integrado
- **Integração WhatsApp** para confirmação de pedidos
- **Gestão de estoque**, cupons, banners e relatórios

---

## Stack Tecnológica

| Camada       | Tecnologia                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 18, Vite, TypeScript, Tailwind CSS        |
| Backend      | Node.js 18+, Express 5, TypeScript              |
| Banco        | PostgreSQL 14+                                  |
| Auth         | JWT (jsonwebtoken) + bcryptjs                   |
| Upload       | Multer (armazenamento local)                    |
| Segurança    | Helmet.js, CORS, express-rate-limit             |
| Validação    | express-validator                               |

---

## Pré-requisitos

- **Node.js** 18 ou superior → [nodejs.org](https://nodejs.org)
- **PostgreSQL** 14 ou superior → [postgresql.org](https://www.postgresql.org)
- **npm** 9+ (incluído no Node.js)
- **Git** (opcional, para clonar o repositório)

---

## Configuração do Ambiente de Desenvolvimento

### 1. Clone ou baixe o projeto

```bash
git clone <url-do-repositorio> eterna.app
cd eterna.app
```

### 2. Configure o Backend

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

Instale as dependências:

```bash
npm install
```

### 3. Configure o Frontend

```bash
cd ../frontend
cp .env.example .env
```

Instale as dependências:

```bash
npm install
```

---

## Banco de Dados e Migrations

### Criar o banco de dados

```bash
psql -U postgres -c "CREATE DATABASE eterna_cosmeticos;"
```

### Rodar a migration inicial

```bash
cd backend
npm run migrate
```

> **Nota**: O comando `migrate` executa o arquivo `migrations/001_initial_schema.sql` que cria todas as tabelas, índices e dados iniciais necessários.

---

## Criar o Admin Inicial

Após rodar a migration, crie o primeiro usuário administrador:

```bash
cd backend
npm run create-admin
```

O script solicitará nome, e-mail e senha. Guarde essas credenciais com segurança.

---

## Iniciando o Projeto

### Backend (porta 3001 por padrão)

```bash
cd backend
npm run dev
```

### Frontend (porta 5173 por padrão)

```bash
cd frontend
npm run dev
```

Acesse:
- **Loja**: http://localhost:5173
- **Painel Admin**: http://localhost:5173/admin
- **API**: http://localhost:3001/api

---

## Variáveis de Ambiente

As variáveis estão documentadas no arquivo `backend/.env.example`. As principais são:

| Variável          | Descrição                                      | Exemplo                                   |
|-------------------|------------------------------------------------|-------------------------------------------|
| `NODE_ENV`        | Ambiente (development / production)            | `development`                             |
| `PORT`            | Porta do servidor backend                      | `3001`                                    |
| `DATABASE_URL`    | URL de conexão com o PostgreSQL                | `postgresql://user:pass@localhost/eterna` |
| `JWT_SECRET`      | Chave secreta para assinar tokens JWT          | string longa e aleatória                  |
| `JWT_EXPIRES_IN`  | Tempo de expiração do token                    | `7d`                                      |
| `WHATSAPP_NUMBER` | Número do WhatsApp da loja (formato internacional) | `5541999999999`                       |
| `UPLOAD_DIR`      | Diretório para upload de imagens               | `./uploads`                               |
| `CORS_ORIGIN`     | Origem permitida para requisições CORS         | `http://localhost:5173`                   |

> ⚠️ **Nunca** versione o arquivo `.env`. Ele já está no `.gitignore`.

---

## Estrutura de Pastas

```
eterna.app/
├── backend/                  ← API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/           ← Configuração do banco e variáveis de ambiente
│   │   ├── middleware/       ← Auth, rate limit, validação, error handler
│   │   ├── routes/           ← Definição das rotas da API
│   │   ├── controllers/      ← Lógica de cada endpoint
│   │   ├── services/         ← Regras de negócio (pedidos, estoque, WhatsApp)
│   │   ├── models/           ← Interfaces TypeScript
│   │   └── app.ts            ← Entry point da aplicação
│   ├── migrations/           ← Scripts SQL de criação do banco
│   ├── seeds/                ← Scripts de dados iniciais (admin)
│   ├── uploads/              ← Imagens enviadas (não versionado)
│   ├── .env.example          ← Modelo de variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 ← Interface (React + Vite)
│   ├── src/
│   │   ├── components/       ← Componentes reutilizáveis
│   │   ├── pages/            ← Páginas da loja e do painel admin
│   │   ├── hooks/            ← Custom hooks
│   │   ├── services/         ← Chamadas à API
│   │   ├── store/            ← Estado global (Zustand)
│   │   ├── types/            ← Interfaces TypeScript
│   │   └── utils/            ← Funções utilitárias
│   └── package.json
│
├── docs/                     ← Documentação técnica
│   ├── banco-de-dados.md
│   ├── api-endpoints.md
│   ├── fluxo-pedido.md
│   ├── deploy-producao.md
│   ├── whatsapp-business-api.md
│   ├── seguranca.md
│   └── informacoes-pendentes.md
│
├── scripts/                  ← Scripts auxiliares
│   ├── setup.sh
│   ├── setup.bat
│   └── backup-db.bat
│
└── README.md                 ← Este arquivo
```

---

## Endpoints Principais da API

Consulte a documentação completa em [`docs/api-endpoints.md`](docs/api-endpoints.md).

### Resumo dos Endpoints Públicos

| Método | Rota                    | Descrição                        |
|--------|-------------------------|----------------------------------|
| GET    | `/api/products`         | Listar produtos com filtros      |
| GET    | `/api/products/:slug`   | Detalhe de um produto            |
| GET    | `/api/categories`       | Listar categorias                |
| GET    | `/api/brands`           | Listar marcas                    |
| GET    | `/api/banners`          | Listar banners ativos            |
| GET    | `/api/settings/public`  | Configurações públicas da loja   |
| POST   | `/api/orders`           | Criar pedido e gerar link WhatsApp |
| POST   | `/api/coupons/validate` | Validar cupom de desconto        |

### Resumo dos Endpoints Administrativos

| Método | Rota                             | Descrição                      |
|--------|----------------------------------|--------------------------------|
| POST   | `/api/auth/login`                | Login do administrador         |
| GET    | `/api/admin/dashboard`           | Dados do painel                |
| GET    | `/api/admin/orders`              | Listar pedidos                 |
| PUT    | `/api/admin/orders/:id/status`   | Atualizar status do pedido     |
| GET    | `/api/admin/products`            | Listar produtos (admin)        |
| POST   | `/api/admin/products`            | Criar produto                  |
| GET    | `/api/admin/inventory/low-stock` | Produtos com estoque baixo     |
| GET    | `/api/admin/reports/sales`       | Relatório de vendas            |

---

## Fluxo do Pedido

```
Cliente monta carrinho
        ↓
  Vai para checkout
        ↓
  Preenche seus dados
        ↓
  Backend valida estoque (transaction SQL)
        ↓
  Pedido criado (status: pending_contact)
        ↓
  Link WhatsApp gerado automaticamente
        ↓
  Cliente abre WhatsApp com mensagem pré-preenchida
        ↓
  Admin recebe, confirma no painel
        ↓
  Status: confirmed → preparing → ready → completed
```

Consulte o fluxo detalhado em [`docs/fluxo-pedido.md`](docs/fluxo-pedido.md).

---

## Como Publicar em Produção

Consulte o guia completo em [`docs/deploy-producao.md`](docs/deploy-producao.md).

**Resumo rápido:**
1. Provisione um PostgreSQL (Railway, Render, Supabase ou VPS)
2. Faça deploy do backend em Railway ou Render
3. Configure as variáveis de ambiente de produção
4. Faça build do frontend: `npm run build`
5. Publique o frontend em Vercel, Netlify ou nginx
6. Configure HTTPS e o `CORS_ORIGIN` correto

---

## Informações Necessárias para o Lançamento

Veja a lista completa em [`docs/informacoes-pendentes.md`](docs/informacoes-pendentes.md).

---

## Contato e Suporte

**Eterna Cosméticos**  
Almirante Tamandaré – PR  

> Para suporte técnico, entre em contato com o desenvolvedor responsável pelo projeto.
