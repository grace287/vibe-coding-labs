const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function fetchFolders(token) {
  const res = await fetch('/api/folders', { headers: getHeaders(token) })
  if (!res.ok) throw new Error('폴더 목록을 불러오지 못했습니다.')
  return res.json()
}

export async function createFolder(token, { name = '새 폴더', parentId } = {}) {
  const res = await fetch('/api/folders', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name, parentId: parentId || undefined }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '폴더 생성에 실패했습니다.')
  }
  return res.json()
}

export async function updateFolder(token, id, { name }) {
  const res = await fetch(`/api/folders/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '폴더 수정에 실패했습니다.')
  }
  return res.json()
}

export async function deleteFolder(token, id) {
  const res = await fetch(`/api/folders/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '폴더 삭제에 실패했습니다.')
  }
}

/** 루트(폴더 없음) 페이지 목록 */
export async function fetchRootPages(token) {
  const res = await fetch('/api/pages?folderId=', { headers: getHeaders(token) })
  if (!res.ok) throw new Error('페이지 목록을 불러오지 못했습니다.')
  return res.json()
}

export async function fetchPagesInFolder(token, folderId) {
  const res = await fetch(`/api/pages?folderId=${encodeURIComponent(folderId)}`, {
    headers: getHeaders(token),
  })
  if (!res.ok) throw new Error('페이지 목록을 불러오지 못했습니다.')
  return res.json()
}

export async function fetchPage(token, id) {
  const res = await fetch(`/api/pages/${id}`, { headers: getHeaders(token) })
  if (!res.ok) throw new Error('페이지를 불러오지 못했습니다.')
  return res.json()
}

export async function createPage(token, { title = '제목 없음', content = '', folderId } = {}) {
  const res = await fetch('/api/pages', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ title, content, folderId: folderId || undefined }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '페이지 생성에 실패했습니다.')
  }
  return res.json()
}

export async function updatePage(token, id, { title, content }) {
  const res = await fetch(`/api/pages/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ title, content }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '페이지 수정에 실패했습니다.')
  }
  return res.json()
}

export async function deletePage(token, id) {
  const res = await fetch(`/api/pages/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || '페이지 삭제에 실패했습니다.')
  }
}
