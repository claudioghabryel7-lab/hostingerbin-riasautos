# Fry Sushi (Goiânia)

Site Next.js de delivery de sushi frito. **Tudo fica no Firestore** (contas, cardápio, pedidos, imagens em base64). Sem Firebase Authentication.

## Importante: regras do banco

No Firebase Console → Firestore → Rules, publique o arquivo `firestore.rules` deste repositório. Sem isso aparece **Missing or insufficient permissions**.

## Contas

- Cliente: `/entrar` (cadastro/login gravado na coleção `users`)
- Colaborador: `/admin/login` (role `collaborator` no Firestore)
- Primeiro colaborador não precisa de código; os próximos usam `NEXT_PUBLIC_ADMIN_INVITE` (padrão `frysushi-admin`)

## Imagens

Uploads no painel são comprimidos e salvos na coleção `images` + campo `imageUrl` do item (data URL no banco).

## Mercado Pago

Configure `.env.local` a partir de `.env.example`.

```bash
npm install
npm run dev
```
