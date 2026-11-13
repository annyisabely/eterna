# WhatsApp Business Cloud API — Integração Futura Opcional

> **TL;DR:** A integração atual via link `wa.me` **já funciona e é segura** para o volume de uma loja local. A API oficial do WhatsApp é uma melhoria opcional para escala maior, com custos e complexidade adicionais.

---

## Integração Atual (wa.me)

O sistema usa o método mais simples e confiável para integração com WhatsApp:

1. Cliente finaliza o pedido
2. Backend gera uma URL `https://wa.me/5541999999999?text=...` com a mensagem do pedido pré-preenchida
3. Cliente clica no botão e é redirecionado para o WhatsApp Web ou app
4. Cliente **envia manualmente** a mensagem para a loja
5. A proprietária recebe e responde pelo WhatsApp normalmente

**Vantagens:**
- Zero custo
- Zero configuração técnica adicional
- Funciona em qualquer celular/computador com WhatsApp instalado
- Não requer aprovação de nenhuma plataforma
- Confiável e estável

**Limitação:**
- O cliente precisa de um clique extra para enviar a mensagem
- Não há confirmação automática de que a mensagem foi enviada
- Sem histórico de conversas integrado ao painel

---

## O que é a WhatsApp Business Cloud API?

A **WhatsApp Business Cloud API** (anteriormente Twilio / 360Dialog, agora diretamente pela Meta) é a API oficial do WhatsApp que permite:

- **Enviar mensagens proativamente** para clientes (sem eles precisarem iniciar a conversa)
- **Receber e processar mensagens** de forma programática
- **Templates de mensagem** aprovados pela Meta (confirmação de pedido, atualizações de entrega, etc.)
- **Chatbots** e fluxos automatizados de atendimento
- **Integração com CRM** e sistemas de gestão

---

## Pré-requisitos

Para usar a WhatsApp Business Cloud API, seria necessário:

1. **Conta Meta Business** verificada em [business.facebook.com](https://business.facebook.com)
2. **Número de telefone dedicado** (não pode ser um número já usado no WhatsApp pessoal ou Business app)
3. **App registrado** no Meta for Developers
4. **Aprovação de templates** de mensagem pela Meta (processo que pode levar dias)
5. **Conformidade com a Política de Comércio do WhatsApp**

---

## O que Precisaria Ser Implementado

Se no futuro a Eterna Cosméticos decidir usar a API oficial, seriam necessárias as seguintes mudanças no sistema:

### Backend

```typescript
// Novo serviço: src/services/whatsappApiService.ts
// - Enviar mensagem template ao criar pedido
// - Webhook para receber confirmações de entrega
// - Atualizar status do pedido com base em respostas
```

**Endpoints a criar:**
- `POST /api/webhooks/whatsapp` — receber eventos da Meta (mensagens recebidas, status de entrega)
- Configuração de verificação do webhook (token de verificação)

**Variáveis de ambiente adicionais:**
```env
META_WHATSAPP_PHONE_NUMBER_ID=123456789
META_ACCESS_TOKEN=seu-token-de-acesso
META_WEBHOOK_VERIFY_TOKEN=token-aleatorio-para-verificacao
```

### Templates Necessários (exemplos)

```
Template: pedido_confirmado
"Olá, {{1}}! Seu pedido {{2}} foi recebido pela Eterna Cosméticos. 
Total: R$ {{3}}. Aguarde nossa confirmação! 🌸"
```

---

## Diferenças em Relação à Integração Atual

| Aspecto                    | Integração Atual (wa.me)      | API Oficial                           |
|----------------------------|-------------------------------|---------------------------------------|
| **Custo**                  | Gratuito                      | Pago por mensagem enviada             |
| **Configuração**           | Nenhuma                       | Complexa (Meta for Developers)        |
| **Envio proativo**         | ❌ Não                        | ✅ Sim (com templates aprovados)      |
| **Recebimento de msg**     | ❌ Não (via sistema)          | ✅ Sim (webhook)                      |
| **Aprovação Meta**         | ❌ Não necessária             | ✅ Necessária para templates          |
| **Número dedicado**        | ❌ Não necessário             | ✅ Obrigatório                        |
| **Automatização**          | Parcial (mensagem pré-pronta) | Completa                              |
| **Adequado para**          | PME, volume baixo-médio       | Alto volume, múltiplos atendentes     |

---

## Custos e Aprovação da Meta

### Modelo de cobrança (referência 2024)

A Meta cobra por **conversa iniciada**, não por mensagem individual:

| Tipo de conversa          | Iniciador  | Custo aproximado (Brasil) |
|---------------------------|------------|---------------------------|
| **Marketing**             | Empresa    | ~$0,04–0,08 por conversa  |
| **Utilidade**             | Empresa    | ~$0,02–0,04 por conversa  |
| **Autenticação**          | Empresa    | ~$0,02–0,03 por conversa  |
| **Serviço**               | Usuário    | Gratuito (24h após msg)   |

> Os preços variam e são atualizados pela Meta periodicamente. Consulte [developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing) para valores atuais.

**Janela de conversa:** Após um cliente enviar qualquer mensagem, a empresa tem 24 horas para responder gratuitamente (janela de serviço).

### Processo de aprovação

1. Criar conta no Meta Business (verificação de empresa)
2. Criar App no Meta for Developers
3. Adicionar produto "WhatsApp Business"
4. Registrar número de telefone (verificação via SMS/ligação)
5. Submeter templates para aprovação (1–3 dias úteis)
6. Aceitar Termos de Serviço do WhatsApp Business

---

## Quando Considerar a Migração

A API oficial passa a fazer sentido quando:

- O volume de pedidos dificulta o atendimento manual via WhatsApp
- A loja quer enviar atualizações proativas de status (sem o cliente precisar perguntar)
- Há interesse em um chatbot de atendimento automatizado
- A operação cresce para múltiplos atendentes que precisam de histórico centralizado

---

## Conclusão

> ✅ **A integração atual via `wa.me` é a escolha certa para o momento.**
>
> É funcional, confiável, sem custo adicional e suficiente para o volume de uma loja local em crescimento. A API oficial é uma evolução natural quando o negócio escalar e justificar o investimento em configuração e custo por mensagem.

Quando chegar o momento, o sistema foi desenvolvido de forma que a migração é feita apenas no serviço `whatsappService.ts`, sem impacto no restante da aplicação.
