# Prisma 사용 정리 (notion-clone)

이 문서는 notion-clone 프로젝트에서 **Prisma**가 어떻게 설정·사용되는지 정리한 내용입니다.

---

## 1. Prisma란?

Prisma는 Node.js용 **ORM(객체 관계 매핑)** 도구입니다. 스키마 파일(`.prisma`)로 DB 구조를 정의하면, 타입 안전한 클라이언트 코드로 DB를 조회·수정할 수 있습니다.

- **스키마**: `server/prisma/schema.prisma`
- **클라이언트**: `@prisma/client` (스키마 기반으로 자동 생성)
- **DB**: 이 프로젝트는 **SQLite** 사용 (파일 기반, 별도 DB 서버 불필요)

---

## 2. 스키마 구조

경로: `server/prisma/schema.prisma`

### Generator

```prisma
generator client {
  provider = "prisma-client-js"
}
```

- JavaScript/TypeScript용 Prisma Client를 생성합니다.
- `prisma generate` 실행 시 `node_modules/.prisma/client`에 코드가 생성됩니다.

### Datasource

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

- **provider**: 사용할 DB 종류. 여기서는 `sqlite`.
- **url**: 연결 정보. 환경 변수 `DATABASE_URL`에서 읽습니다.

### User 모델

| 필드          | 타입     | 설명 |
|---------------|----------|------|
| `id`          | String   | 기본키. `@default(cuid())`로 자동 생성 |
| `email`       | String   | 이메일. `@unique`로 중복 불가 |
| `passwordHash`| String   | bcrypt로 해시한 비밀번호 |
| `name`        | String?  | 이름 (선택) |
| `createdAt`   | DateTime | 생성 시각. `@default(now())` |
| `updatedAt`   | DateTime | 수정 시각. `@updatedAt`로 자동 갱신 |

---

## 3. 환경 변수

`server/.env` 파일에서 다음 변수를 사용합니다.

| 변수           | 설명 | 예시 |
|----------------|------|------|
| `DATABASE_URL` | DB 연결 문자열 (SQLite) | `file:./dev.db` |
| `JWT_SECRET`   | JWT 서명용 비밀키 (Prisma와 무관, 서버 인증용) | `your-secret-key` |

SQLite에서는 `file:./dev.db`처럼 상대 경로를 쓰면, DB 파일이 **prisma 폴더 기준**으로 `server/prisma/dev.db`에 생성됩니다.

---

## 4. npm 스크립트 (server 폴더 기준)

`server/package.json`에 정의된 Prisma 관련 스크립트입니다.

| 스크립트 | 명령어 | 설명 |
|----------|--------|------|
| `db:generate` | `prisma generate` | 스키마를 반영해 Prisma Client 코드 생성. 스키마 수정 후 실행 필요 |
| `db:push`     | `prisma db push` | 스키마를 DB에 반영(마이그레이션 파일 없이 테이블 생성/수정). 개발 시 편의용 |
| `db:migrate`  | `prisma migrate dev` | 마이그레이션 생성·적용 (이력 관리용, 필요 시 사용) |

**처음 설정 시 권장 순서:**

```bash
cd server
npm install
npx prisma generate
npx prisma db push
```

---

## 5. 서버 코드에서의 사용

Express 서버(`server/index.js`)에서는 **PrismaClient** 인스턴스를 만들고, 인증 API에서 사용합니다.

### 인스턴스 생성

```js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

### 사용 예시 (이 프로젝트 기준)

| API | Prisma 메서드 | 용도 |
|-----|----------------|------|
| 회원가입 | `prisma.user.findUnique` | 이메일 중복 확인 |
| 회원가입 | `prisma.user.create` | 새 사용자 저장 |
| 로그인   | `prisma.user.findUnique` | 이메일로 사용자 조회 후 비밀번호 비교 |
| 로그인/회원가입 | 응답 시 `select` | `passwordHash` 제외하고 클라이언트에 전달 |
| `/api/auth/me` | `prisma.user.findUnique` | `req.userId`로 현재 사용자 조회 |

- 비밀번호는 **저장 전에 bcrypt로 해시**하고, 조회 시에는 `select`로 필요한 필드만 가져옵니다.
- `select: { id: true, email: true, name: true, ... }`처럼 응답에 포함할 필드를 지정해 `passwordHash`를 노출하지 않습니다.

---

## 6. 자주 쓰는 명령어 요약

```bash
# server 폴더에서
cd server

# 클라이언트 재생성 (스키마 수정 후)
npx prisma generate

# DB에 스키마 반영 (테이블 생성/수정)
npx prisma db push

# DB 내용 확인 (Prisma Studio GUI)
npx prisma studio
```

스키마를 수정한 뒤에는 **반드시 `prisma generate`**를 실행해야 서버 코드에서 새 필드/모델을 사용할 수 있습니다.

---

## 7. 파일 위치 정리

| 항목 | 경로 |
|------|------|
| 스키마 정의 | `server/prisma/schema.prisma` |
| SQLite DB 파일 | `server/prisma/dev.db` (db push 후 생성) |
| Prisma Client (자동 생성) | `server/node_modules/.prisma/client` |
| 환경 변수 | `server/.env` |

이 문서는 notion-clone 폴더 기준으로 작성되었습니다.
