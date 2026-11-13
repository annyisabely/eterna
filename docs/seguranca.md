# Segurança — Eterna Cosméticos

Documentação das medidas de segurança implementadas no sistema.

---

## Autenticação e Senhas

### Hashing de senhas com bcrypt

Senhas de administradores nunca são armazenadas em texto puro. São processadas com **bcrypt** (cost factor 12):

```typescript
import bcrypt from 'bcryptjs';

// Ao criar/alterar senha:
const hash = await bcrypt.hash(password, 12);

// Ao verificar login:
const isValid = await bcrypt.compare(password, storedHash);
```

**Por que cost 12?**
O cost factor 12 significa que o hashing leva ~300ms por senha — suficientemente lento para dificultar ataques de força bruta, sem prejudicar a experiência do usuário legítimo.

---

### JSON Web Tokens (JWT)

A autenticação do painel usa JWT com as seguintes características:

- **Algoritmo**: HS256
- **Expiração**: configurável via `JWT_EXPIRES_IN` (padrão: 7 dias)
- **Secret**: string aleatória de no mínimo 64 bytes, única por ambiente
- **Transmissão**: exclusivamente via header `Authorization: Bearer <token>`

```typescript
// Verificação do token em toda requisição administrativa:
const decoded = jwt.verify(token, env.JWT_SECRET);
// Se inválido ou expirado → 401 Unauthorized
```

**Tokens não são armazenados no servidor** (stateless). Para revogar acesso imediato (em caso de comprometimento), altere o `JWT_SECRET` nas variáveis de ambiente.

---

## Rate Limiting

O endpoint de login possui proteção contra ataques de força bruta:

```typescript
// middleware/rateLimiter.ts
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                     // máximo 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

Após 5 tentativas falhas, o IP é bloqueado por 15 minutos. Isso inviabiliza ataques de dicionário automatizados.

---

## Validação de Dados

Toda entrada do usuário é validada no backend com **express-validator** antes de ser processada:

- Tipos de dados verificados (string, number, email, UUID, etc.)
- Comprimentos mínimo e máximo
- Formatos validados (telefone, e-mail)
- Sanitização de strings (remoção de HTML tags perigosas)

```typescript
// Exemplo: validação do endpoint POST /api/orders
body('customer_name').trim().notEmpty().isLength({ min: 2, max: 100 }),
body('customer_phone').trim().notEmpty().matches(/^\d{10,11}$/),
body('items').isArray({ min: 1 }),
body('items.*.product_id').isUUID(),
body('items.*.quantity').isInt({ min: 1, max: 100 }),
```

**Nunca confie no cliente** — toda validação crítica (estoque, preço, permissões) é feita no servidor.

---

## Proteção CORS

A API só aceita requisições de origens explicitamente autorizadas:

```typescript
// Produção: apenas o domínio do frontend
CORS_ORIGIN=https://www.eternacosmeticos.com.br

// Desenvolvimento: localhost
CORS_ORIGIN=http://localhost:5173
```

Requisições de outras origens recebem erro `403 Forbidden`.

---

## Headers de Segurança (Helmet.js)

O **Helmet.js** adiciona automaticamente headers HTTP de segurança:

| Header                        | Proteção                                              |
|-------------------------------|-------------------------------------------------------|
| `Content-Security-Policy`     | Previne XSS e injeção de scripts maliciosos           |
| `X-Frame-Options`             | Previne clickjacking (embedding em iframe)            |
| `X-Content-Type-Options`      | Previne MIME type sniffing                            |
| `Referrer-Policy`             | Controla informações de referência enviadas           |
| `Strict-Transport-Security`   | Força HTTPS (HSTS)                                    |
| `X-XSS-Protection`            | Proteção adicional contra XSS em navegadores antigos |
| `X-DNS-Prefetch-Control`      | Controla pré-busca de DNS                             |

```typescript
app.use(helmet());
```

---

## Sem Exposição de Stack em Produção

Em ambiente de produção, mensagens de erro internas **nunca** são expostas ao cliente:

```typescript
// middleware/errorHandler.ts
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'production') {
    // Mensagem genérica para o cliente
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Erro interno do servidor' : err.message
    });
  } else {
    // Detalhes completos apenas em desenvolvimento
    res.status(statusCode).json({
      error: err.message,
      stack: err.stack
    });
  }

  // Log completo sempre no servidor (para debug)
  console.error('[ERROR]', err);
};
```

---

## Validação de Estoque em Transação

A baixa de estoque ao criar um pedido usa **transação atômica com `SELECT FOR UPDATE`**:

```sql
BEGIN;
  SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE;
  -- Verifica disponibilidade
  UPDATE products SET stock_quantity = stock_quantity - $quantidade WHERE id = $1;
