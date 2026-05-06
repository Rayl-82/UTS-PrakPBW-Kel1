'use client';

import { useState, useEffect } from 'react';
import TasksPage from './TasksPage';
import AddTaskModal from './AddTaskModal';
import { useToast } from './ToastProvider';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Fetch all todos on mount
  useEffect(() => {
    fetch('/api/todos')
      .then(r => r.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const addTask = async (taskData) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    if (res.ok) {
      const updated = await fetch('/api/todos')
      const data = await updated.json()
      setTasks(Array.isArray(data) ? data : [])
      setIsModalOpen(false)
      showToast('Task saved successfully')
    }
  };

  const editTask = async (id, taskData) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (res.ok) {
      const updated = await fetch('/api/todos');
      const data = await updated.json();
      setTasks(Array.isArray(data) ? data : []);
      setTaskToEdit(null);
      setIsModalOpen(false);
      showToast('Task updated successfully');
    }
  };

  const toggleTask = async (id) => {
    // Optimistic update — flip locally first for instant UI feedback
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;
    const newDone = !currentTask.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newDone } : t))
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: newDone }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Roll back optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !newDone } : t))
      );
      setError('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (id) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please refresh the page.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto animate-slide-down">
        <div className="px-6 py-8 md:py-10 max-w-5xl mx-auto w-full">
          {/* Header skeleton */}
          <div className="flex justify-end mb-8">
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          {/* Date navigator skeleton */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          {/* Search skeleton */}
          <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-8" />
          {/* Tabs skeleton */}
          <div className="flex gap-6 border-b border-border-color mb-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3" />
            ))}
          </div>
          {/* Task cards skeleton */}
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 font-medium underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <TasksPage
        tasks={tasks}
        onOpenModal={() => { setTaskToEdit(null); setIsModalOpen(true); }}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        onEditTask={(task) => { setTaskToEdit(task); setIsModalOpen(true); }}
        isModalOpen={isModalOpen}
      />

      {isModalOpen && (
        <AddTaskModal
          onClose={() => { setIsModalOpen(false); setTaskToEdit(null); }}
          addTask={addTask}
          taskToEdit={taskToEdit}
          editTask={editTask}
        />
      )}
    </>
  );
}
