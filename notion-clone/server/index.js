import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'notion-clone-secret'

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: '인증이 필요합니다.' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' })
  }
}

// 회원가입
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력하세요.' })
    }
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existing) return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name?.trim() || null,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    })
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(201).json({ user, token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' })
  }
})

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력하세요.' })
    }
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, name: true, passwordHash: true },
    })
    if (!user) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    const { passwordHash: _, ...safe } = user
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ user: safe, token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' })
  }
})

// 로그아웃 (클라이언트에서 토큰 제거; 서버는 토큰 무효화 없이 200만 반환)
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  return res.json({ ok: true })
})

// 현재 사용자 정보 (선택)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    })
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
    return res.json(user)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '오류가 발생했습니다.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))
