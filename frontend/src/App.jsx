import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Plus, LayoutList } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/todos`);
      setTodos(res.data);
    } catch (err) {
      console.error("Failed to fetch todos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/api/todos`, { title: taskName });
      setTodos([res.data, ...todos]);
      setTaskName('');
    } catch (err) {
      console.error("Failed to add todo", err);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/todos/${id}`, { completed: !currentStatus });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error("Failed to update todo", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to delete todo", err);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-12 px-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">

      {/* Header Banner */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <LayoutList className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 pb-2">
          ToDo App
        </h1>
        <p className="text-slate-400 mt-2">
          {todos.length} Active Objectives | {completedCount} Completed
        </p>
      </motion.div>

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">

        {/* Add Task Form */}
        <form onSubmit={handleAddTodo} className="flex gap-3 mb-8">
          <input
            type="text"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-5 py-3 text-white outline-none transition-all placeholder:text-slate-600 text-sm shadow-inner"
          />
          <button
            type="submit"
            disabled={!taskName.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 px-6 font-bold rounded-xl transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
              No tasks currently registered.
            </div>
          ) : (
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.div
                  key={todo._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${todo.completed
                    ? 'bg-emerald-900/10 border-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                    }`}
                >
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleTodo(todo._id, todo.completed)}>
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 flex-shrink-0 group-hover:text-emerald-400/50 transition-colors" />
                    )}
                    <span className={`text-sm md:text-base transition-all ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                      {todo.title}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
