# Fry Sushi (Goiânia)

Next.js + Firebase projeto **`gestorfinan-88c9c`**.

## Variáveis na Vercel (obrigatório)

Em **Project → Settings → Environment Variables**, configure (Production + Preview):

| Nome | Obrigatória | Exemplo / nota |
|------|-------------|----------------|
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Sim | `APP_USR-...` (chave pública) |
| `MERCADOPAGO_ACCESS_TOKEN` | Sim | `APP_USR-...` (Access Token — **nunca** publique no front) |
| `MERCADOPAGO_CLIENT_ID` | Recomendada | ID da aplicação MP |
| `MERCADOPAGO_CLIENT_SECRET` | Recomendada | Secret da aplicação MP |
| `NEXT_PUBLIC_APP_URL` | Sim | URL do site, ex. `https://seu-projeto.vercel.app` (sem `/` no final) |
| `FIREBASE_PROJECT_ID` | Sim | `gestorfinan-88c9c` |
| `FIREBASE_STORAGE_BUCKET` | Sim | `gestorfinan-88c9c.firebasestorage.app` |
| `NEXT_PUBLIC_ADMIN_INVITE` | Sim | `frysushi-admin` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Opcional | e-mail do 1º colaborador |
| `FIREBASE_SERVICE_ACCOUNT` | Recomendada | JSON da service account **em uma linha** (webhooks/estorno) |
| `FIREBASE_TOKEN` | Opcional | só para publicar regras via CLI |

Depois de salvar, faça **Redeploy**. Sem `MERCADOPAGO_ACCESS_TOKEN` o checkout mostra erro ao finalizar.

## Segurança Firebase

1. Authentication → ative **E-mail/senha**
2. Firestore → Rules → publique `firestore.rules`

Contas ficam no **Firebase Authentication**. O Firestore só guarda perfil (`users/{uid}`) **sem senha**. Contas antigas com `passwordHash` no banco não logam — cadastre de novo (ou use o login após migração no Auth).

## Scripts

```bash
npm install
npm run dev
npm run firebase:rules
```
