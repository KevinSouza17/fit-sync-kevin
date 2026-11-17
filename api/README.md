# API FitSync

Esta pasta documenta todas as APIs (Edge Functions) do FitSync.
As funções continuam em `supabase/functions/` (exigido pelo deploy da Supabase), mas aqui você encontra a documentação completa, exemplos de uso, uma coleção do Postman e os testes.

## Sumário

| # | Função (rota) | Método | Autenticação | Descrição curta |
|---|----------------|--------|--------------|-----------------|
| 1 | `notify-message` | POST | Bearer JWT | Notifica o destinatário de uma conversa sobre uma nova mensagem |
| 2 | `send-invite` | POST | Bearer JWT | Envia um convite (com código) para um e-mail de outro usuário |
| 3 | `stripe-checkout` | POST | Bearer JWT | Cria uma sessão de checkout do Stripe para assinatura PRO |
| 4 | `stripe-webhook` | POST | Assinatura Stripe | Recebe eventos do Stripe e atualiza assinaturas no banco |

## URL base

Todas as rotas seguem o padrão:

```
https://ryqzwvmzysohgqxbwtoj.supabase.co/functions/v1/<slug>
```

Onde `<slug>` é o nome da função (ex.: `send-invite`).

## Autenticação

- `notify-message`, `send-invite`, `stripe-checkout`: exigem um header
  `Authorization: Bearer <JWT>` (token de sessão do Supabase Auth).
- `stripe-webhook`: não usa JWT. É chamada pelo Stripe, que envia uma
  assinatura no header `stripe-signature` para validar a origem.

## Códigos de status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Requisição inválida (campo obrigatório faltando, etc.) |
| 401 | Não autenticado / sessão inválida |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

## Arquivos desta pasta

- `endpoints/` — uma documentação detalhada por rota
- `postman/` — coleção do Postman pronta para importar
- `examples/` — exemplos de requisição (curl) e resposta

## Como testar no Swagger

1. Uma especificação OpenAPI está disponível em `public/fitsync-openapi.json`
   (acessível em `/fitsync-openapi.json` no app publicado).
2. Para testar visualmente no navegador, o app tem uma página integrada em
   `/api-tester` (visível no menu lateral para administradores). Ela carrega o
   token JWT da sessão automaticamente e permite enviar requisições reais para
   cada endpoint, exibindo status e corpo da resposta.
3. Alternativamente, importe `fitsync-openapi.json` em qualquer leitor Swagger
   (ex.: editor.swagger.io, Postman também aceita OpenAPI) usando a URL do
   arquivo ou o conteúdo colado.

## Como testar no Postman

1. Importe o arquivo `api/postman/fitsync-api.postman_collection.json` no Postman.
2. Crie uma variável de ambiente `base_url` com o valor
   `https://ryqzwvmzysohgqxbwtoj.supabase.co/functions/v1`.
3. Para rotas autenticadas, faça login no app e copie o `access_token`
   do Supabase, então defina a variável `auth_token` com esse valor.
4. Execute as requisições na ordem sugerida dentro da coleção.

## Como rodar os testes

Os testes ficam em `tests/` (raiz do projeto). Veja `tests/README.md`.