COMMIT;
```

**Por que isso é uma medida de segurança?**

Sem transação, dois clientes poderiam comprar simultaneamente o último item — resultando em estoque negativo e pedido com item que não existe. O `FOR UPDATE` trava o registro para leitura exclusiva durante a transação, impedindo essa condição de corrida.

---

## Upload de Arquivos

Uploads de imagens são protegidos:

- **Tipos permitidos**: apenas `image/jpeg`, `image/png`, `image/webp`
- **Tamanho máximo**: 5 MB por arquivo
- **Nomes sanitizados**: o nome original do arquivo não é preservado (renomeado para `timestamp-hash.ext`)
- **Acesso público**: apenas para leitura (`/uploads/*` serve arquivos estáticos)
- **Pasta de upload**: fora do código-fonte, não versionada

```typescript
const upload = multer({
  storage: diskStorage({
    destination: env.UPLOAD_DIR,
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

---

## LGPD — Lei Geral de Proteção de Dados

O sistema foi desenvolvido com os princípios da LGPD em mente:

### Dados Coletados (Mínimo Necessário)

| Dado              | Finalidade                         | Base Legal        |
|-------------------|------------------------------------|-------------------|
| Nome do cliente   | Identificação no pedido            | Execução de contrato |
| Telefone          | Contato via WhatsApp para pedido   | Execução de contrato |
| E-mail            | Contato adicional (opcional)       | Consentimento    |
| Endereço          | Entrega (apenas se solicitado)     | Execução de contrato |

### O que **não** é coletado

- CPF (não necessário para o modelo de negócio)
- Dados de cartão de crédito (pagamento fora do sistema)
- Localização em tempo real
- Dados de navegação além do necessário

### Medidas implementadas

- **Sem exposição desnecessária**: a API não retorna dados de outros clientes em nenhum endpoint público
- **Acesso controlado**: dados de clientes acessíveis apenas por admins autenticados
- **Dados de pedidos**: o número do pedido é enviado ao cliente; não há dados sensíveis expostos na URL do WhatsApp além do necessário para o pedido
- **Retenção**: não há política de exclusão automática implementada nesta versão — recomendado definir política de retenção conforme crescimento

### Recomendações futuras

- Adicionar **Política de Privacidade** visível no site
- Implementar endpoint para o cliente solicitar exclusão de dados (`direito ao esquecimento`)
- Implementar expiração automática de registros de clientes inativos

---

## SQL Injection

A API usa **parameterized queries** em todas as consultas ao banco:

```typescript
// CORRETO — parameterized query (imune a SQL injection)
const result = await pool.query(
  'SELECT * FROM products WHERE id = $1 AND active = true',
  [productId]
);

// ERRADO — nunca fazemos isso (vulnerável a SQL injection)
// pool.query(`SELECT * FROM products WHERE id = '${productId}'`);
```

---

## Resumo das Medidas

| Área                   | Medida                                  | Status |
|------------------------|-----------------------------------------|--------|
| Senhas                 | bcrypt cost 12                          | ✅     |
| Autenticação           | JWT com expiração                       | ✅     |
| Força bruta            | Rate limiting no login (5/15min)        | ✅     |
| Dados de entrada       | express-validator (validação + sanitize)| ✅     |
| Origens HTTP           | CORS restrito ao domínio do frontend    | ✅     |
| Headers HTTP           | Helmet.js                               | ✅     |
| Erros em produção      | Stack trace oculto                      | ✅     |
| Estoque                | Transação com SELECT FOR UPDATE         | ✅     |
| Upload de arquivos     | Tipo e tamanho validados                | ✅     |
| SQL Injection          | Parameterized queries                   | ✅     |
| LGPD                   | Dados mínimos, acesso controlado        | ✅     |
