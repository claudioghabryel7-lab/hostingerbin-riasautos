# Fry Sushi (Goiânia)

Next.js + Firebase projeto **`gestorfinan-88c9c`** (Auth e Firestore ativos no console).

Contas, cardápio, pedidos e imagens ficam no **Firestore**. Login do site usa a coleção `users` (sem depender do Authenticator do Firebase no fluxo do cliente).

## Config Firebase (já no código)

```js
projectId: "gestorfinan-88c9c"
```

## Publicar regras (obrigatório na 1ª vez)

### Opção A — Console (rápido)
1. [Firebase Console](https://console.firebase.google.com/project/gestorfinan-88c9c/firestore/rules)
2. Cole o conteúdo de `firestore.rules`
3. Publish

### Opção B — CLI (para o agente atualizar sozinho depois)
No seu PC:

```bash
npx firebase login:ci
```

Cole o token em `.env.local`:

```
FIREBASE_TOKEN=1//seu_token
```

Depois, neste repo:

```bash
npm run firebase:rules
```

Com o `FIREBASE_TOKEN` configurado no ambiente do agente, a cada alteração em `firestore.rules` o deploy pode ser feito com esse comando.

## Scripts

```bash
npm install
npm run dev
npm run firebase:rules   # publica regras no gestorfinan-88c9c
```

## Mercado Pago

Copie `.env.example` → `.env.local` e preencha as chaves.
