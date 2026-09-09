# FitSync

Aplicação de saúde e fitness: acompanhamento de metas, treinos, nutrição, rede social e conexão com profissionais.

## Pré-requisitos

- **Node.js 18+** — baixe em https://nodejs.org
- Verifique com `node -v` e `npm -v`

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env na raiz do projeto
#    (O arquivo .env NÃO vem junto no download — ele está no .gitignore)
#    Crie um arquivo chamado .env com o seguinte conteúdo:
#
#    VITE_SUPABASE_URL=https://ryqzwvmzysohgqxbwtoj.supabase.co
#    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cXp3dm16eXNvaGdxeGJ3dG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjU2NDksImV4cCI6MjA5NjUwMTY0OX0.ZrnLvjpA1yB19SstiKhd9J8aNxnBfZr-zlIl70Z0yoY
#
#    Sem este arquivo, NADA funciona — login, APIs, banco de dados, tudo falha.
```

## Rodando o projeto

```bash
# Desenvolvimento (com hot reload — recarrega ao salvar arquivos)
npm run dev
# Abre em http://localhost:5173

# Build de produção (gera pasta dist/ com versão otimizada)
npm run build

# Rodar build de produção localmente
npm run preview
# Abre em http://localhost:4173

# Verificação de tipos TypeScript
npm run typecheck
```

## Estrutura do projeto

```
src/
  components/      # Componentes reutilizáveis (UI, layout, logos)
  context/         # Contextos React (Auth, Theme, I18n, Notifications)
  lib/             # Configuração Supabase, tipos, utilitários, traduções
  pages/           # Páginas da aplicação (Login, Register, Dashboard, etc.)
supabase/
  functions/       # Edge Functions (Deno) — já deployadas no Supabase
  migrations/      # Migrações do banco de dados — já aplicadas
```

## Backend

O backend usa **Supabase** (PostgreSQL + Auth + Storage + Edge Functions).
- O projeto Supabase já está provisionado e configurado
- Todas as migrações já foram aplicadas
- As Edge Functions já estão deployadas e ativas
- Apenas o arquivo `.env` com as credenciais é necessário localmente

## Resolução de problemas

### "Não consigo logar" / "APIs não funcionam"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se ele contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Reinicie o servidor após criar o `.env` (Ctrl+C e rode `npm run dev` novamente)

### "Não está com a versão mais recente"
- Delete a pasta `dist/` e rode `npm run build` novamente
- Se estiver usando `npm run dev`, as alterações recarregam automaticamente ao salvar
- Se baixou uma versão antiga do código, substitua todos os arquivos da pasta `src/` pela versão mais recente

### Erro de dependências
- Delete a pasta `node_modules/` e o arquivo `package-lock.json`
- Rode `npm install` novamente
