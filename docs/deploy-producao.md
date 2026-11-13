# Deploy em Produção — Eterna Cosméticos

Guia completo para publicar o sistema em um ambiente de produção.

---

## Opções de Hospedagem

### Opção 1: Railway (Recomendado para iniciantes)

**Vantagens:** Interface simples, PostgreSQL incluído, deploy automático via Git, SSL gratuito.

**Custo estimado:** ~$5-10/mês para uso moderado.

[railway.app](https://railway.app)

---

### Opção 2: Render

**Vantagens:** Plano gratuito disponível (com limitações), PostgreSQL gerenciado, SSL automático.

**Atenção:** No plano gratuito, a instância "hiberna" após inatividade (30s de cold start).

[render.com](https://render.com)

---

### Opção 3: VPS (DigitalOcean, Vultr, Contabo)

**Vantagens:** Controle total, melhor custo-benefício em uso alto.

**Requer:** Configuração manual de PostgreSQL, Node.js, nginx e SSL (Let's Encrypt).

**Custo estimado:** $5-20/mês dependendo do provedor e do plano.

---

## Configuração do PostgreSQL em Produção

### No Railway ou Render

1. Adicione um serviço de PostgreSQL na plataforma
2. A plataforma fornece automaticamente a `DATABASE_URL`
3. Copie-a para as variáveis de ambiente do backend

### Em VPS

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Criar usuário e banco
sudo -u postgres psql
CREATE USER eterna_user WITH PASSWORD 'senha-forte-aqui';
CREATE DATABASE eterna_cosmeticos OWNER eterna_user;
GRANT ALL PRIVILEGES ON DATABASE eterna_cosmeticos TO eterna_user;
\q
```

**DATABASE_URL resultante:**
```
postgresql://eterna_user:senha-forte-aqui@localhost:5432/eterna_cosmeticos
```

---

## Variáveis de Ambiente de Produção

Configure as seguintes variáveis no painel da sua plataforma de hospedagem:

```env
NODE_ENV=production
PORT=3001

# Banco de dados (fornecida pela plataforma ou configurada manualmente)
DATABASE_URL=postgresql://user:password@host:5432/eterna_cosmeticos

# JWT — OBRIGATÓRIO: gere uma chave secreta forte
# Use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=sua-chave-secreta-de-64-bytes-ou-mais-aqui
JWT_EXPIRES_IN=7d

# WhatsApp — número da loja com código do país e DDD
WHATSAPP_NUMBER=5541999999999

# Upload de arquivos
UPLOAD_DIR=./uploads

# CORS — domínio do frontend em produção (sem barra no final)
CORS_ORIGIN=https://www.eternacosmeticos.com.br
```

> ⚠️ **Nunca** use o mesmo `JWT_SECRET` do ambiente de desenvolvimento em produção.

---

## Build e Deploy do Backend

### Railway / Render

1. Conecte seu repositório Git à plataforma
2. Configure o **Root Directory** como `backend`
3. Configure o **Build Command**: `npm install && npm run build`
4. Configure o **Start Command**: `npm start`
5. Adicione as variáveis de ambiente
6. Faça deploy

### VPS (manualmente)

```bash
# Na VPS, como usuário não-root:
cd /var/www
git clone <seu-repositorio> eterna.app
cd eterna.app/backend

# Instalar dependências e compilar
npm ci --production=false
npm run build

# Instalar PM2 para gerenciar o processo
npm install -g pm2

# Iniciar o backend
pm2 start dist/app.js --name "eterna-backend"
pm2 save
pm2 startup
```

---

## Build e Deploy do Frontend

### Build local

```bash
cd frontend

# Configure a URL da API de produção
echo "VITE_API_URL=https://api.eternacosmeticos.com.br" > .env.production

# Gera os arquivos estáticos em frontend/dist/
npm run build
```

### Opções de publicação

#### Vercel (recomendado para frontend React)
```bash
npm install -g vercel
cd frontend
vercel --prod
```
Configure a variável de ambiente `VITE_API_URL` no painel da Vercel.

#### Netlify
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

#### Nginx (VPS)
```nginx
server {
    listen 80;
    server_name eternacosmeticos.com.br www.eternacosmeticos.com.br;

    root /var/www/eterna.app/frontend/dist;
    index index.html;

    # SPA: todas as rotas servem o index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para o backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Arquivos de upload
    location /uploads {
        alias /var/www/eterna.app/backend/uploads;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## HTTPS Obrigatório

Em produção, **HTTPS é obrigatório** para:
- Segurança dos dados dos clientes
- Funcionamento correto do WhatsApp (wa.me exige HTTPS)
- SEO e confiança do usuário

### Certbot (Let's Encrypt) no nginx

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d eternacosmeticos.com.br -d www.eternacosmeticos.com.br
# O Certbot renova automaticamente a cada 90 dias
```

### Plataformas gerenciadas

Railway, Render, Vercel e Netlify fornecem SSL automático — não é necessário configurar manualmente.

---

## Configurar CORS_ORIGIN

Em produção, **nunca** use `*` como CORS origin. Configure o domínio exato do frontend:

```env
CORS_ORIGIN=https://www.eternacosmeticos.com.br
```

Se frontend e backend estiverem no mesmo domínio (via proxy nginx), o CORS pode ser dispensado.

---

## Migration em Produção

Após o primeiro deploy ou após atualizações de schema:

```bash
# Em Railway/Render: via console do serviço
npm run migrate

# Via psql direto
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

---

## Criar Admin em Produção

```bash
npm run create-admin
```

> Execute apenas uma vez. Guarde as credenciais em local seguro.

---

## Backup do Banco de Dados

### Backup manual

```bash
# Substitua DATABASE_URL pela string de conexão real
pg_dump $DATABASE_URL -f "backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Backup automático (cron no VPS)

```bash
# Editar crontab
crontab -e

# Backup diário às 2h da manhã
0 2 * * * pg_dump postgresql://user:pass@localhost/eterna_cosmeticos >> /backups/eterna_$(date +\%Y\%m\%d).sql 2>&1
```

### Backups no Railway/Render

Ambas as plataformas oferecem snapshots automáticos do banco nos planos pagos. Recomenda-se ativar e manter pelo menos 7 dias de retenção.

---

## Monitoramento Básico

### Uptime monitoring (gratuito)

- **UptimeRobot** ([uptimerobot.com](https://uptimerobot.com)): monitora a URL a cada 5 minutos e envia alerta por e-mail se cair.
- Configure para monitorar: `https://api.eternacosmeticos.com.br/api/settings/public`

### Logs

**Railway/Render:** logs disponíveis diretamente no painel.

**VPS com PM2:**
```bash
pm2 logs eterna-backend        # logs em tempo real
pm2 logs eterna-backend --lines 100  # últimas 100 linhas
```

---

## Domínio Personalizado

1. **Registre o domínio** em um registrar brasileiro (ex: Registro.br para `.com.br`)
2. **Configure os DNS** apontando para sua hospedagem:
   - **Railway/Render**: adicione o domínio no painel, copie o CNAME fornecido
   - **VPS**: aponte o A record para o IP da VPS
3. **Configure o `CORS_ORIGIN`** para o domínio definitivo
4. **Configure o frontend** com a URL correta da API (`VITE_API_URL`)

**Exemplo de configuração DNS:**
```
Tipo    Nome    Valor
A       @       123.456.789.0    (IP da VPS)
A       www     123.456.789.0
CNAME   api     seu-app.railway.app  (se backend em Railway)
```

---

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas (especialmente `JWT_SECRET`, `DATABASE_URL`, `WHATSAPP_NUMBER`)
- [ ] Migration executada no banco de produção
- [ ] Admin criado (`npm run create-admin`)
- [ ] HTTPS configurado e funcionando
- [ ] `CORS_ORIGIN` apontando para o domínio do frontend
- [ ] Upload de imagens funcionando (permissões de pasta)
- [ ] Monitoramento de uptime configurado
- [ ] Backup automático configurado
- [ ] Testar pedido de ponta a ponta no ambiente de produção
- [ ] Testar acesso ao painel admin
- [ ] Logo e informações da loja cadastradas no painel
