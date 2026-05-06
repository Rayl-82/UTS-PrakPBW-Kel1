'use client';

import { useState, useRef } from 'react';
import { Plus, Search, ClipboardList, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import TaskItem from './TaskItem';

export default function TasksPage({ tasks, onOpenModal, toggleTask, deleteTask, onEditTask, isModalOpen }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllDates, setShowAllDates] = useState(false);
  const dateInputRef = useRef(null);

  const tabs = ['All', 'Active', 'Completed'];

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  let dateFilteredTasks = tasks;
  if (!showAllDates) {
    dateFilteredTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return due.getDate() === selectedDate.getDate() &&
        due.getMonth() === selectedDate.getMonth() &&
        due.getFullYear() === selectedDate.getFullYear();
    });
  }

  const getFilteredTasks = () => {
    let tabFilteredTasks = dateFilteredTasks;

    if (activeTab === 'Active') {
      tabFilteredTasks = dateFilteredTasks.filter(t => !t.completed);
    } else if (activeTab === 'Completed') {
      tabFilteredTasks = dateFilteredTasks.filter(t => t.completed);
    }

    if (searchQuery.trim()) {
      return tabFilteredTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return tabFilteredTasks;
  };

  const filteredTasks = getFilteredTasks();

  const totalCount = dateFilteredTasks.length;
  const completedCount = dateFilteredTasks.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;

  const tabCounts = {
    'All': totalCount,
    'Active': activeCount,
    'Completed': completedCount
  };

  const dateBoxClass = showAllDates
    ? 'border-gray-300 bg-gray-100 text-gray-400'
    : 'border-[#E8520A] bg-white text-[#E8520A]';

  const dateIconClass = showAllDates ? 'text-gray-400' : 'text-[#E8520A]';

  const dateDisplayText = showAllDates
    ? 'All Dates'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric',
        month: 'long', year: 'numeric'
      });

  return (
    <div className={`flex-1 flex flex-col h-full bg-background relative animate-slide-down ${isModalOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="px-6 py-8 md:py-10 max-w-5xl mx-auto w-full">
        <div className="flex justify-end items-center mb-8">
          <button 
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center w-full mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const prevDay = new Date(selectedDate);
                prevDay.setDate(prevDay.getDate() - 1);
                setSelectedDate(prevDay);
                setShowAllDates(false);
              }}
              className="border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div 
              onClick={() => dateInputRef.current?.showPicker()}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border min-w-[220px] justify-center cursor-pointer select-none transition-all duration-300 ease-in-out date-box-transition ${dateBoxClass}`}
            >
              <CalendarDays className={`w-4 h-4 ${dateIconClass}`} />
              <span className="text-sm font-medium">{dateDisplayText}</span>
              <input
                type="date"
                ref={dateInputRef}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value + 'T00:00:00'));
                    setShowAllDates(false);
                  }
                }}
              />
            </div>
            <button 
              onClick={() => {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                setSelectedDate(nextDay);
                setShowAllDates(false);
              }}
              className="border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setSelectedDate(new Date());
                setShowAllDates(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isToday(selectedDate) && !showAllDates
                  ? 'bg-[#E8520A] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => setShowAllDates(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                showAllDates
                  ? 'bg-[#E8520A] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Dates
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-border-color mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab} ({tabCounts[tab]})
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3 pb-20 md:pb-8">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                onEditTask={onEditTask}
              />
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">
                {searchQuery ? "No tasks here" : showAllDates ? "No tasks found" : isToday(selectedDate) ? "No tasks today" : "No tasks on this date"}
              </h3>
              <p className="text-sm text-text-muted">
                {searchQuery 
                  ? "We couldn't find any tasks matching your search." 
                  : showAllDates 
                    ? "You have no tasks yet." 
                    : isToday(selectedDate) 
                      ? "You're all caught up! Enjoy your day." 
                      : "Nothing scheduled for this day."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
