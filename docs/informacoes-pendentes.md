# Informações Pendentes — Eterna Cosméticos

Lista de todas as informações que a proprietária precisará fornecer antes do lançamento da loja.

---

## ⚠️ Obrigatórias para funcionamento

Sem estas informações, o sistema **não pode ser lançado**:

- [ ] **Número do WhatsApp oficial da loja**
  - Formato: `5541XXXXXXXXX` (código do país + DDD + número)
  - Exemplo: `554199999999` para (41) 9 9999-9999
  - Este número receberá todos os pedidos

- [ ] **E-mail para o painel administrativo**
  - Será usado para fazer login no painel
  - Exemplo: `contato@eternacosmeticos.com.br`

- [ ] **Senha inicial do painel**
  - Mínimo 8 caracteres, misturando letras e números
  - Pode ser alterada depois do primeiro acesso

---

## 🏪 Configurações da loja

Preencher no painel administrativo após o primeiro login em **Configurações**:

- [ ] Endereço completo da loja
  - Rua, número, bairro, cidade, estado, CEP
- [ ] Telefone de contato (para exibição no site)
- [ ] Horário de funcionamento
  - Exemplo: "Segunda a Sexta: 9h às 18h | Sábado: 9h às 13h"
- [ ] Texto "Sobre a Eterna" (história e missão da loja)
  - Aparece na página "Sobre nós" do site
- [ ] Link do Instagram oficial
  - Exemplo: `https://instagram.com/eternacosmeticos`
- [ ] A loja faz **entrega a domicílio**? (Sim/Não)
- [ ] Se sim: valor mínimo de pedido para entrega (ex: R$ 50,00)
- [ ] Se sim: área de entrega coberta (bairros ou km a partir da loja)

---

## 📦 Catálogo de Produtos

- [ ] **Categorias** de produtos que a loja comercializa
  - Exemplos: Cabelos, Skincare, Maquiagem, Perfumaria, Unhas, Corpo
  - Pode ter subcategorias (ex: Cabelos → Shampoos, Condicionadores, Máscaras)

- [ ] **Marcas** comercializadas pela loja
  - Exemplos: L'Oréal, Pantene, Revlon, O Boticário, etc.

- [ ] **Produtos** — para cada produto:
  - Nome completo
  - Descrição curta (1-2 linhas, para listagem)
  - Descrição completa (para página do produto)
  - Preço de venda (R$)
  - Preço "de" / original (para exibir como riscado — opcional)
  - Quantidade em estoque
  - Categoria
  - Marca
  - Fotos (veja seção Visual)
  - Código SKU (opcional, para controle interno)
  - Peso (opcional, para cálculo de frete futuro)

---

## 🎨 Visual e Identidade

- [ ] **Logo oficial** da Eterna Cosméticos
  - Formato: PNG ou SVG
  - Fundo transparente
  - Preferencialmente em alta resolução (mínimo 500×500 pixels)

- [ ] **Fotos dos produtos**
  - Fundo branco ou neutro recomendado
  - Mínimo 1 foto por produto (3-5 ideal)
  - Formato JPG ou PNG, mínimo 800×800 pixels

- [ ] **Banners da página inicial**
  - Opção A: Enviar imagens prontas com texto (1920×600 pixels recomendado)
  - Opção B: Informar quais produtos/promoções destacar e criar os banners

- [ ] **Cores da marca** (se houver paleta definida)
  - Cor principal, secundária, etc.
  - Ou referência visual (site, Instagram, cartão de visita)

---

## 💳 Pagamentos

> Nesta fase, o pagamento é combinado diretamente pelo WhatsApp (sem gateway online).

- [ ] Quais **formas de pagamento** a loja aceita?
  - Dinheiro
  - PIX (informar chave PIX)
  - Cartão de débito (na loja)
  - Cartão de crédito (na loja)
  - Transferência bancária
- [ ] No futuro: deseja integrar **gateway de pagamento online**? (Mercado Pago, PagSeguro, etc.)

---

## 🌐 Domínio e Hospedagem

- [ ] **Domínio desejado** para a loja
  - Exemplo: `eternacosmeticos.com.br`
  - Verificar disponibilidade em [registro.br](https://registro.br) (`.com.br`) ou outro registrar
- [ ] **Responsável pelo domínio** (a proprietária registra, ou o desenvolvedor auxilia?)
- [ ] **Provedor de hospedagem** escolhido
  - Recomendado: Railway (backend) + Vercel/Netlify (frontend)
  - Alternativa: VPS com maior controle

---

## 📋 Informações Legais (Recomendadas)

Para conformidade com o CDC e LGPD:

- [ ] **CNPJ** ou CPF do responsável (para Política de Privacidade)
- [ ] **Política de trocas e devoluções** da loja
  - Prazo para troca, condições, como solicitar
- [ ] **E-mail de contato oficial** para constar na Política de Privacidade

---

## ✅ Como Preencher

1. Após o deploy, acesse o painel em `https://seu-dominio.com.br/admin`
2. Faça login com as credenciais do admin criado
3. Vá em **Configurações** para preencher as informações da loja
4. Vá em **Categorias** → criar categorias
5. Vá em **Marcas** → criar marcas
6. Vá em **Produtos** → cadastrar produtos com fotos
7. Vá em **Banners** → configurar banners da home

---

> 💡 **Dica:** Comece pelos itens marcados como obrigatórios, depois configure a loja, e por último faça o upload dos produtos. Assim você pode testar o sistema antes de terminar o cadastro completo.
