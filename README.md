# Frysuroll

Site de delivery de sushi com duas faces:

- **Loja (cliente):** vitrine com fotos grandes, categorias, sacola fixa, checkout Mercado Pago e acompanhamento em tempo real.
- **Painel (dono):** abrir/fechar loja, gerenciar cardápio (fotos editáveis), pedidos com alerta sonoro, aceitar / sair para entrega / finalizar, e **recusar com estorno automático** no Mercado Pago.

## Stack

- Next.js 16 + React 19 + Tailwind 4
- Firebase Auth, Firestore e Storage (configuração do projeto preservada)
- Mercado Pago Checkout Pro (preferência + webhook + refund)

## Configuração

1. Copie `.env.example` para `.env.local` e preencha as chaves do Mercado Pago.
2. No Firebase Console:
   - Ative **Authentication** (e-mail/senha)
   - Publique `firestore.rules` e `storage.rules`
   - Crie índices se o console pedir (pedidos por `createdAt` / `status`)
3. Rode:

```bash
npm install
npm run dev
```

4. Acesse a loja em `/` e o painel em `/admin/login` (crie o primeiro usuário admin).

## Autonomia do admin

- Trocar **hero**, **logo** e **fotos dos pratos** pelo painel (upload no Storage)
- Alterar preços e disponibilidade (item some da loja na hora)
- Abrir/fechar a loja com mensagem customizada
- Recusar pedido pago → API estorna no Mercado Pago e o status atualiza para o cliente

## Webhook Mercado Pago

Configure a URL de notificação:

`https://SEU_DOMINIO/api/webhooks/mercadopago`

Opcional: `FIREBASE_SERVICE_ACCOUNT` (JSON) para o servidor gravar confirmações sem depender do cliente.
