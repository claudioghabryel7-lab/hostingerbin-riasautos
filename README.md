# Fry Sushi (Goiânia)

Next.js + Firebase projeto **`gestorfinan-88c9c`**.

## Segurança (importante)

As regras do Firestore **não são públicas**. Login usa **Firebase Authentication** (e-mail/senha). Senhas **não** ficam no banco — só o perfil em `users/{uid}`. Colaboradores ficam em `collaborators/{uid}`.

### O que fazer agora no Console

1. **Authentication** → Sign-in method → ative **E-mail/senha**
2. **Firestore → Rules** → cole o arquivo `firestore.rules` deste repo → **Publish**
   - Ou: `npm run firebase:rules` (precisa de `FIREBASE_TOKEN`)

Sem publicar as regras novas, o aviso do Firebase (“qualquer pessoa pode roubar…”) continua válido.

### Contas antigas (hash no Firestore)

Contas criadas no modo antigo (senha no documento) **não** entram mais. Cliente e colaborador precisam **cadastrar de novo** com Firebase Auth.

- 1º colaborador: `/admin/login` → “Criar conta” (sem convite)
- Próximos: código `frysushi-admin` (`NEXT_PUBLIC_ADMIN_INVITE`)
- Cliente: `/entrar` → ganha 10% OFF na conta

## Config Firebase (já no código)

```js
projectId: "gestorfinan-88c9c"
```

## Scripts

```bash
npm install
npm run dev
npm run firebase:rules   # publica regras no gestorfinan-88c9c
```

## Mercado Pago

Copie `.env.example` → `.env.local` e preencha as chaves. Em produção, defina `NEXT_PUBLIC_APP_URL` com a URL pública.
