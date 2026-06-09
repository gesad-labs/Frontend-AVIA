<!-- GSD:project-start source:PROJECT.md -->
## Project

**AVIA Frontend**

AVIA é uma ferramenta web de gerenciamento ágil de projetos — frontend React SPA que consome a API REST Django/PostgreSQL. Permite equipes criar projetos, planejar sprints, mover cards em quadros Kanban/Scrum, colaborar com comentários e estimativas, e monitorar progresso por histórico de atividades. Destinado a equipes acadêmicas (UECE/APS) como produto de disciplina.

**Core Value:** Times conseguem visualizar e mover cards em um quadro Kanban vinculado à sprint ativa — qualquer bloqueio aqui quebra o produto.

### Constraints

- **Tech Stack**: React 19 + Vite 8 + JavaScript — já definido pela equipe
- **API**: Consome endpoints do backend Django em `localhost:8000/api/v1/`; frontend não altera API
- **Auth**: JWT tokens (access + refresh); backend gerencia autenticação
- **Timeline**: Prazo acadêmico semestral (UECE 2026)
- **Equipe**: 6 membros, trabalho colaborativo
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
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
