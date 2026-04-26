# 📁 Projetos

Pasta onde cada e-commerce que a gente cria tem sua "ficha técnica" centralizada.

## Como funciona

Cada projeto = uma subpasta aqui dentro com:
- `README.md` — visão geral do projeto (o que é, status, URLs, credenciais)
- `COMO-FUNCIONA.md` — explicação didática das peças e como conectam
- `JORNADA.md` — o que a gente fez, cronológico
- `DECISOES-ESPECIFICAS.md` — diferenças do template padrão (cores, integrações, etc)

**O código fica em `src/`** (raiz do repo), não aqui. Esta pasta é só "documentação central" pra você entender o projeto sem precisar abrir 50 arquivos.

## Projetos atuais

- [`miami-store/`](miami-store/) — primeiro projeto, e-commerce de roupas/calçados de marca (Lacoste, Nike, etc)

## Quando criar projeto novo

Tech Lead cria nova subpasta seguindo o template do Miami Store:

```
projetos/
└── nova-marca/
    ├── README.md
    ├── COMO-FUNCIONA.md
    ├── JORNADA.md
    └── DECISOES-ESPECIFICAS.md
```

E aponta da `memoria/` pra cá quando relevante.
