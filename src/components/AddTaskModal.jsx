'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddTaskModal({ onClose, addTask, taskToEdit, editTask }) {
  const isEditing = Boolean(taskToEdit);
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [priority, setPriority] = useState(taskToEdit?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(
    taskToEdit?.dueDate ? taskToEdit.dueDate.split('T')[0] : ''
  );
  const [category, setCategory] = useState(taskToEdit?.category || 'Personal');

  const priorities = ['High', 'Medium', 'Low'];
  const categories = ['Work', 'Personal', 'College', 'Health', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = { title, description, priority, dueDate, category };

    if (isEditing) {
      editTask(taskToEdit.id, payload);
    } else {
      addTask({ ...payload, completed: false });
    }
    
    onClose();
  };

  const getPriorityClasses = (p) => {
    if (priority === p) {
      if (p === 'High') return 'bg-danger border-danger text-white';
      if (p === 'Medium') return 'bg-primary border-primary text-white';
      if (p === 'Low') return 'bg-success border-success text-white';
    }
    
    if (p === 'High') return 'bg-white border-danger text-danger hover:bg-red-50';
    if (p === 'Medium') return 'bg-white border-primary text-primary hover:bg-orange-50';
    if (p === 'Low') return 'bg-white border-success text-success hover:bg-green-50';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Overlay click area */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div>
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg placeholder-gray-400 bg-transparent border-b-2 border-gray-200 focus:border-primary focus:outline-none pb-2 transition-colors"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <textarea 
              placeholder="Add details... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-50 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Priority</label>
            <div className="flex gap-3">
              {priorities.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${getPriorityClasses(p)}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Due Date</label>
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary bg-surface"
            />
          </div>

          {/* Category Pills */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === c 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-surface text-text-muted border-border-color hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border-color">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-text-muted bg-surface border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
