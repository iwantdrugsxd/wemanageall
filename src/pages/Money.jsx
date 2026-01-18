import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Money() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState('expense'); // 'income' or 'expense'
  
  // Income form state
  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: '',
    frequency: 'monthly',
    company: ''
  });
  
  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  useEffect(() => {
    fetchMoneyData();
  }, []);

  const fetchMoneyData = async () => {
    try {
      const response = await fetch('/api/money');
      if (response.ok) {
      const data = await response.json();
        setIncome(data.income || []);
        setExpenses(data.expenses || []);
        setTotalIncome(data.totalIncome || 0);
        setTotalExpenses(data.totalExpenses || 0);
      }
    } catch (error) {
      console.error('Error fetching money data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/money/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(incomeForm)
      });
      
      if (response.ok) {
        setIncomeForm({ source: '', amount: '', frequency: 'monthly', company: '' });
        setShowAddModal(false);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add income');
      }
    } catch (error) {
      console.error('Error adding income:', error);
      alert('Failed to add income');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/money/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(expenseForm)
      });
      
      if (response.ok) {
        setExpenseForm({ amount: '', category: '', description: '', note: '', date: new Date().toISOString().split('T')[0] });
        setShowAddModal(false);
        setEditingExpense(null);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    
    try {
      const response = await fetch(`/api/money/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(expenseForm)
      });
      
      if (response.ok) {
        setExpenseForm({ amount: '', category: '', description: '', note: '', date: new Date().toISOString().split('T')[0] });
        setShowAddModal(false);
        setEditingExpense(null);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await fetch(`/api/money/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      note: expense.note || '',
      date: expense.expense_date || new Date().toISOString().split('T')[0]
    });
    setEntryType('expense');
    setShowAddModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const expenseCategories = [
    'Food & Dining',
    'Shopping',
    'Transport',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Subscriptions',
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">Money</h1>
          <p className="text-gray-600 italic">Track your income and expenses</p>
      </div>

      {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Total Income</p>
            <p className="text-3xl font-light text-green-600">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Total Expenses</p>
            <p className="text-3xl font-light text-red-600">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Net Balance</p>
            <p className={`text-3xl font-light ${(totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Income and Expenses Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-700 font-medium">Income</h2>
              <button
                onClick={() => {
                  setEntryType('income');
                  setShowAddModal(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Add Income"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {income.length > 0 ? (
              <div className="space-y-2">
                {income.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.source || 'Income'}</p>
                      {item.company && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.company}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-green-600">${parseFloat(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No income entries yet</p>
            )}
          </div>

          {/* Expenses Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-700 font-medium">Expenses</h2>
              <button 
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseForm({ amount: '', category: '', description: '', note: '', date: new Date().toISOString().split('T')[0] });
                  setEntryType('expense');
                  setShowAddModal(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Add Expense"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{item.description || 'Expense'}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{item.category || 'Uncategorized'}</p>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(item.expense_date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-red-600">${parseFloat(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditExpense(item)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Edit expense"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete expense"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No expense entries yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingExpense ? 'Edit Expense' : entryType === 'income' ? 'Add Income' : 'Add Expense'}
              </h3>
                    <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
                </button>
              </div>

            {entryType === 'income' ? (
              <form onSubmit={handleAddIncome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <input
                  type="text"
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    placeholder="e.g., Salary, Freelance"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                    autoFocus
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={incomeForm.frequency}
                    onChange={(e) => setIncomeForm({ ...incomeForm, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                  </select>
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company (optional)</label>
                <input
                    type="text"
                    value={incomeForm.company}
                    onChange={(e) => setIncomeForm({ ...incomeForm, company: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
                <div className="flex gap-3 pt-4">
                <button
                  type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Income
                  </button>
            </div>
            </form>
            ) : (
              <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="What did you spend on?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                  <textarea
                    value={expenseForm.note}
                    onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                    rows={3}
                />
              </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            )}
          </div>
          </div>
        )}
      </div>
  );
}


