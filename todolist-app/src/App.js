import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

function nextId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function TodoListContainer({ container, onEdit, onSave, onDelete, onAddTodo, onToggleTodo, onAfterDelete, searchQuery }) {
  const { id, dateLabel, todos, isEditMode } = container;
  const [editTexts, setEditTexts] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredTodos = searchQuery.trim()
    ? todos.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : todos;

  const handleSave = () => {
    const next = { ...container, todos: container.todos.map(t => ({ ...t, text: editTexts[t.id] ?? t.text })), isEditMode: false };
    onSave(next);
    setEditTexts({});
  };

  const startEdit = () => {
    const texts = {};
    container.todos.forEach(t => { texts[t.id] = t.text; });
    setEditTexts(texts);
    onEdit(id);
  };

  const updateEditText = (todoId, text) => {
    setEditTexts(prev => ({ ...prev, [todoId]: text }));
  };

  const handleDeleteClick = () => setShowDeleteModal(true);

  const handleDeleteConfirm = () => {
    onDelete(id);
    onAfterDelete?.();
    setShowDeleteModal(false);
  };

  if (filteredTodos.length === 0 && searchQuery.trim()) return null;

  return (
    <>
      <div className="card todo-container shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
          <span className="fw-semibold text-dark">{dateLabel}</span>
          <div className="btn-group btn-group-sm">
            {!isEditMode ? (
              <>
                <button type="button" className="btn btn-outline-secondary" onClick={startEdit}>수정</button>
                <button type="button" className="btn btn-outline-danger" onClick={handleDeleteClick}>삭제</button>
              </>
            ) : (
              <button type="button" className="btn btn-success" onClick={handleSave}>저장</button>
            )}
          </div>
        </div>
        <ul className="list-group list-group-flush">
          {filteredTodos.map(todo => (
            <li key={todo.id} className="list-group-item d-flex align-items-center gap-2">
              {isEditMode ? (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={editTexts[todo.id] ?? todo.text}
                  onChange={e => updateEditText(todo.id, e.target.value)}
                />
              ) : (
                <>
                  <input
                    type="checkbox"
                    className="form-check-input flex-shrink-0"
                    checked={todo.done}
                    onChange={() => onToggleTodo(id, todo.id)}
                  />
                  <span className={todo.done ? 'text-muted text-decoration-line-through flex-grow-1' : 'flex-grow-1'}>{todo.text}</span>
                </>
              )}
            </li>
          ))}
        </ul>
        {!isEditMode && (
          <AddTodoInput containerId={id} onAdd={onAddTodo} placeholder="할 일 입력 후 Enter" />
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }} tabIndex={-1} aria-hidden={!showDeleteModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">삭제 확인</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} aria-label="닫기" />
            </div>
            <div className="modal-body">
              이 할 일 목록을 삭제하시겠습니까?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>취소</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>삭제</button>
            </div>
          </div>
        </div>
        {showDeleteModal && <div className="modal-backdrop fade show" onClick={() => setShowDeleteModal(false)} />}
      </div>
    </>
  );
}

function AddTodoInput({ containerId, onAdd, placeholder }) {
  const [value, setValue] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onAdd(containerId, text);
    setValue('');
  };
  return (
    <form className="p-2 border-top bg-white d-flex gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-control form-control-sm"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="submit" className="btn btn-primary btn-sm">추가</button>
    </form>
  );
}

function App() {
  const [containers, setContainers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteAlert, setDeleteAlert] = useState(false);

  const showDeleteAlert = useCallback(() => {
    setDeleteAlert(true);
  }, []);

  useEffect(() => {
    if (!deleteAlert) return;
    const t = setTimeout(() => setDeleteAlert(false), 3000);
    return () => clearTimeout(t);
  }, [deleteAlert]);

  const addNewTodoList = useCallback(() => {
    const dateLabel = formatDate(new Date());
    const newContainer = {
      id: nextId(),
      dateLabel,
      todos: [],
      isEditMode: false,
    };
    setContainers(prev => [...prev, newContainer]);
  }, []);

  const addTodo = useCallback((containerId, text) => {
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c;
      return {
        ...c,
        todos: [...c.todos, { id: nextId(), text, done: false }],
      };
    }));
  }, []);

  const toggleTodo = useCallback((containerId, todoId) => {
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c;
      return {
        ...c,
        todos: c.todos.map(t => t.id === todoId ? { ...t, done: !t.done } : t),
      };
    }));
  }, []);

  const setEditMode = useCallback((containerId) => {
    setContainers(prev => prev.map(c => ({ ...c, isEditMode: c.id === containerId })));
  }, []);

  const saveContainer = useCallback((updated) => {
    setContainers(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const deleteContainer = useCallback((containerId) => {
    setContainers(prev => prev.filter(c => c.id !== containerId));
  }, []);

  const filteredContainers = searchQuery.trim()
    ? containers.filter(c => c.todos.some(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())))
    : containers;

  return (
    <div className="App min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">할 일 목록</span>
        </div>
      </nav>

      <div className="container py-4">
        {deleteAlert && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            할 일 목록이 삭제되었습니다.
            <button type="button" className="btn-close" onClick={() => setDeleteAlert(false)} aria-label="닫기" />
          </div>
        )}

        <div className="d-flex flex-column flex-md-row gap-2 mb-4">
          <input
            type="search"
            className="form-control"
            placeholder="메모 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="button" className="btn btn-primary flex-shrink-0" onClick={addNewTodoList}>
            새 할 일
          </button>
        </div>

        <main>
          {containers.length === 0 ? (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-3">할 일 목록이 없습니다.</p>
                <button type="button" className="btn btn-primary" onClick={addNewTodoList}>
                  새 할 일
                </button>
                <p className="small text-muted mt-3 mb-0">버튼을 누르면 할 일 컨테이너가 생기고, 바로 입력할 수 있습니다.</p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredContainers.map(c => (
                <TodoListContainer
                  key={c.id}
                  container={c}
                  onEdit={setEditMode}
                  onSave={saveContainer}
                  onDelete={deleteContainer}
                  onAddTodo={addTodo}
                  onToggleTodo={toggleTodo}
                  onAfterDelete={showDeleteAlert}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
          {searchQuery.trim() && filteredContainers.length === 0 && (
            <p className="text-center text-muted py-4">검색 결과가 없습니다.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
