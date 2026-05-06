'use client'

import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import {
  FoodIcon, TransportIcon, ShoppingIcon, BillsIcon,
  EntertainmentIcon, EducationIcon, HealthIcon, OtherIcon
} from '@/components/CategoryIcons';

const CATEGORY_CONFIG = {
  Food:          { Icon: FoodIcon,          color: '#FFF1E6' },
  Transport:     { Icon: TransportIcon,     color: '#FFF1E6' },
  Shopping:      { Icon: ShoppingIcon,      color: '#FFF1E6' },
  Bills:         { Icon: BillsIcon,         color: '#FFF1E6' },
  Entertainment: { Icon: EntertainmentIcon, color: '#FFF1E6' },
  Education:     { Icon: EducationIcon,     color: '#FFF1E6' },
  Health:        { Icon: HealthIcon,        color: '#FFF1E6' },
  Other:         { Icon: OtherIcon,         color: '#FFF1E6' },
};

// --- HELPER FUNCTIONS ---
const formatRupiah = (amount) => {
  const num = parseFloat(amount);
  if (!amount && amount !== 0) return 'Rp 0';
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
};

const formatMonthYear = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const getDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return d.toLocaleDateString('en-US', { 
    weekday:'long', day:'numeric', month:'short' 
  });
};

export default function ExpensesPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const { showToast } = useToast();
  const monthInputRef = useRef(null);

  // New expense state
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Cash');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // --- FETCH FUNCTIONS ---
  const fetchExpenses = async () => {
    const month = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();
    const res = await fetch(`/api/expenses?month=${month}&year=${year}`);
    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
  };

  const fetchBudget = async () => {
    const month = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();
    const res = await fetch(`/api/budget?month=${month}&year=${year}`);
    const data = await res.json();
    setBudget(data);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchExpenses(), fetchBudget()]);
      setIsLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  // --- DERIVED VALUES ---
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetAmount = budget?.amount || 0;
  const budgetLeft = budgetAmount - totalSpent;
  const budgetPct = budgetAmount > 0 ? Math.min((totalSpent / budgetAmount) * 100, 100) : 0;

  const budgetColor = budgetPct > 90 ? '#DC2626'
    : budgetPct > 75 ? '#F59E0B' : '#E8520A';

  const categoryTotals = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const groupedByDate = expenses.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(b) - new Date(a)
  );

  // --- HANDLERS ---
  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  };

  const handleThisMonth = () => {
    setSelectedMonth(new Date());
  };

  const addExpense = async (expenseData) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    if (res.ok) {
      await fetchExpenses();
      setIsModalOpen(false);
      // Reset form
      setNewAmount('');
      setNewCategory('');
      setNewNote('');
      setNewPaymentMethod('Cash');
      setNewDate(new Date().toISOString().split('T')[0]);
      showToast('Expense saved successfully');
    }
  };

  const deleteExpense = async (id) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    await fetchExpenses();
  };

  const handleAddExpense = () => {
    const amountNum = parseFloat(newAmount);
    if (amountNum > 0 && newCategory) {
      addExpense({
        amount: amountNum,
        category: newCategory,
        note: newNote,
        date: newDate,
        paymentMethod: newPaymentMethod,
      });
    }
  };

  const saveBudget = async () => {
    const amount = parseFloat(budgetInput);
    if (!amount || amount <= 0) return;
    const month = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();
    const res = await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, month, year }),
    });
    if (res.ok) {
      const saved = await res.json();
      setBudget(saved);
      setIsBudgetModalOpen(false);
      setBudgetInput('');
      showToast('Budget saved successfully');
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full bg-background relative animate-slide-down ${isModalOpen || isBudgetModalOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      <div className="px-6 py-8 md:py-10 max-w-5xl mx-auto w-full">
      {/* Header row */}
      <div className="flex justify-end items-center mb-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#E8520A] hover:bg-[#C94308] text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center w-full mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrevMonth}
            className="border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div 
            onClick={() => monthInputRef.current?.showPicker()}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg border min-w-[220px] justify-center cursor-pointer select-none transition-all duration-300 ease-in-out border-[#E8520A] bg-white text-[#E8520A]"
          >
            <CalendarDays className="w-4 h-4 text-[#E8520A]" />
            <span className="text-sm font-medium">{formatMonthYear(selectedMonth)}</span>
            <input
              type="month"
              ref={monthInputRef}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month] = e.target.value.split('-');
                  setSelectedMonth(new Date(year, month - 1, 1));
                }
              }}
            />
          </div>

          <button 
            onClick={handleNextMonth}
            className="border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleThisMonth}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()
                ? 'bg-[#E8520A] text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="animate-pulse">
          {/* 3 summary cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-2.5 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
          {/* Budget bar skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-3 bg-gray-100 rounded-full w-full" />
          </div>
          {/* Transaction rows skeleton */}
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards Row (3 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900">{formatRupiah(totalSpent)}</div>
              <div className="text-xs text-gray-400 mt-1">{expenses.length} transactions</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Budget Left</div>
              <div className={`text-2xl font-bold ${budget ? (budgetLeft > 0 ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`}>
                {budget ? formatRupiah(budgetLeft) : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {budget ? `of ${formatRupiah(budget.amount)}` : 'No budget set'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Top Category</div>
              <div className="text-2xl font-bold text-gray-900">
                {categoryTotals.length > 0 ? (() => {
                  const category = categoryTotals[0][0];
                  const { Icon } = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
                  return (
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF1E6' }}>
                        <Icon size={28} />
                      </div>
                      <span>{category}</span>
                    </span>
                  );
                })() : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatRupiah(categoryTotals[0]?.[1] || 0)}
              </div>
            </div>
          </div>

          {/* Budget Progress Bar / No Budget */}
          {budget === null ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Monthly Budget</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No budget set for {formatMonthYear(selectedMonth)}
                  </p>
                </div>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="bg-[#E8520A] text-white px-4 py-2 rounded-lg text-sm"
                >
                  Set Budget
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Budget</span>
                  <button
                    onClick={() => { setBudgetInput(budget.amount.toString()); setIsBudgetModalOpen(true); }}
                    className="text-xs text-gray-400 hover:text-[#E8520A] transition-colors border border-gray-200 hover:border-[#E8520A] rounded px-2 py-0.5"
                  >
                    Edit
                  </button>
                </div>
                <span className="text-sm text-gray-500">{formatRupiah(totalSpent)} / {formatRupiah(budget.amount)}</span>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${budgetPct}%`, background: budgetColor }} 
                />
              </div>
              <div className="mt-2 text-xs">
                {budgetPct > 90 ? (
                  <span className="text-red-500">⚠ Over budget limit!</span>
                ) : budgetPct > 75 ? (
                  <span className="text-yellow-500">Getting close to budget limit</span>
                ) : (
                  <span className="text-gray-400">{budgetPct.toFixed(0)}% of budget used</span>
                )}
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* LEFT COLUMN */}
            <div className="flex-1 w-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
              {sortedDates.map((dateStr, index) => (
                <div key={dateStr}>
                  <div className={`text-sm font-medium text-gray-500 mb-2 ${index > 0 ? 'mt-4' : 'mt-0'}`}>
                    {getDateLabel(dateStr)}
                  </div>
                  {groupedByDate[dateStr].map(expense => (
                    <div 
                      key={expense.id} 
                      className="group bg-white rounded-xl border border-gray-200 p-4 mb-2 flex items-center gap-4 hover:border-[#E8520A] transition-colors cursor-default"
                    >
                      {(() => {
                        const { Icon } = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['Other'];
                        return (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF1E6' }}>
                            <Icon size={28} />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{expense.category}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{expense.note || '—'}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-semibold text-gray-900">{formatRupiah(expense.amount)}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{expense.paymentMethod}</div>
                      </div>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              {sortedDates.length === 0 && (
                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  No transactions this month.
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full md:w-64 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">By Category</h2>
              {categoryTotals.map(([category, total]) => {
                const { Icon } = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
                return (
                <div key={category} className="mb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF1E6' }}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">{category}</div>
                    <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          width: `${totalSpent > 0 ? (total / totalSpent) * 100 : 0}%`, 
                          background: '#D74C0B'
                        }} 
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {formatRupiah(total)}
                  </div>
                </div>
                );
              })}
              {categoryTotals.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No data.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ADD EXPENSE MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-lg text-gray-900">Add Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Amount input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#E8520A] focus-within:border-transparent transition-all">
                  <div className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r border-gray-200">
                    Rp
                  </div>
                  <input 
                    type="number" 
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none text-sm w-full"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 2. Category selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(CATEGORY_CONFIG).map(cat => {
                    const { Icon } = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Other'];
                    return (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        newCategory === cat 
                          ? 'bg-[#FDF0EA] border-[#E8520A] border-2 text-[#E8520A]' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF1E6' }}>
                        <Icon size={28} />
                      </div>
                      <span className="text-[10px] font-medium truncate w-full text-center">{cat}</span>
                    </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Note input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <input 
                  type="text" 
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-[#E8520A] focus:border-transparent transition-all"
                  placeholder="What did you spend on?"
                />
              </div>

              {/* 4. Payment Method selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                <div className="flex flex-wrap gap-2">
                  {['Cash', 'Debit', 'Transfer'].map(method => (
                    <button
                      key={method}
                      onClick={() => setNewPaymentMethod(method)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        newPaymentMethod === method
                          ? 'bg-[#E8520A] text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Date input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input 
                  type="date" 
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-[#E8520A] focus:border-transparent transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddExpense}
                  disabled={!newAmount || !newCategory}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !newAmount || !newCategory 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#E8520A] text-white hover:bg-[#C94308]'
                  }`}
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUDGET MODAL */}
      {isBudgetModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => { setIsBudgetModalOpen(false); setBudgetInput(''); }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-gray-900">
                {budget ? 'Edit Budget' : 'Set Monthly Budget'}
              </h3>
              <button 
                onClick={() => { setIsBudgetModalOpen(false); setBudgetInput(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              Set your spending limit for {formatMonthYear(selectedMonth)}
            </p>

            <div className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Amount</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#E8520A] focus-within:border-transparent transition-all">
                  <div className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r border-gray-200">
                    Rp
                  </div>
                  <input 
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none text-sm"
                    placeholder="1000000"
                  />
                </div>
              </div>

              {/* Quick select pills */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: '500.000', value: '500000' },
                  { label: '1.000.000', value: '1000000' },
                  { label: '1.500.000', value: '1500000' },
                  { label: '2.000.000', value: '2000000' },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setBudgetInput(value)}
                    className={`border rounded-full px-3 py-1 text-xs transition-colors ${
                      budgetInput === value
                        ? 'border-[#E8520A] text-[#E8520A] bg-[#FDF0EA]'
                        : 'border-gray-200 text-gray-600 hover:border-[#E8520A] hover:text-[#E8520A]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { setIsBudgetModalOpen(false); setBudgetInput(''); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBudget}
                  disabled={!budgetInput || parseFloat(budgetInput) <= 0}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !budgetInput || parseFloat(budgetInput) <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#E8520A] text-white hover:bg-[#C94308]'
                  }`}
                >
                  Save Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
