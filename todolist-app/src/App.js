import React, { useState, useCallback } from 'react';
import './App.css';

function nextId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function TodoListContainer({ container, onEdit, onSave, onDelete, onAddTodo, onToggleTodo, searchQuery }) {
  const { id, dateLabel, todos, isEditMode } = container;
  const [editTexts, setEditTexts] = useState({}); // id -> text for edit mode

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

  if (filteredTodos.length === 0 && searchQuery.trim()) return null;

  return (
    <div className="todo-container">
      <div className="container-header">
        <span className="date-label">{dateLabel}</span>
        <div className="header-actions">
          {!isEditMode ? (
            <>
              <button type="button" className="btn btn-edit" onClick={startEdit}>수정</button>
              <button type="button" className="btn btn-delete" onClick={() => onDelete(id)}>삭제</button>
            </>
          ) : (
            <button type="button" className="btn btn-save" onClick={handleSave}>저장</button>
          )}
        </div>
      </div>
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className="todo-item">
            {isEditMode ? (
              <input
                type="text"
                className="todo-input-edit"
                value={editTexts[todo.id] ?? todo.text}
                onChange={e => updateEditText(todo.id, e.target.value)}
              />
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => onToggleTodo(id, todo.id)}
                />
                <span className={todo.done ? 'todo-text done' : 'todo-text'}>{todo.text}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      {!isEditMode && (
        <AddTodoInput containerId={id} onAdd={onAddTodo} placeholder="할 일 입력 후 Enter" />
      )}
    </div>
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
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="submit" className="btn btn-add">추가</button>
    </form>
  );
}

function App() {
  const [containers, setContainers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    setContainers(prev => {
      const next = prev.filter(c => c.id !== containerId);
      return next;
    });
  }, []);

  const filteredContainers = searchQuery.trim()
    ? containers.filter(c => c.todos.some(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())))
    : containers;

  return (
    <div className="App">
      <header className="App-header">
        <h1>할 일 목록</h1>
        <div className="toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="메모 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={addNewTodoList}>
            새 할 일
          </button>
        </div>
      </header>
      <main className="App-main">
        {containers.length === 0 ? (
          <div className="empty-state">
            <p>할 일 목록이 없습니다.</p>
            <button type="button" className="btn btn-primary" onClick={addNewTodoList}>
              새 할 일
            </button>
            <p className="hint">버튼을 누르면 할 일 컨테이너가 생기고, 바로 입력할 수 있습니다.</p>
          </div>
        ) : (
          <div className="container-list">
            {filteredContainers.map(c => (
              <TodoListContainer
                key={c.id}
                container={c}
                onEdit={setEditMode}
                onSave={saveContainer}
                onDelete={deleteContainer}
                onAddTodo={addTodo}
                onToggleTodo={toggleTodo}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
        {searchQuery.trim() && filteredContainers.length === 0 && (
          <p className="no-results">검색 결과가 없습니다.</p>
        )}
      </main>
    </div>
  );
}

export default App;
