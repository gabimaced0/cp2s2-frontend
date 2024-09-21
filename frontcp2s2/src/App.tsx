import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  interface Todo {
    id: number;
    title: string;
    description: string;
    isComplete: boolean;
    targetId: number;
  }

  interface Target {
    id: number;
    title: string;
    description: string;
    isComplete: boolean;
  }

  const baseUrl = 'https://todo-caio.azurewebsites.net/api/';
  const [targets, setTargets] = useState<Target[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTarget, setNewTarget] = useState({ title: '', description: '' });
  const [newTodo, setNewTodo] = useState({ title: '', description: '', targetId: 0 });
  const [todoId, setTodoId] = useState<number | null>(null);
  const [targetIdToEdit, setTargetIdToEdit] = useState<number | null>(null);

  const requestBase = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Fetch all targets
  const getTargets = async () => {
    try {
      const response = await requestBase.get('Targets');
      setTargets(response.data);
    } catch (error) {
      console.error('Erro ao buscar targets:', error);
    }
  };

  // Fetch all todos
  const getTodos = async () => {
    try {
      const response = await requestBase.get('Todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Erro ao buscar todos:', error);
    }
  };

  // Add new target
  const postTarget = async () => {
    try {
      const response = await requestBase.post('Targets', newTarget);
      setTargets([...targets, response.data]);
      setNewTarget({ title: '', description: '' });
    } catch (error) {
      console.error('Erro ao adicionar target:', error);
    }
  };

  // Add new todo
  const postTodo = async () => {
    if (newTodo.targetId === 0) {
      alert('Por favor, selecione um Target ID válido');
      return;
    }

    try {
      console.log('Enviando todo:', newTodo); // Verificar o que está sendo enviado
      const response = await requestBase.post('Todos', newTodo);
      console.log('Todo criado:', response.data); // Verificar a resposta da API
      setTodos([...todos, response.data]); // Adicionar novo todo na lista
      setNewTodo({ title: '', description: '', targetId: 0 });
      alert(`Todo criado: ${response.data.title}`);
    } catch (error) {
      console.error('Erro ao adicionar todo:', error.response ? error.response.data : error.message);
    }
  };

  // Update todo
  const putTodo = async () => {
    if (todoId === null) return;
    try {
      const response = await requestBase.put(`Todos/${todoId}`, { ...newTodo, id: todoId });
      setTodos(todos.map(todo => (todo.id === todoId ? response.data : todo)));
      setTodoId(null);
      setNewTodo({ title: '', description: '', targetId: 0 });
    } catch (error) {
      console.error('Erro ao atualizar todo:', error);
    }
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    try {
      await requestBase.delete(`Todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Erro ao excluir todo:', error);
    }
  };

  // Delete target (and related todos)
  const deleteTarget = async (id: number) => {
    try {
      await requestBase.delete(`Targets/${id}`);
      setTargets(targets.filter(target => target.id !== id));
      setTodos(todos.filter(todo => todo.targetId !== id));
    } catch (error) {
      console.error('Erro ao excluir target:', error);
    }
  };

  // Update target
  const putTarget = async () => {
    if (targetIdToEdit === null) return;
    try {
      const targetToUpdate = targets.find(target => target.id === targetIdToEdit);
      if (targetToUpdate) {
        const response = await requestBase.put(`Targets/${targetIdToEdit}`, { ...targetToUpdate, ...newTarget });
        setTargets(targets.map(target => (target.id === targetIdToEdit ? response.data : target)));
        setTargetIdToEdit(null);
        setNewTarget({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Erro ao atualizar target:', error);
    }
  };

  useEffect(() => {
    getTargets();
    getTodos();
  }, []);

  return (
    <div>
      <h1>Todo App</h1>

      <h2>Add Target</h2>
      <input
        type="text"
        placeholder="Title"
        value={newTarget.title}
        onChange={(e) => setNewTarget({ ...newTarget, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={newTarget.description}
        onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
      />
      <button onClick={targetIdToEdit ? putTarget : postTarget}>
        {targetIdToEdit ? 'Update Target' : 'Add Target'}
      </button>

      <h2>Targets</h2>
      <ul>
        {targets.map((target) => (
          <li key={target.id}>
            <strong>ID: {target.id}</strong> - {target.title} - {target.description}
            <button onClick={() => {
              setTargetIdToEdit(target.id);
              setNewTarget({ title: target.title, description: target.description });
            }}>Edit</button>
            <button onClick={() => deleteTarget(target.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Add Todo</h2>
      <input
        type="text"
        placeholder="Title"
        value={newTodo.title}
        onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={newTodo.description}
        onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
      />
      <select
        value={newTodo.targetId}
        onChange={(e) => setNewTodo({ ...newTodo, targetId: Number(e.target.value) })}
      >
        <option value={0}>Select Target ID</option>
        {targets.map(target => (
          <option key={target.id} value={target.id}>
            {target.title} (ID: {target.id})
          </option>
        ))}
      </select>
      <button onClick={todoId ? putTodo : postTodo}>
        {todoId ? 'Update Todo' : 'Add Todo'}
      </button>

      <h2>Todos</h2>
      {todos.length === 0 ? (
        <p>Nenhum todo foi encontrado.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <strong>ID: {todo.id}</strong> - {todo.title} - {todo.description} - <em>Target ID: {todo.targetId}</em>
              <button onClick={() => {
                setTodoId(todo.id);
                setNewTodo({ title: todo.title, description: todo.description, targetId: todo.targetId });
              }}>Edit</button>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
