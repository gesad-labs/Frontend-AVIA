<!-- GSD:project-start source:PROJECT.md -->
## Project

**AVIA Frontend**

AVIA é uma ferramenta web de gerenciamento ágil de projetos — frontend React SPA que consome a API REST Spring Boot (Java 17) com PostgreSQL. Permite equipes criar projetos, planejar sprints, mover cards em quadros Kanban/Scrum, colaborar com comentários e estimativas, e monitorar progresso por histórico de atividades. Destinado a equipes acadêmicas (UECE/APS) como produto de disciplina.

**Core Value:** Times conseguem visualizar e mover cards em um quadro Kanban vinculado à sprint ativa — qualquer bloqueio aqui quebra o produto.

### Constraints

- **Tech Stack**: React 19 + Vite 8 + JavaScript — já definido pela equipe
- **API**: Consome o backend Spring Boot em `VITE_API_URL` (padrão `http://localhost:8080`, sem prefixo `/api/v1`); frontend não altera API
- **Auth**: JWT HS256 com validade de 24h, enviado em `Authorization: Bearer`; **não há refresh token** — ao expirar (401) o usuário é deslogado; backend gerencia autenticação
- **Timeline**: Prazo acadêmico semestral (UECE 2026)
- **Equipe**: 6 membros, trabalho colaborativo
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- React 19 + Vite 8 + **JavaScript** (por enquanto; a documentação de arquitetura prevê TypeScript)
- React Router 7 (`createBrowserRouter`), axios, CSS Modules, Context API + hooks
- ESLint 10 (`npm run lint`); `npm run dev` sobe em `http://localhost:5173`
- Config por ambiente: `VITE_API_URL` no arquivo `.env` (versionado, padrão local). Override na sua máquina: `.env.local` (ignorado pelo git). Deploy: definir a variável no build. Reinicie o dev server após mudar um `.env`.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- **Vocabulário:** na interface é "card"; em services, constantes e API é "tarefa"/`task`.
- **HTTP:** toda chamada passa por `src/services/api.js` (instância axios) via `*Service.js` por domínio. Nunca usar `fetch` direto nem escrever URL nos componentes.
- **Erros:** o `api` rejeita sempre `{ status, body }` (`status: 0` = backend inacessível). O backend responde erros como `{ "erro": "..." }`, **não** `message`.
- **Sessão:** um 401 fora de `/auth/*` limpa o token, desloga e mostra o aviso "sessão expirou" (handler registrado pelo `AuthProvider`).
- **Feedback ao usuário:** `useToast()` (`success`/`info`/`warning`/`error`). `toast.error(err)` extrai a mensagem sozinho via `getErrorMessage(err, fallback)` do `api.js` — use sempre essa função, nunca `err.body.message` direto. O campo de erro do backend é `erro` (não `error`). Erros de formulário continuam inline na tela; toast é para o resto (ações concluídas, falhas de requisição, avisos).
- **Enums:** `src/constants/index.js` espelha os enums Java (mesmos valores). Campos com `@JsonValue` chegam como texto de exibição (`papel: "gerente"`, `cargo: "Scrum Master"`, `tipoEstimativa: "Horas"`, permissões `"Criar Tarefas"`) — passe por `normalizeEnum()` antes de comparar. O papel `VISUALIZADOR` aparece na UI como "Convidado".
- **Rotas:** o backend gera links de e-mail em português (`/redefinir-senha?token=`); as rotas do front precisam bater com eles.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

```
src/
  pages/        telas por área (auth, dashboard, board, backlog, project, settings, landing, email)
  components/   layout/ (AppLayout com Sidebar/Topbar, AuthLayout), ToastContainer
  routes/       router + PrivateRoute
  services/     api.js (axios) + projectService, taskService, sprintService, memberService
  constants/    enums e labels alinhados ao backend
  contexts/     AuthContext
  context/      ProjectContext, ToastContext/ToastProvider  (pasta duplicada com contexts/ — unificar)
  hooks/        useAuth, useToast, usePermission, useDebounce, ...
```

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->