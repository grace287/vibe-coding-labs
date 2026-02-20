import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import * as api from './api'
import './App.css'

function Sidebar({
  folders,
  rootPages,
  currentPageId,
  onSelectPage,
  onNewPage,
  onNewFolder,
  onDeleteFolder,
  onDeletePage,
  token,
  loading,
}) {
  const [collapsed, setCollapsed] = useState(false)

  const handleDeleteFolder = (e, id) => {
    e.stopPropagation()
    if (window.confirm('이 폴더를 삭제하시겠습니까? 폴더 안의 페이지는 루트로 옮겨집니다.')) {
      onDeleteFolder(id)
    }
  }

  const handleDeletePage = (e, id) => {
    e.stopPropagation()
    if (window.confirm('이 페이지를 삭제하시겠습니까?')) {
      onDeletePage(id)
    }
  }

  return (
    <aside className={`notion-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? '사이드바 열기' : '사이드바 접기'}
        >
          {collapsed ? '»' : '«'}
        </button>
        {!collapsed && (
          <>
            <div className="workspace-name">내 워크스페이스</div>
            <button type="button" className="sidebar-new-page" onClick={() => onNewPage()}>
              새 페이지
            </button>
            <button type="button" className="sidebar-new-folder" onClick={() => onNewFolder()}>
              새 폴더
            </button>
          </>
        )}
      </div>
      {!collapsed && (
        <nav className="sidebar-pages">
          {loading ? (
            <div className="sidebar-loading">로딩 중...</div>
          ) : (
            <>
              {rootPages.map((p) => (
                <div key={p.id} className="sidebar-page-row">
                  <button
                    type="button"
                    className={`sidebar-page-item ${currentPageId === p.id ? 'active' : ''}`}
                    onClick={() => onSelectPage(p.id)}
                  >
                    <span className="page-icon">📄</span>
                    <span className="page-title">{p.title || '제목 없음'}</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-item-delete"
                    onClick={(e) => handleDeletePage(e, p.id)}
                    aria-label="페이지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
              {folders.map((folder) => (
                <div key={folder.id} className="sidebar-folder">
                  <div className="sidebar-folder-header">
                    <span className="folder-icon">📁</span>
                    <span className="folder-name">{folder.name}</span>
                    <button
                      type="button"
                      className="sidebar-item-delete"
                      onClick={(e) => handleDeleteFolder(e, folder.id)}
                      aria-label="폴더 삭제"
                    >
                      ×
                    </button>
                  </div>
                  <div className="sidebar-folder-pages">
                    {folder.pages?.map((p) => (
                      <div key={p.id} className="sidebar-page-row indent">
                        <button
                          type="button"
                          className={`sidebar-page-item ${currentPageId === p.id ? 'active' : ''}`}
                          onClick={() => onSelectPage(p.id)}
                        >
                          <span className="page-icon">📄</span>
                          <span className="page-title">{p.title || '제목 없음'}</span>
                        </button>
                        <button
                          type="button"
                          className="sidebar-item-delete"
                          onClick={(e) => handleDeletePage(e, p.id)}
                          aria-label="페이지 삭제"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="sidebar-add-page-in-folder"
                      onClick={() => onNewPage(folder.id)}
                    >
                      + 페이지 추가
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </nav>
      )}
    </aside>
  )
}

function PageContent({ page, onSave, onDelete, onPageUpdated, token }) {
  const [title, setTitle] = useState(page?.title ?? '')
  const [content, setContent] = useState(page?.content ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(page?.title ?? '')
    setContent(page?.content ?? '')
  }, [page?.id, page?.title, page?.content])

  const handleSave = useCallback(async () => {
    if (!page || !token) return
    if (title === (page.title ?? '') && content === (page.content ?? '')) return
    setSaving(true)
    try {
      const updated = await api.updatePage(token, page.id, { title: title.trim() || '제목 없음', content })
      onPageUpdated?.(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [page, token, title, content, onPageUpdated])

  if (!page) {
    return (
      <article className="notion-page">
        <div className="notion-page-empty">페이지를 선택하거나 새 페이지를 만드세요.</div>
      </article>
    )
  }

  const handleDelete = () => {
    if (window.confirm('이 페이지를 삭제하시겠습니까?')) {
      onDelete(page.id)
    }
  }

  return (
    <article className="notion-page">
      <header className="notion-page-header">
        <input
          type="text"
          className="notion-page-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="제목 없음"
        />
        <div className="notion-page-actions">
          {saving && <span className="saving-label">저장 중...</span>}
          <button type="button" className="btn-page-delete" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </header>
      <textarea
        className="notion-page-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleSave}
        placeholder="내용을 입력하세요..."
      />
    </article>
  )
}

function TopBar({ pageTitle, user, onLogout }) {
  return (
    <div className="notion-topbar">
      <div className="topbar-breadcrumb">
        <span className="breadcrumb-item">{pageTitle || '제목 없음'}</span>
      </div>
      <div className="topbar-user">
        <span className="topbar-email">{user?.name || user?.email}</span>
        <button type="button" className="topbar-logout" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  )
}

function App() {
  const { user, token, loading: authLoading, logout } = useAuth()
  const [authMode, setAuthMode] = useState('login')
  const [folders, setFolders] = useState([])
  const [rootPages, setRootPages] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [foldersRes, pagesRes] = await Promise.all([
        api.fetchFolders(token),
        api.fetchRootPages(token),
      ])
      setFolders(foldersRes)
      setRootPages(pagesRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!currentPage?.id || !token) return
    api
      .fetchPage(token, currentPage.id)
      .then(setCurrentPage)
      .catch(console.error)
  }, [currentPage?.id, token])

  const handleSelectPage = useCallback((id) => {
    setCurrentPage({ id })
  }, [])

  const handleNewPage = useCallback(
    async (folderId) => {
      if (!token) return
      try {
        const page = await api.createPage(token, { folderId: folderId || undefined })
        await loadData()
        setCurrentPage(page)
      } catch (err) {
        console.error(err)
        alert(err.message)
      }
    },
    [token, loadData]
  )

  const handleNewFolder = useCallback(async () => {
    if (!token) return
    try {
      await api.createFolder(token, { name: '새 폴더' })
      await loadData()
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }, [token, loadData])

  const handleDeleteFolder = useCallback(
    async (id) => {
      if (!token) return
      try {
        await api.deleteFolder(token, id)
        await loadData()
        if (currentPage?.id) {
          const inFolder = folders.some((f) => f.pages?.some((p) => p.id === currentPage.id))
          if (inFolder) setCurrentPage(null)
        }
      } catch (err) {
        console.error(err)
        alert(err.message)
      }
    },
    [token, loadData, folders, currentPage]
  )

  const handleDeletePage = useCallback(
    async (id) => {
      if (!token) return
      try {
        await api.deletePage(token, id)
        await loadData()
        if (currentPage?.id === id) setCurrentPage(null)
      } catch (err) {
        console.error(err)
        alert(err.message)
      }
    },
    [token, loadData, currentPage]
  )

  if (authLoading) {
    return (
      <div className="notion-app notion-loading">
        <div className="loading-text">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthMode('login')} />
    )
  }

  return (
    <div className="notion-app">
      <Sidebar
        folders={folders}
        rootPages={rootPages}
        currentPageId={currentPage?.id}
        onSelectPage={handleSelectPage}
        onNewPage={handleNewPage}
        onNewFolder={handleNewFolder}
        onDeleteFolder={handleDeleteFolder}
        onDeletePage={handleDeletePage}
        token={token}
        loading={loading}
      />
      <div className="notion-body">
        <TopBar pageTitle={currentPage?.title} user={user} onLogout={logout} />
        <main className="notion-main">
          <div className="notion-main-inner">
            <PageContent
              page={currentPage}
              onDelete={handleDeletePage}
              onPageUpdated={setCurrentPage}
              token={token}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
