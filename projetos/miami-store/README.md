# 🏪 Miami Store

> Primeiro e-commerce do projeto. Loja de roupas e calçados de marca premium (Lacoste, Nike, Adidas, Tommy, Polo Ralph Lauren).

## O que é

Loja online completa com:
- **Site público** (a loja em si — onde cliente compra)
- **Painel administrativo** (onde o dono da loja gerencia produtos, pedidos, cupons)
- **API** (cérebro que conecta os dois ao banco de dados)
- **Banco de dados** (onde tudo fica salvo: usuários, produtos, pedidos)

## Status atual

🟢 **No ar publicamente, hospedado na nuvem**.

| Componente | Plataforma | URL |
|---|---|---|
| Loja | Vercel | https://e-commerce-kohl-five-85.vercel.app |
| Painel admin | Vercel | https://miami-painel.vercel.app |
| API + Banco | Railway | https://e-commerce-production-cd06.up.railway.app |
| Código | GitHub | https://github.com/gustaavowq/E-commerce |

**Custo mensal:** R$ 0 (dentro do free tier de tudo).

## Credenciais admin

```
Email:  admin@miami.store
Senha:  aIKPI2GIp3Vx
```

## Documentos deste projeto

- 📖 [`COMO-FUNCIONA.md`](COMO-FUNCIONA.md) — **leia primeiro** se quer entender as peças e como conectam
- 🗺️ [`JORNADA.md`](JORNADA.md) — cronologia do que a gente fez (do zero ao deploy)
- 🎨 [`DECISOES-ESPECIFICAS.md`](DECISOES-ESPECIFICAS.md) — escolhas específicas do Miami Store (cores, integrações, brand voice)

## Próximos passos sugeridos

Pendentes que dependem de **você** (eu não posso fazer):

1. **Setar `CLOUDINARY_URL`** no Railway pra upload de imagens funcionar (você já criou conta — só falta colar a env)
2. **Conta MercadoPago real** — pra Pix funcionar de verdade (hoje tá com TEST-token placeholder)
3. **Conta Resend** — pra emails transacionais (confirmação de pedido, esqueci senha)
4. **Domínio próprio** (R$ 40/ano em registro.br) — `miamistore.com.br` em vez de `*.vercel.app`

Detalhes em [`COMO-FUNCIONA.md`](COMO-FUNCIONA.md) — seção "O que ainda falta".
