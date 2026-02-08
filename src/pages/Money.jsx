import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Money() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recurringObligations, setRecurringObligations] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState('expense'); // 'income', 'expense', or 'subscription'
  
  // Income form state
  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: '',
    frequency: 'monthly',
    company: ''
  });
  const [editingIncome, setEditingIncome] = useState(null);
  const [selectedIncomeIds, setSelectedIncomeIds] = useState([]);
  const selectAllIncomeRef = useRef(null);
  
  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const selectAllExpenseRef = useRef(null);
  
  // Subscription form state
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    amount: '',
    billing_cycle: 'monthly',
    next_billing_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  const [editingSubscription, setEditingSubscription] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    expenseCategory: '',
    expenseDateRange: 'all', // 'this-month', 'last-month', 'all'
    incomeFrequency: ''
  });

  useEffect(() => {
    fetchMoneyData();
  }, []);

  // Deep-link support for ?action=add-expense
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add-expense') {
      setEntryType('expense');
      setEditingExpense(null);
      setEditingIncome(null);
      setEditingSubscription(null);
      setExpenseForm({ amount: '', category: '', description: '', note: '', date: new Date().toISOString().split('T')[0] });
      setShowAddModal(true);
      // Clean URL after opening modal
      navigate('/money', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setSelectedIncomeIds((prev) => prev.filter((id) => income.some((item) => item.id === id)));
  }, [income]);

  useEffect(() => {
    setSelectedExpenseIds((prev) => prev.filter((id) => expenses.some((item) => item.id === id)));
  }, [expenses]);

  const fetchMoneyData = async () => {
    try {
      // Fetch main data
      const response = await fetch('/api/money', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIncome(data.income || []);
        setExpenses(data.expenses || []);
        setSubscriptions(data.subscriptions || []);
        setTotalIncome(data.totalIncome || 0);
        setTotalExpenses(data.totalExpenses || 0);
      }
      
      // Fetch overview for recurring obligations calculation
      const overviewResponse = await fetch('/api/money/overview', {
        credentials: 'include'
      });
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setRecurringObligations(overviewData.recurringObligations || 0);
      }
    } catch (error) {
      console.error('Error fetching money data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Income handlers
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
        setEditingIncome(null);
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

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    if (!editingIncome) return;
    
    try {
      const response = await fetch(`/api/money/income/${editingIncome.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(incomeForm)
      });
      
      if (response.ok) {
        setIncomeForm({ source: '', amount: '', frequency: 'monthly', company: '' });
        setShowAddModal(false);
        setEditingIncome(null);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update income');
      }
    } catch (error) {
      console.error('Error updating income:', error);
      alert('Failed to update income');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!confirm('Are you sure you want to delete this income entry?')) return;
    
    try {
      const response = await fetch(`/api/money/income/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income');
    }
  };

  const handleToggleIncomeSelection = (id) => {
    setSelectedIncomeIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleToggleAllFilteredIncome = (filteredIds) => {
    if (filteredIds.length === 0) return;
    const allSelected = filteredIds.every((id) => selectedIncomeIds.includes(id));
    setSelectedIncomeIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }
      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };

  const handleBulkDeleteIncome = async () => {
    if (selectedIncomeIds.length === 0) return;
    const label = selectedIncomeIds.length === 1 ? 'income entry' : 'income entries';
    if (!confirm(`Are you sure you want to delete ${selectedIncomeIds.length} ${label}?`)) return;

    try {
      const response = await fetch('/api/money/income/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selectedIncomeIds })
      });

      if (response.ok) {
        setSelectedIncomeIds([]);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete income entries');
      }
    } catch (error) {
      console.error('Error bulk deleting income:', error);
      alert('Failed to delete income entries');
    }
  };

  const handleEditIncome = (incomeItem) => {
    setEditingIncome(incomeItem);
    setIncomeForm({
      source: incomeItem.source || '',
      amount: incomeItem.amount || '',
      frequency: incomeItem.frequency || 'monthly',
      company: incomeItem.company || ''
    });
    setEntryType('income');
    setShowAddModal(true);
  };

  // Expense handlers
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

  const handleToggleExpenseSelection = (id) => {
    setSelectedExpenseIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleToggleAllFilteredExpenses = (filteredIds) => {
    if (filteredIds.length === 0) return;
    const allSelected = filteredIds.every((id) => selectedExpenseIds.includes(id));
    setSelectedExpenseIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }
      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };

  const handleBulkDeleteExpenses = async () => {
    if (selectedExpenseIds.length === 0) return;
    const label = selectedExpenseIds.length === 1 ? 'expense' : 'expenses';
    if (!confirm(`Are you sure you want to delete ${selectedExpenseIds.length} ${label}?`)) return;

    try {
      const response = await fetch('/api/money/expenses/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selectedExpenseIds })
      });

      if (response.ok) {
        setSelectedExpenseIds([]);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete expenses');
      }
    } catch (error) {
      console.error('Error bulk deleting expenses:', error);
      alert('Failed to delete expenses');
    }
  };

  // Subscription handlers
  const handleAddSubscription = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/money/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscriptionForm)
      });
      
      if (response.ok) {
        setSubscriptionForm({ name: '', amount: '', billing_cycle: 'monthly', next_billing_date: new Date().toISOString().split('T')[0], status: 'active' });
        setShowAddModal(false);
        setEditingSubscription(null);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add subscription');
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Failed to add subscription');
    }
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!editingSubscription) return;
    
    try {
      const response = await fetch(`/api/money/subscriptions/${editingSubscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscriptionForm)
      });
      
      if (response.ok) {
        setSubscriptionForm({ name: '', amount: '', billing_cycle: 'monthly', next_billing_date: new Date().toISOString().split('T')[0], status: 'active' });
        setShowAddModal(false);
        setEditingSubscription(null);
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const response = await fetch(`/api/money/subscriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription');
    }
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setSubscriptionForm({
      name: subscription.name || '',
      amount: subscription.amount || '',
      billing_cycle: subscription.billing_cycle || 'monthly',
      next_billing_date: subscription.next_billing_date || new Date().toISOString().split('T')[0],
      status: subscription.status || 'active'
    });
    setEntryType('subscription');
    setShowAddModal(true);
  };

  const handleToggleSubscriptionStatus = async (subscription) => {
    const newStatus = subscription.status === 'active' ? 'paused' : 'active';
    try {
      const response = await fetch(`/api/money/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchMoneyData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update subscription status');
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      alert('Failed to update subscription status');
    }
  };

  // Filter functions
  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    
    // Category filter
    if (filters.expenseCategory) {
      filtered = filtered.filter(exp => exp.category === filters.expenseCategory);
    }
    
    // Date range filter
    if (filters.expenseDateRange !== 'all') {
      const now = new Date();
      let startDate, endDate;
      
      if (filters.expenseDateRange === 'this-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (filters.expenseDateRange === 'last-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      }
      
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.expense_date);
        return expDate >= startDate && expDate <= endDate;
      });
    }
    
    return filtered;
  };

  const getFilteredIncome = () => {
    let filtered = [...income];
    
    // Frequency filter
    if (filters.incomeFrequency) {
      filtered = filtered.filter(inc => inc.frequency === filters.incomeFrequency);
    }
    
    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBillingCycle = (cycle) => {
    const cycleMap = {
      'weekly': 'Weekly',
      'biweekly': 'Bi-weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly'
    };
    return cycleMap[cycle] || cycle;
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

  const filteredExpenses = getFilteredExpenses();
  const filteredIncome = getFilteredIncome();
  const filteredIncomeIds = filteredIncome.map((item) => item.id);
  const allFilteredIncomeSelected = filteredIncomeIds.length > 0 && filteredIncomeIds.every((id) => selectedIncomeIds.includes(id));
  const someFilteredIncomeSelected = filteredIncomeIds.some((id) => selectedIncomeIds.includes(id)) && !allFilteredIncomeSelected;
  const filteredExpenseIds = filteredExpenses.map((item) => item.id);
  const allFilteredExpensesSelected = filteredExpenseIds.length > 0 && filteredExpenseIds.every((id) => selectedExpenseIds.includes(id));
  const someFilteredExpensesSelected = filteredExpenseIds.some((id) => selectedExpenseIds.includes(id)) && !allFilteredExpensesSelected;
  const netBalance = totalIncome - totalExpenses;

  useEffect(() => {
    if (selectAllIncomeRef.current) {
      selectAllIncomeRef.current.indeterminate = someFilteredIncomeSelected;
    }
  }, [someFilteredIncomeSelected]);

  useEffect(() => {
    if (selectAllExpenseRef.current) {
      selectAllExpenseRef.current.indeterminate = someFilteredExpensesSelected;
    }
  }, [someFilteredExpensesSelected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-2">Money</h1>
          <p className="text-gray-600 dark:text-gray-400 italic">Track your income and expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Total Income</p>
            <p className="text-3xl font-light text-green-600 dark:text-green-400">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Total Expenses</p>
            <p className="text-3xl font-light text-red-600 dark:text-red-400">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Recurring Obligations</p>
            <p className="text-3xl font-light text-orange-600 dark:text-orange-400">${recurringObligations.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Net Balance</p>
            <p className={`text-3xl font-light ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Income and Expenses Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Income Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 font-medium">Income</h2>
              <div className="flex items-center gap-3">
                {/* Frequency Filter */}
                <select
                  value={filters.incomeFrequency}
                  onChange={(e) => setFilters({ ...filters, incomeFrequency: e.target.value })}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Frequencies</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
                <button
                  onClick={() => {
                    setEditingIncome(null);
                    setIncomeForm({ source: '', amount: '', frequency: 'monthly', company: '' });
                    setEntryType('income');
                    setShowAddModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Add Income"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            {filteredIncome.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <input
                    ref={selectAllIncomeRef}
                    type="checkbox"
                    checked={allFilteredIncomeSelected}
                    onChange={() => handleToggleAllFilteredIncome(filteredIncomeIds)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    aria-label="Select all income entries"
                  />
                  Select all
                </label>
                {selectedIncomeIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteIncome}
                    className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete selected income entries"
                  >
                    Delete Selected ({selectedIncomeIds.length})
                  </button>
                )}
              </div>
            )}
            {filteredIncome.length > 0 ? (
              <div className="space-y-2">
                {filteredIncome.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedIncomeIds.includes(item.id)
                        ? 'bg-orange-50 dark:bg-orange-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIncomeIds.includes(item.id)}
                      onChange={() => handleToggleIncomeSelection(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      aria-label={`Select income ${item.source || 'entry'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.source || 'Income'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.company && (
                          <>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.company}</p>
                            <span className="text-xs text-gray-400">•</span>
                          </>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">${parseFloat(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditIncome(item)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 transition-colors"
                          title="Edit income"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(item.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                          title="Delete income"
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
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No income entries {filters.incomeFrequency ? `with frequency "${filters.incomeFrequency}"` : 'yet'}</p>
            )}
          </div>

          {/* Expenses Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 font-medium">Expenses</h2>
              <div className="flex items-center gap-3">
                {/* Category Filter */}
                <select
                  value={filters.expenseCategory}
                  onChange={(e) => setFilters({ ...filters, expenseCategory: e.target.value })}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {/* Date Range Filter */}
                <select
                  value={filters.expenseDateRange}
                  onChange={(e) => setFilters({ ...filters, expenseDateRange: e.target.value })}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="all">All Time</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                </select>
                <button 
                  onClick={() => {
                    setEditingExpense(null);
                    setExpenseForm({ amount: '', category: '', description: '', note: '', date: new Date().toISOString().split('T')[0] });
                    setEntryType('expense');
                    setShowAddModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Add Expense"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            {filteredExpenses.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <input
                    ref={selectAllExpenseRef}
                    type="checkbox"
                    checked={allFilteredExpensesSelected}
                    onChange={() => handleToggleAllFilteredExpenses(filteredExpenseIds)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    aria-label="Select all expense entries"
                  />
                  Select all
                </label>
                {selectedExpenseIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteExpenses}
                    className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete selected expense entries"
                  >
                    Delete Selected ({selectedExpenseIds.length})
                  </button>
                )}
              </div>
            )}
            {filteredExpenses.length > 0 ? (
              <div className="space-y-2">
                {filteredExpenses.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedExpenseIds.includes(item.id)
                        ? 'bg-orange-50 dark:bg-orange-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedExpenseIds.includes(item.id)}
                      onChange={() => handleToggleExpenseSelection(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      aria-label={`Select expense ${item.description || 'entry'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description || 'Expense'}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.category || 'Uncategorized'}</p>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.expense_date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">${parseFloat(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditExpense(item)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title="Edit expense"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
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
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No expense entries {filters.expenseCategory || filters.expenseDateRange !== 'all' ? 'matching filters' : 'yet'}</p>
            )}
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 font-medium">Subscriptions</h2>
            <button
              onClick={() => {
                setEditingSubscription(null);
                setSubscriptionForm({ name: '', amount: '', billing_cycle: 'monthly', next_billing_date: new Date().toISOString().split('T')[0], status: 'active' });
                setEntryType('subscription');
                setShowAddModal(true);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Add Subscription"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {subscriptions.length > 0 ? (
            <div className="space-y-2">
              {subscriptions.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : item.status === 'paused'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatBillingCycle(item.billing_cycle)}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Next: {formatDate(item.next_billing_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">${parseFloat(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleSubscriptionStatus(item)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        title={item.status === 'active' ? 'Pause subscription' : 'Activate subscription'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {item.status === 'active' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </>
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditSubscription(item)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        title="Edit subscription"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(item.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                        title="Delete subscription"
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
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No subscriptions yet</p>
          )}
        </div>
      </div>

      {/* Add/Edit Entry Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAddModal(false);
            setEditingIncome(null);
            setEditingExpense(null);
            setEditingSubscription(null);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingIncome ? 'Edit Income' : 
                 editingExpense ? 'Edit Expense' : 
                 editingSubscription ? 'Edit Subscription' :
                 entryType === 'income' ? 'Add Income' : 
                 entryType === 'subscription' ? 'Add Subscription' : 
                 'Add Expense'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingIncome(null);
                  setEditingExpense(null);
                  setEditingSubscription(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Income Form */}
            {entryType === 'income' && (
              <form onSubmit={editingIncome ? handleUpdateIncome : handleAddIncome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                  <input
                    type="text"
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    placeholder="e.g., Salary, Freelance"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                  <select
                    value={incomeForm.frequency}
                    onChange={(e) => setIncomeForm({ ...incomeForm, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company (optional)</label>
                  <input
                    type="text"
                    value={incomeForm.company}
                    onChange={(e) => setIncomeForm({ ...incomeForm, company: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingIncome(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingIncome ? 'Update Income' : 'Add Income'}
                  </button>
                </div>
              </form>
            )}

            {/* Expense Form */}
            {entryType === 'expense' && (
              <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="What did you spend on?"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (optional)</label>
                  <textarea
                    value={expenseForm.note}
                    onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingExpense(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                  >
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            )}

            {/* Subscription Form */}
            {entryType === 'subscription' && (
              <form onSubmit={editingSubscription ? handleUpdateSubscription : handleAddSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={subscriptionForm.name}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })}
                    placeholder="e.g., Netflix, Spotify"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subscriptionForm.amount}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Billing Cycle</label>
                  <select
                    value={subscriptionForm.billing_cycle}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, billing_cycle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Next Billing Date</label>
                  <input
                    type="date"
                    value={subscriptionForm.next_billing_date}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, next_billing_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={subscriptionForm.status}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingSubscription(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
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
