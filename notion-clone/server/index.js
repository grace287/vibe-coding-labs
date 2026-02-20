import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Prisma Client가 스키마와 맞는지 확인 (Folder, Page 모델 추가 후 generate 필요)
if (!prisma.folder || !prisma.page) {
  console.error(
    'Prisma Client에 folder/page 모델이 없습니다. server 폴더에서 다음을 실행하세요:\n  npx prisma generate\n  npx prisma db push'
  )
  process.exit(1)
}

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

// ---------- 폴더 CRUD ----------
app.get('/api/folders', authMiddleware, async (req, res) => {
  try {
    const list = await prisma.folder.findMany({
      where: { userId: req.userId, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: { pages: { orderBy: { updatedAt: 'desc' } } },
    })
    return res.json(list)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '폴더 목록을 불러오지 못했습니다.' })
  }
})

app.post('/api/folders', authMiddleware, async (req, res) => {
  try {
    const name = req.body.name?.trim() || '새 폴더'
    const parentId = req.body.parentId || null
    const folder = await prisma.folder.create({
      data: { name, userId: req.userId, parentId },
    })
    return res.status(201).json(folder)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '폴더 생성에 실패했습니다.' })
  }
})

app.patch('/api/folders/:id', authMiddleware, async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!folder) return res.status(404).json({ error: '폴더를 찾을 수 없습니다.' })
    const name = req.body.name?.trim()
    const updated = await prisma.folder.update({
      where: { id: req.params.id },
      data: name !== undefined ? { name } : {},
    })
    return res.json(updated)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '폴더 수정에 실패했습니다.' })
  }
})

app.delete('/api/folders/:id', authMiddleware, async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!folder) return res.status(404).json({ error: '폴더를 찾을 수 없습니다.' })
    await prisma.folder.delete({ where: { id: req.params.id } })
    return res.status(204).send()
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '폴더 삭제에 실패했습니다.' })
  }
})

// ---------- 페이지(글) CRUD ----------
app.get('/api/pages', authMiddleware, async (req, res) => {
  try {
    const folderId = req.query.folderId
    const where = { userId: req.userId }
    where.folderId = folderId || null
    const list = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })
    return res.json(list)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '페이지 목록을 불러오지 못했습니다.' })
  }
})

app.get('/api/pages/:id', authMiddleware, async (req, res) => {
  try {
    const page = await prisma.page.findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    if (!page) return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' })
    return res.json(page)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '페이지를 불러오지 못했습니다.' })
  }
})

app.post('/api/pages', authMiddleware, async (req, res) => {
  try {
    const title = req.body.title?.trim() || '제목 없음'
    const content = req.body.content?.trim() || ''
    const folderId = req.body.folderId || null
    const page = await prisma.page.create({
      data: { title, content, userId: req.userId, folderId },
    })
    return res.status(201).json(page)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '페이지 생성에 실패했습니다.' })
  }
})

app.patch('/api/pages/:id', authMiddleware, async (req, res) => {
  try {
    const page = await prisma.page.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!page) return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' })
    const data = {}
    if (req.body.title !== undefined) data.title = (req.body.title && String(req.body.title).trim()) || '제목 없음'
    if (req.body.content !== undefined) data.content = req.body.content
    const updated = await prisma.page.update({
      where: { id: req.params.id },
      data,
    })
    return res.json(updated)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '페이지 수정에 실패했습니다.' })
  }
})

app.delete('/api/pages/:id', authMiddleware, async (req, res) => {
  try {
    const page = await prisma.page.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!page) return res.status(404).json({ error: '페이지를 찾을 수 없습니다.' })
    await prisma.page.delete({ where: { id: req.params.id } })
    return res.status(204).send()
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: '페이지 삭제에 실패했습니다.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))
