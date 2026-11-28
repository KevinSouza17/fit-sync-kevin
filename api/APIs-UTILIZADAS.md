# APIs utilizadas no FitSync

Este documento lista **todas as APIs** consumidas pelo projeto FitSync, organizadas em três grupos:

1. **Edge Functions** — funções HTTP do projeto (backend serverless da Supabase).
2. **Tabelas REST (PostgREST)** — operações CRUD expostas pela Data API da Supabase.
3. **RPC (funções PostgreSQL)** — funções de banco expostas em `/rpc/<nome>`.

A URL base dos endpoints REST/RPC é:

```
https://ryqzwvmzysohgqxbwtoj.supabase.co/rest/v1
```

A URL base das Edge Functions é:

```
https://ryqzwvmzysohgqxbwtoj.supabase.co/functions/v1
```

---

## 1. Edge Functions

| # | Rota | Método | Autenticação | Descrição |
|---|------|--------|--------------|-----------|
| 1 | `notify-message` | POST | Bearer JWT | Notifica o destinatário de uma conversa sobre uma nova mensagem |
| 2 | `send-invite` | POST | Bearer JWT | Envia um convite (código de 6 dígitos) para o e-mail de outro usuário |
| 3 | `stripe-checkout` | POST | Bearer JWT | Cria uma sessão de checkout do Stripe para assinatura PRO |
| 4 | `stripe-webhook` | POST | Assinatura Stripe | Recebe eventos do Stripe e atualiza assinaturas no banco |

---

## 2. Tabelas REST (PostgREST)

Cada tabela expõe os verbos **GET** (listar), **POST** (inserir), **PATCH** (atualizar) e **DELETE** (excluir) sob `/rest/v1/<tabela>`, respeitando as políticas de RLS.

| # | Tabela | Grupo | Descrição |
|---|--------|-------|-----------|
| 1 | `profiles` | Usuários | Perfis de usuário (dados pessoais, papel, profissão, macros) |
| 2 | `meals` | Diário | Refeições registradas com macros e fibras |
| 3 | `diary_tasks` | Diário | Tarefas do diário diário do usuário |
| 4 | `exercises` | Treino | Exercícios registrados manualmente |
| 5 | `water_logs` | Diário | Registro de consumo de água |
| 6 | `weight_logs` | Diário | Registro de peso corporal ao longo do tempo |
| 7 | `goals` | Metas | Metas pessoais do usuário |
| 8 | `foods` | Alimentos | Base de alimentos com macros, marca e código de barras |
| 9 | `conversations` | Mensagens | Conversas entre usuários |
| 10 | `messages` | Mensagens | Mensagens individuais de cada conversa |
| 11 | `notifications` | Notificações | Notificações in-app do usuário |
| 12 | `workout_programs` | Treino | Programas de treino criados pelo usuário/profissional |
| 13 | `workout_days` | Treino | Dias de treino dentro de um programa |
| 14 | `workout_exercises` | Treino | Exercícios de cada dia de treino |
| 15 | `workout_logs` | Treino | Histórico de treinos executados |
| 16 | `custom_foods` | Alimentos | Alimentos criados pelo usuário |
| 17 | `appointments` | Agenda | Agendamentos entre cliente e profissional |
| 18 | `client_plans` | Profissional | Planos atribuídos por profissional a clientes |
| 19 | `professional_plans` | Profissional | Planos publicados pelo profissional |
| 20 | `feed_posts` | Social | Publicações no feed |
| 21 | `feed_likes` | Social | Curtidas em publicações |
| 22 | `feed_comments` | Social | Comentários em publicações |
| 23 | `site_reviews` | Social | Avaliações do site/app |
| 24 | `stories` | Social | Stories (conteúdo efêmero) |
| 25 | `follows` | Social | Relações de seguimento entre usuários |
| 26 | `post_reports` | Moderação | Denúncias de publicações |
| 27 | `comment_reports` | Moderação | Denúncias de comentários |
| 28 | `professional_verification` | Profissional | Verificação de profissionais |
| 29 | `achievements` | Conquistas | Catálogo de conquistas |
| 30 | `user_achievements` | Conquistas | Conquistas obtidas pelos usuários |
| 31 | `community_recipes` | Receitas | Receitas da comunidade |
| 32 | `recipe_ratings` | Receitas | Avaliações de receitas |
| 33 | `onboarding_answers` | Onboarding | Respostas do onboarding inicial |
| 34 | `hashtags` | Social | Hashtags e contagem de uso |
| 35 | `post_hashtags` | Social | Relação publicação × hashtag |
| 36 | `diet_streaks` | Diário | Sequência de dias de dieta |
| 37 | `syncs` | Social | Publicações do tipo "sync" |
| 38 | `sync_likes` | Social | Curtidas em syncs |
| 39 | `sync_comments` | Social | Comentários em syncs |
| 40 | `client_spreadsheets` | Profissional | Planilhas de cliente criadas pelo profissional |
| 41 | `stripe_customers` | Pagamentos | Clientes Stripe vinculados a usuários |
| 42 | `stripe_subscriptions` | Pagamentos | Assinaturas Stripe |
| 43 | `stripe_orders` | Pagamentos | Pedidos/pagamentos Stripe |
| 44 | `subscriptions` | Pagamentos | Assinaturas internas do FitSync |
| 45 | `notification_emails` | Notificações | E-mails de notificação enviados |

