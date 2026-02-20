import { useState } from 'react'
import './App.css'

function Sidebar({ currentPageId, onSelectPage, pages }) {
  const [collapsed, setCollapsed] = useState(false)
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
            <button type="button" className="sidebar-new-page">새 페이지</button>
          </>
        )}
      </div>
      {!collapsed && (
        <nav className="sidebar-pages">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`sidebar-page-item ${currentPageId === p.id ? 'active' : ''}`}
              onClick={() => onSelectPage(p.id)}
            >
              <span className="page-icon">📄</span>
              <span className="page-title">{p.title}</span>
            </button>
          ))}
        </nav>
      )}
    </aside>
  )
}

function Block({ type = 'paragraph', placeholder, children }) {
  const Tag = type === 'heading1' ? 'h1' : type === 'heading2' ? 'h2' : type === 'heading3' ? 'h3' : 'div'
  return (
    <div className="notion-block">
      <span className="block-handle" aria-hidden>⋮⋮</span>
      <Tag className={`block-content block-${type}`}>
        {children ?? <span className="placeholder">{placeholder}</span>}
      </Tag>
    </div>
  )
}

function PageContent({ page }) {
  if (!page) return null
  return (
    <article className="notion-page">
      <header className="notion-page-header">
        <h1 className="notion-page-title">{page.title || '제목 없음'}</h1>
      </header>
      <div className="notion-blocks">
        <Block type="paragraph" placeholder="내용을 입력하세요..." />
        <Block type="paragraph" placeholder="텍스트를 입력하세요." />
        <Block type="heading1" placeholder="제목 1" />
        <Block type="paragraph" placeholder="내용을 입력하세요..." />
        <Block type="heading2" placeholder="제목 2" />
        <Block type="paragraph" placeholder="내용을 입력하세요..." />
      </div>
    </article>
  )
}

function TopBar({ pageTitle }) {
  return (
    <div className="notion-topbar">
      <div className="topbar-breadcrumb">
        <span className="breadcrumb-item">{pageTitle || '제목 없음'}</span>
      </div>
    </div>
  )
}

function App() {
  const [currentPageId, setCurrentPageId] = useState('1')
  const pages = [
    { id: '1', title: '시작하기' },
    { id: '2', title: '할 일 목록' },
    { id: '3', title: '메모' },
  ]
  const currentPage = pages.find((p) => p.id === currentPageId) ?? pages[0]

  return (
    <div className="notion-app">
      <Sidebar
        currentPageId={currentPageId}
        onSelectPage={setCurrentPageId}
        pages={pages}
      />
      <div className="notion-body">
        <TopBar pageTitle={currentPage?.title} />
        <main className="notion-main">
        <div className="notion-main-inner">
          <PageContent page={currentPage} />
        </div>
      </main>
      </div>
    </div>
  )
}

export default App
