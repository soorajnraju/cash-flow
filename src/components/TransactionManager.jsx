import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';

const TransactionManager = ({ 
  transactions, 
  setTransactions, 
  expenseCategories, 
  incomeCategories,
  currentYear 
}) => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    recurring: false
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleAddTransaction = () => {
    if (!newTransaction.date || !newTransaction.amount || !newTransaction.category) {
      alert('Please fill in all required fields');
      return;
    }

    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      date: new Date(newTransaction.date).toISOString()
    };

    setTransactions(prev => [...prev, transaction]);
    
    // Update category totals
    updateCategoryTotals(transaction);
    
    setNewTransaction({
      date: '',
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      recurring: false
    });
    setShowAddTransaction(false);
  };

  const updateCategoryTotals = (transaction) => {
    if (transaction.type === 'expense') {
      // Update expense category spent amount
      // This would be handled by the parent component
    } else {
      // Update income category actual amount
      // This would be handled by the parent component
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({ ...transaction });
    setShowAddTransaction(true);
  };

  const handleUpdateTransaction = () => {
    setTransactions(prev => prev.map(t => 
      t.id === editingTransaction.id 
        ? { ...newTransaction, amount: parseFloat(newTransaction.amount) }
        : t
    ));
    setEditingTransaction(null);
    setShowAddTransaction(false);
    setNewTransaction({
      date: '',
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      recurring: false
    });
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesCategory = !filterCategory || transaction.category === filterCategory;
      const matchesType = !filterType || transaction.type === filterType;
      const matchesYear = new Date(transaction.date).getFullYear() === currentYear;
      return matchesCategory && matchesType && matchesYear;
    });
  };

  const getAllCategories = () => {
    const categories = new Set();
    expenseCategories.forEach(cat => categories.add(cat.name));
    incomeCategories.forEach(cat => categories.add(cat.name));
    return Array.from(categories);
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="transaction-manager">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Transactions ({currentYear})</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddTransaction(!showAddTransaction)}
        >
          <FaPlus /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <select 
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {getAllCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <button 
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setFilterType('');
              setFilterCategory('');
            }}
          >
            <FaFilter /> Clear Filters
          </button>
        </div>
      </div>

      {/* Add/Edit Transaction Form */}
      {showAddTransaction && (
        <div className="card mb-3">
          <div className="card-header">
            <h5>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newTransaction.date.split('T')[0]}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value, category: '' }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {(newTransaction.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Action</label>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                  >
                    {editingTransaction ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-8">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="col-md-4">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={newTransaction.recurring}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, recurring: e.target.checked }))}
                  />
                  <label className="form-check-label">
                    Recurring Transaction
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${transaction.type === 'income' ? 'success' : 'danger'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.category}</td>
                    <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td>{transaction.description}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="mt-3">
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Total Income</h6>
                  <h5 className="text-success">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Total Expenses</h6>
                  <h5 className="text-danger">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Net Balance</h6>
                  <h5 className={
                    filteredTransactions.reduce((sum, t) => 
                      sum + (t.type === 'income' ? t.amount : -t.amount), 0) >= 0 
                        ? 'text-success' : 'text-danger'
                  }>
                    {formatCurrency(
                      filteredTransactions.reduce((sum, t) => 
                        sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                    )}
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
