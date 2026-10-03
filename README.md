# AVIA — Frontend

SPA em React 19 + Vite que consome a API Spring Boot do AVIA.

## Como rodar

1. `npm install`
2. Suba o backend (Spring Boot) em `http://localhost:8080`
3. `npm run dev` → http://localhost:5173

## Configuração

A URL da API vem de `VITE_API_URL`, definida no arquivo `.env` (já versionado com o padrão local).

- **Backend em outra porta/máquina (só na sua):** crie `.env.local` com `VITE_API_URL=http://...` — o git ignora esse arquivo.
- **Deploy:** defina `VITE_API_URL` no ambiente do build. O valor é embutido no bundle, então não coloque segredos em variáveis `VITE_*`.
- Depois de mudar qualquer `.env`, reinicie o `npm run dev`.

---

## Template Vite (referência)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.