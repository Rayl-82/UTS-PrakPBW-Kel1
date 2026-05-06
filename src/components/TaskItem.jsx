'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Calendar, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

export default function TaskItem({ task, toggleTask, deleteTask, onEditTask }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityColors = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-danger border-red-200';
      case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Low': return 'bg-green-50 text-success border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Work': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Personal': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'College': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Health': return 'bg-teal-50 text-teal-600 border-teal-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  return (
    <div className={`flex items-center w-full bg-surface rounded-xl shadow-sm border p-4 transition-all hover:shadow-md ${task.completed ? 'border-gray-100 bg-gray-50/50' : 'border-border-color'}`}>
      
      {/* Left: Checkbox */}
      <button 
        onClick={() => toggleTask(task.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors mr-4 ${
          task.completed 
            ? 'bg-primary border-primary' 
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        {task.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </button>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0 pr-4">
        <h3 className={`text-sm font-medium truncate mb-1.5 transition-colors ${
          task.completed ? 'line-through text-text-muted' : 'text-text-primary'
        }`}>
          {task.title}
        </h3>
        
        <div className="flex items-center gap-3 flex-wrap">
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md border ${task.completed ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-surface text-text-muted border-border-color'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          
          <div className={`text-xs font-medium px-2 py-0.5 rounded-md border ${task.completed ? 'bg-gray-100 text-gray-400 border-transparent' : getCategoryColor(task.category)}`}>
            {task.category}
          </div>
        </div>
      </div>

      {/* Right: Actions & Priority */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full border ${task.completed ? 'bg-gray-100 text-gray-400 border-transparent' : getPriorityColors(task.priority)}`}>
          {task.priority}
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-surface rounded-xl shadow-lg border border-border-color overflow-hidden z-10 py-1">
              <button 
                onClick={() => {
                  onEditTask(task);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-text-muted" />
                Edit
              </button>
              <button 
                onClick={() => {
                  deleteTask(task.id);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
