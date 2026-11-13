# Documentação da API — Eterna Cosméticos

Base URL: `http://localhost:3001/api` (desenvolvimento)

Todos os endpoints retornam JSON. Erros seguem o formato:
```json
{
  "error": "Mensagem de erro",
  "details": []
}
```

---

## Endpoints Públicos

> Não requerem autenticação.

---

### Produtos

#### `GET /api/products`
Lista produtos com filtros e paginação.

**Query Parameters:**

| Parâmetro     | Tipo    | Descrição                                              |
|---------------|---------|--------------------------------------------------------|
| `category_id` | UUID    | Filtrar por categoria                                  |
| `brand_id`    | UUID    | Filtrar por marca                                      |
| `min_price`   | number  | Preço mínimo                                           |
| `max_price`   | number  | Preço máximo                                           |
| `search`      | string  | Busca por nome ou descrição                            |
| `sort`        | string  | `price_asc`, `price_desc`, `name_asc`, `newest`        |
| `featured`    | boolean | Se `true`, retorna apenas produtos em destaque         |
| `page`        | number  | Página (padrão: 1)                                     |
| `limit`       | number  | Itens por página (padrão: 20, máx: 100)                |

**Resposta `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Shampoo Hidratante",
      "slug": "shampoo-hidratante",
      "description": "Shampoo para cabelos secos",
      "price": "29.90",
      "compare_at_price": "39.90",
      "stock_quantity": 15,
      "featured": false,
      "category": { "id": "uuid", "name": "Cabelos", "slug": "cabelos" },
      "brand": { "id": "uuid", "name": "L'Oréal", "slug": "loreal" },
      "primary_image": { "url": "/uploads/produto.jpg", "alt_text": "Shampoo" }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

---

#### `GET /api/products/:slug`
Retorna detalhes completos de um produto pelo slug.

**Resposta `200`:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Shampoo Hidratante",
    "slug": "shampoo-hidratante",
    "description": "Shampoo para cabelos secos",
    "long_description": "Descrição completa do produto...",
    "price": "29.90",
    "compare_at_price": "39.90",
    "stock_quantity": 15,
    "sku": "SH-001",
    "featured": false,
    "active": true,
    "category": { "id": "uuid", "name": "Cabelos", "slug": "cabelos" },
    "brand": { "id": "uuid", "name": "L'Oréal", "slug": "loreal" },
    "images": [
      { "id": "uuid", "url": "/uploads/foto1.jpg", "alt_text": "Frente", "is_primary": true, "sort_order": 1 }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Erros:**
- `404` — Produto não encontrado ou inativo

---

### Categorias

#### `GET /api/categories`
Lista todas as categorias ativas.

**Resposta `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Cabelos",
      "slug": "cabelos",
      "description": "Produtos para cabelos",
      "image_url": "/uploads/cat-cabelos.jpg",
      "parent_id": null,
      "sort_order": 1,
      "children": [
        { "id": "uuid", "name": "Shampoos", "slug": "shampoos" }
      ]
    }
  ]
}
```

---

### Marcas

#### `GET /api/brands`
Lista todas as marcas ativas.

**Resposta `200`:**
```json
{
  "data": [
    { "id": "uuid", "name": "L'Oréal", "slug": "loreal", "logo_url": "/uploads/loreal.png" }
  ]
}
```

---

### Banners

#### `GET /api/banners`
Lista banners ativos no momento da requisição.

**Query Parameters:**

| Parâmetro  | Tipo   | Descrição                                           |
|------------|--------|-----------------------------------------------------|
| `position` | string | Filtrar por posição (ex: `home_hero`, `home_promo`) |

**Resposta `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Promoção de Verão",
      "image_url": "/uploads/banner-verao.jpg",
      "link_url": "/produtos?featured=true",
      "position": "home_hero",
      "sort_order": 1
    }
  ]
}
```

---

### Configurações Públicas

#### `GET /api/settings/public`
Retorna configurações públicas da loja (nome, endereço, contato, etc).

**Resposta `200`:**
```json
{
  "data": {
    "store_name": "Eterna Cosméticos",
    "store_address": "Rua das Flores, 123 - Almirante Tamandaré, PR",
    "store_phone": "(41) 99999-9999",
    "store_hours": "Seg-Sex 9h-18h, Sáb 9h-13h",
    "store_instagram": "@eternacosmeticos",
    "store_about": "Nossa história...",
    "delivery_enabled": "true",
    "min_order_value": "30.00",
    "whatsapp_number": "5541999999999"
  }
}
```

---

### Pedidos

#### `POST /api/orders`
Cria um novo pedido e retorna a URL do WhatsApp.

**Body:**
```json
{
  "customer_name": "Maria Silva",
  "customer_phone": "41999999999",
  "customer_email": "maria@email.com",
  "items": [
    { "product_id": "uuid", "quantity": 2 },
    { "product_id": "uuid", "quantity": 1 }
  ],
  "fulfillment_type": "pickup",
  "delivery_address": null,
  "coupon_code": "PROMO10"
}
```

> Para `fulfillment_type: "delivery"`, o campo `delivery_address` é obrigatório:
> ```json
> "delivery_address": {
>   "street": "Rua das Flores",
>   "number": "123",
>   "complement": "Apto 2",
>   "neighborhood": "Centro",
>   "city": "Almirante Tamandaré",
>   "state": "PR",
>   "zip_code": "83501-000"
> }
> ```

**Resposta `201`:**
```json
{
  "order_number": "ET-20241113-0001",
  "whatsapp_url": "https://wa.me/5541999999999?text=...",
  "order": {
    "id": "uuid",
    "order_number": "ET-20241113-0001",
    "status": "pending_contact",
    "subtotal": "59.80",
    "discount_amount": "5.98",
    "total": "53.82",
    "items": [...],
    "created_at": "2024-11-13T14:00:00Z"
  }
}
```

**Erros:**
- `400` — Dados inválidos, estoque insuficiente ou cupom inválido
- `422` — Produto não encontrado ou inativo

---

### Cupons

#### `POST /api/coupons/validate`
Valida um cupom e retorna o valor de desconto.

**Body:**
```json
{
  "code": "PROMO10",
  "order_total": 100.00
}
```

**Resposta `200` (válido):**
```json
{
  "valid": true,
  "discount_amount": "10.00",
  "coupon": {
    "id": "uuid",
    "code": "PROMO10",
    "type": "percentage",
    "value": "10.00",
    "min_order_value": "50.00"
  }
}
```

**Resposta `200` (inválido):**
```json
{
  "valid": false,
  "reason": "Cupom expirado"
}
```

---

## Endpoints Administrativos

> **Requerem autenticação JWT.**
> Envie o header: `Authorization: Bearer <token>`

---

### Auth

#### `POST /api/auth/login`
Autentica um administrador.

**Body:**
```json
{
  "email": "admin@eternacosmeticos.com.br",
  "password": "minha-senha"
}
```

**Resposta `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@eternacosmeticos.com.br"
  }
}
```

**Rate limit:** 5 tentativas por 15 minutos por IP.

**Erros:**
- `401` — Credenciais inválidas
- `429` — Muitas tentativas

---

#### `POST /api/auth/logout`
Invalida a sessão atual (cliente deve descartar o token).

**Resposta `200`:**
```json
{ "message": "Logout realizado com sucesso" }
```

---

#### `GET /api/auth/me`
Retorna os dados do admin autenticado.

**Resposta `200`:**
```json
{
  "id": "uuid",
  "name": "Administrador",
  "email": "admin@eternacosmeticos.com.br",
  "last_login_at": "2024-11-13T14:00:00Z"
}
```

---

### Dashboard

#### `GET /api/admin/dashboard`
Retorna métricas do painel.

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                                        |
|-----------|--------|--------------------------------------------------|
| `period`  | string | `today`, `7d`, `30d`, `month`, `custom`         |
| `from`    | date   | Data inicial (obrigatório quando `period=custom`)|
| `to`      | date   | Data final (obrigatório quando `period=custom`)  |

**Resposta `200`:**
```json
{
  "period": { "from": "2024-11-01", "to": "2024-11-13" },
  "summary": {
    "total_orders": 45,
    "total_revenue": "2340.50",
    "avg_ticket": "52.01",
    "new_customers": 12
  },
  "orders_by_status": {
    "pending_contact": 3,
    "confirmed": 5,
    "preparing": 2,
    "ready": 1,
    "completed": 32,
    "cancelled": 2
  },
  "top_products": [
    { "product_name": "Shampoo Hidratante", "quantity_sold": 28, "revenue": "838.20" }
  ],
  "low_stock_alerts": [
    { "id": "uuid", "name": "Condicionador X", "stock_quantity": 2 }
  ],
  "recent_orders": [...]
}
```

---

### Pedidos (Admin)

#### `GET /api/admin/orders`
Lista pedidos com filtros.

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                                                       |
|-----------|--------|-----------------------------------------------------------------|
| `status`  | string | Filtrar por status                                              |
| `search`  | string | Busca por número do pedido, nome ou telefone do cliente         |
| `from`    | date   | Data inicial                                                    |
| `to`      | date   | Data final                                                      |
| `page`    | number | Página (padrão: 1)                                              |
| `limit`   | number | Itens por página (padrão: 20)                                   |

**Resposta `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ET-20241113-0001",
      "status": "pending_contact",
      "total": "53.82",
      "fulfillment_type": "pickup",
      "customer": { "name": "Maria Silva", "phone": "41999999999" },
      "items_count": 3,
      "created_at": "2024-11-13T14:00:00Z"
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 20, "total_pages": 3 }
}
```

---

#### `GET /api/admin/orders/:id`
Retorna detalhes completos de um pedido.

**Resposta `200`:**
```json
{
  "data": {
    "id": "uuid",
    "order_number": "ET-20241113-0001",
    "status": "pending_contact",
    "fulfillment_type": "pickup",
    "delivery_address": null,
    "subtotal": "59.80",
    "discount_amount": "5.98",
    "total": "53.82",
    "whatsapp_url": "https://wa.me/...",
    "notes": null,
    "customer": {
      "id": "uuid",
      "name": "Maria Silva",
      "phone": "41999999999",
      "email": "maria@email.com",
      "order_count": 3
    },
    "items": [
      {
        "id": "uuid",
        "product_name": "Shampoo Hidratante",
        "unit_price": "29.90",
        "quantity": 2,
        "subtotal": "59.80",
        "product": { "id": "uuid", "slug": "shampoo-hidratante" }
      }
    ],
    "coupon": { "code": "PROMO10", "type": "percentage", "value": "10.00" },
    "status_history": [
      { "status": "pending_contact", "notes": null, "created_at": "2024-11-13T14:00:00Z" }
    ],
    "created_at": "2024-11-13T14:00:00Z"
  }
}
```

---

#### `PUT /api/admin/orders/:id/status`
Atualiza o status de um pedido.

**Body:**
```json
{
  "status": "confirmed",
  "notes": "Pagamento confirmado via PIX"
}
```

**Status válidos:** `pending_contact` → `confirmed` → `preparing` → `ready` → `completed` | `cancelled`

**Resposta `200`:**
```json
{
  "message": "Status atualizado com sucesso",
  "order": { "id": "uuid", "status": "confirmed" }
}
```

> Ao cancelar (`status: "cancelled"`), o estoque dos itens é restaurado automaticamente.

---

### Produtos (Admin)

#### `GET /api/admin/products`
Lista todos os produtos (incluindo inativos).

**Query Parameters:** `search`, `category_id`, `brand_id`, `status` (`active`|`inactive`|`all`), `page`, `limit`

---

#### `POST /api/admin/products`
Cria um novo produto.

**Body (multipart/form-data ou JSON):**
```json
{
  "name": "Shampoo Hidratante",
  "description": "Para cabelos secos",
  "long_description": "Descrição completa...",
  "price": 29.90,
  "compare_at_price": 39.90,
  "stock_quantity": 50,
  "low_stock_threshold": 5,
  "category_id": "uuid",
  "brand_id": "uuid",
  "active": true,
  "featured": false,
  "sku": "SH-001",
  "weight_kg": 0.350
}
```

**Resposta `201`:** Produto criado.

---

#### `PUT /api/admin/products/:id`
Atualiza um produto existente. Body igual ao POST (campos parciais aceitos).

---

#### `DELETE /api/admin/products/:id`
**Arquiva** o produto (define `active = false`). Não exclui do banco para preservar histórico de pedidos.

---

### Estoque

#### `GET /api/admin/inventory`
Lista todos os produtos com informações de estoque.

**Resposta `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Shampoo Hidratante",
      "sku": "SH-001",
      "stock_quantity": 15,
      "low_stock_threshold": 5,
      "is_low_stock": false,
      "category": "Cabelos"
    }
  ]
}
```

---

#### `GET /api/admin/inventory/low-stock`
Retorna apenas produtos com estoque abaixo ou igual ao `low_stock_threshold`.

---

#### `POST /api/admin/inventory/movement`
Registra uma movimentação manual de estoque.

**Body:**
```json
{
  "product_id": "uuid",
  "type": "in",
  "quantity": 20,
  "reason": "Reposição de estoque - Nota Fiscal 1234"
}
```

`type`: `in` (entrada), `out` (saída), `adjustment` (ajuste para valor absoluto)

---

#### `GET /api/admin/inventory/movements`
Histórico de movimentações.

**Query Parameters:** `product_id`, `type`, `from`, `to`, `page`

---

### Clientes

#### `GET /api/admin/customers`
Lista clientes.

**Query Parameters:** `search` (nome, telefone ou e-mail), `page`, `limit`

---

#### `GET /api/admin/customers/:id`
Detalhes de um cliente.

---

#### `GET /api/admin/customers/:id/orders`
Histórico de pedidos de um cliente.

---

### Categorias (Admin)

#### `GET /api/admin/categories` — Lista todas (incluindo inativas)
#### `POST /api/admin/categories` — Cria categoria
#### `PUT /api/admin/categories/:id` — Atualiza categoria
#### `DELETE /api/admin/categories/:id` — Remove (apenas se sem produtos)

**Body (POST/PUT):**
```json
{
  "name": "Cabelos",
  "description": "Produtos para cabelos",
  "parent_id": null,
  "sort_order": 1,
  "active": true
}
```

---

### Marcas (Admin)

#### `GET /api/admin/brands` — Lista todas
#### `POST /api/admin/brands` — Cria marca
#### `PUT /api/admin/brands/:id` — Atualiza marca

**Body:**
```json
{
  "name": "L'Oréal",
  "active": true
}
```

---

### Cupons (Admin)

#### `GET /api/admin/coupons` — Lista todos
#### `POST /api/admin/coupons` — Cria cupom
#### `PUT /api/admin/coupons/:id` — Atualiza cupom
#### `DELETE /api/admin/coupons/:id` — Desativa cupom

**Body (POST/PUT):**
```json
{
  "code": "PROMO10",
  "type": "percentage",
  "value": 10,
  "min_order_value": 50,
  "max_uses": 100,
  "expires_at": "2024-12-31T23:59:59Z",
  "active": true
}
```

---

### Banners (Admin)

#### `GET /api/admin/banners` — Lista todos
#### `POST /api/admin/banners` — Cria banner
#### `PUT /api/admin/banners/:id` — Atualiza banner
#### `DELETE /api/admin/banners/:id` — Remove banner

**Body:**
```json
{
  "title": "Promoção de Verão",
  "image_url": "/uploads/banner.jpg",
  "link_url": "/produtos?featured=true",
  "position": "home_hero",
  "sort_order": 1,
  "active": true,
  "starts_at": null,
  "ends_at": null
}
```

---

### Configurações (Admin)

#### `GET /api/admin/settings`
Retorna todas as configurações da loja (incluindo as privadas).

#### `PUT /api/admin/settings`
Atualiza configurações.

**Body:**
```json
{
  "store_name": "Eterna Cosméticos",
  "store_address": "Rua das Flores, 123 - Almirante Tamandaré, PR",
  "store_phone": "(41) 99999-9999",
  "store_hours": "Seg-Sex 9h-18h",
  "store_instagram": "@eternacosmeticos",
  "store_about": "Nossa história...",
  "whatsapp_number": "5541999999999",
  "delivery_enabled": "true",
  "min_order_value": "30.00"
}
```

---

### Relatórios

#### `GET /api/admin/reports/sales`
Relatório de vendas por período.

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                              |
|-----------|--------|----------------------------------------|
| `from`    | date   | Data inicial (YYYY-MM-DD)              |
| `to`      | date   | Data final (YYYY-MM-DD)                |
| `format`  | string | `json` (padrão) ou `csv`              |

**Resposta `200` (JSON):**
```json
{
  "period": { "from": "2024-11-01", "to": "2024-11-13" },
  "summary": {
    "total_orders": 45,
    "completed_orders": 38,
    "cancelled_orders": 2,
    "total_revenue": "2340.50",
    "avg_ticket": "61.59",
    "total_discount": "234.05"
  },
  "daily": [
    { "date": "2024-11-01", "orders": 4, "revenue": "213.60" }
  ]
}
```

---

#### `GET /api/admin/reports/top-products`
Produtos mais vendidos.

**Query Parameters:** `from`, `to`, `limit` (padrão: 10)

---

#### `GET /api/admin/reports/inventory`
Relatório de estoque atual.

**Query Parameters:** `format` (`json` | `csv`)

---

## Upload de Imagens

#### `POST /api/admin/uploads`
Faz upload de uma imagem.

**Body:** `multipart/form-data` com campo `file`

**Restrições:**
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: 5 MB

**Resposta `201`:**
```json
{
  "url": "/uploads/1699876543210-produto.jpg"
}
```