---

## 3. RPC (funções PostgreSQL)

Chamadas em `POST /rest/v1/rpc/<nome>` com corpo JSON contendo os argumentos.

| # | Função RPC | Descrição |
|---|------------|-----------|
| 1 | `accept_terms` | Registra a aceitação dos termos pelo usuário |
| 2 | `approve_professional` | Aprova um profissional (admin) |
| 3 | `ban_user` | Bane um usuário (admin) |
| 4 | `check_and_grant_achievements` | Verifica e concede conquistas automaticamente |
| 5 | `check_onboarding_due` | Verifica se o onboarding está vencido |
| 6 | `create_profile` | Cria o perfil do usuário |
| 7 | `delete_account` | Exclui a conta do usuário |
| 8 | `delete_post_as_owner` | Exclui a própria publicação |
| 9 | `find_user_id_by_email` | Localiza o ID de usuário pelo e-mail |
| 10 | `follow_user` | Segue/deixa de seguir um usuário |
| 11 | `get_email_by_user_id` | Retorna o e-mail associado a um ID de usuário |
| 12 | `get_recommended_posts` | Recomenda publicações personalizadas |
| 13 | `get_trending_posts` | Retorna publicações em alta |
| 14 | `get_user_interests` | Retorna interesses do usuário |
| 15 | `increment_sync_view` | Incrementa o contador de visualizações de um sync |
| 16 | `is_pro_locked` | Verifica se a conta PRO está bloqueada |
| 17 | `lock_expired_subscriptions` | Bloqueia assinaturas expiradas |
| 18 | `search_profiles` | Busca perfis por termo |
| 19 | `touch_last_active` | Atualiza o timestamp de última atividade |
| 20 | `upsert_diet_streak` | Cria/atualiza a sequência de dieta |

---

## 4. Autenticação

| Tipo | Header | Uso |
|------|--------|-----|
| API Key (anon) | `apikey: <SUPABASE_ANON_KEY>` | Todas as requisições ao PostgREST e Edge Functions |
| Bearer JWT | `Authorization: Bearer <access_token>` | Operações autenticadas (obtido após login no Supabase Auth) |
| Stripe Signature | `stripe-signature: t=...,v1=...` | Validado apenas pela Edge Function `stripe-webhook` |

---

## 5. Referências e fontes utilizadas

As informações desta tabela foram extraídas das seguintes fontes dentro do projeto e de documentações oficiais das tecnologias empregadas:

### Fontes internas do projeto

- **`public/fitsync-openapi.json`** — especificação OpenAPI 3.0.3 gerada para o projeto, contendo todos os caminhos de tabelas REST, RPC e Edge Functions com parâmetros, esquemas e códigos de resposta. É a fonte primária para as tabelas acima.
- **`api/README.md`** — documentação das Edge Functions com rota, método, autenticação e descrição curta.
- **`api/postman/fitsync-api.postman_collection.json`** — coleção Postman com exemplos de requisição/resposta das 4 Edge Functions e variáveis de ambiente (`base_url`, `auth_token`, `anon_key`).
- **`api/endpoints/*.md`** — documentação detalhada por endpoint (`notify-message`, `send-invite`, `stripe-checkout`, `stripe-webhook`).
- **`api/examples/*.sh`** — exemplos de chamadas `curl` para cada Edge Function.
- **`supabase/functions/*/index.ts`** — código-fonte das Edge Functions implantadas.
- **`supabase/migrations/*.sql`** — migrations que criam tabelas, RLS, funções RPC e triggers referenciados no OpenAPI.
- **`src/lib/supabase.ts`** — configuração do cliente Supabase no front-end.
- **`src/pages/ApiTester.tsx`** — página integrada de testes que carrega o JWT da sessão e envia requisições reais aos endpoints.
- **`package.json`** — lista de dependências do projeto.

### Tecnologias e documentações oficiais

- **Supabase** — plataforma de backend (PostgreSQL hospedado, Auth, Storage, Edge Functions, Realtime). Base do armazenamento e autenticação do FitSync. Documentação: https://supabase.com/docs
- **PostgREST** — expõe o banco PostgreSQL como API REST (tabelas e RPC). Documentação: https://postgrest.org/en/stable/
- **Stripe** — processamento de pagamentos e assinaturas (R$ 25/mês, 7 dias de teste). Documentação: https://docs.stripe.com/
- **React** — biblioteca de UI (v18). Documentação: https://react.dev/
- **React Router DOM** — roteamento no front-end (v7). Documentação: https://reactrouter.com/
- **Vite** — bundler e servidor de desenvolvimento. Documentação: https://vitejs.dev/
- **TypeScript** — tipagem estática. Documentação: https://www.typescriptlang.org/docs/
- **Tailwind CSS** — estilização utilitária (v3). Documentação: https://tailwindcss.com/docs
- **Lucide React** — biblioteca de ícones. Documentação: https://lucide.dev/
- **Vitest** — executor de testes. Documentação: https://vitest.dev/
- **ESLint** — análise estática de código. Documentação: https://eslint.org/docs/latest/
- **OpenAPI 3.0.3** — padrão de especificação de API usado no `fitsync-openapi.json`. Especificação: https://swagger.io/specification/
- **Postman** — ferramenta de testes de API; a coleção do projeto pode ser importada diretamente. https://www.postman.com/
