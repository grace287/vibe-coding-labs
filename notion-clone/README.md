# 노션 클론 (Notion Clone)

React + Vite 프론트엔드, Express + Prisma 백엔드. 회원가입·로그인·로그아웃 지원.

## 실행 방법

### 1. 백엔드 (API 서버)

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

서버는 `http://localhost:3001`에서 실행됩니다. SQLite DB는 `server/prisma/dev.db`에 생성됩니다.

### 2. 프론트엔드

프로젝트 루트에서:

```bash
npm install
npm run dev
```

브라우저에서 Vite 개발 서버 주소(예: http://localhost:5173)로 접속합니다. `/api` 요청은 Vite 프록시를 통해 백엔드(3001)로 전달됩니다.

## API

- `POST /api/auth/signup` — 회원가입 (body: `email`, `password`, `name?`)
- `POST /api/auth/login` — 로그인 (body: `email`, `password`)
- `POST /api/auth/logout` — 로그아웃 (Header: `Authorization: Bearer <token>`)
- `GET /api/auth/me` — 현재 사용자 정보 (Header: `Authorization: Bearer <token>`)

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
