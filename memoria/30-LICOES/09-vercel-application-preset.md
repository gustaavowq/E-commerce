# #09 Vercel reseta "Application Preset" ao mudar Root Directory

## Sintoma

Botão **Deploy** ficava cinza/desabilitado. Erro silencioso ou mensagem "Application Preset is required".

## Causa raiz

Ordem de configuração no Vercel:

1. User cola repo
2. Project Name OK
3. Application Preset auto-detectado: **Next.js**
4. User muda Root Directory de `./` pra `projetos/miami-store/frontend`
5. **Vercel reseta Application Preset pra `Other`** (bug visual)
6. Deploy bloqueado

## Fix

Configurar **na ordem certa**:

1. Definir Project Name
2. Mudar Root Directory pra `projetos/miami-store/frontend` (ou `projetos/miami-store/dashboard`)
3. **DEPOIS** clicar em Application Preset e selecionar Next.js manualmente
4. Adicionar env vars
5. Deploy

## Prevenção

- ✅ Documentar nesta ordem em [[../60-DEPLOY/vercel-passo-a-passo]]
- ✅ Avisar o user explicitamente: "depois de mudar Root Directory, conferir se Application Preset ainda diz Next.js — se voltou pra Other, clicar e selecionar de novo"
