import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPlay, FaPause } from 'react-icons/fa';

const RecurringTransactionManager = ({ 
  recurringTransactions, 
  setRecurringTransactions,
  expenseCategories,
  incomeCategories,
  onGenerateTransactions 
}) => {
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [newRecurring, setNewRecurring] = useState({
    name: '',
    type: 'income',
    category: '',
    amount: '',
    frequency: 'monthly',
    startDate: '',
    isActive: true,
    description: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleAddRecurring = () => {
    if (!newRecurring.name || !newRecurring.amount || !newRecurring.category) {
      alert('Please fill in all required fields');
      return;
    }

    const recurring = {
      id: Date.now(),
      ...newRecurring,
      amount: parseFloat(newRecurring.amount),
      createdAt: new Date().toISOString()
    };

    setRecurringTransactions(prev => [...prev, recurring]);
    
    setNewRecurring({
      name: '',
      type: 'income',
      category: '',
      amount: '',
      frequency: 'monthly',
      startDate: '',
      isActive: true,
      description: ''
    });
    setShowAddRecurring(false);
  };

  const handleEditRecurring = (recurring) => {
    setEditingRecurring(recurring);
    setNewRecurring({ ...recurring });
    setShowAddRecurring(true);
  };

  const handleUpdateRecurring = () => {
    setRecurringTransactions(prev => prev.map(r => 
      r.id === editingRecurring.id 
        ? { ...newRecurring, amount: parseFloat(newRecurring.amount) }
        : r
    ));
    setEditingRecurring(null);
    setShowAddRecurring(false);
    setNewRecurring({
      name: '',
      type: 'income',
      category: '',
      amount: '',
      frequency: 'monthly',
      startDate: '',
      isActive: true,
      description: ''
    });
  };

  const handleDeleteRecurring = (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleRecurringStatus = (id) => {
    setRecurringTransactions(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const generateRecurringTransactions = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const generatedTransactions = [];
    
    recurringTransactions.filter(r => r.isActive).forEach(recurring => {
      // Generate transaction for current month
      const transactionDate = new Date(currentYear, currentMonth, 1);
      
      const transaction = {
        id: Date.now() + Math.random(),
        date: transactionDate.toISOString(),
        type: recurring.type,
        category: recurring.category,
        amount: recurring.amount,
        description: `${recurring.name} (Recurring)`,
        recurring: true,
        recurringId: recurring.id
      };
      
      generatedTransactions.push(transaction);
    });
    
    if (generatedTransactions.length > 0) {
      onGenerateTransactions(generatedTransactions);
      alert(`Generated ${generatedTransactions.length} recurring transactions for this month!`);
    }
  };

  return (
    <div className="recurring-transaction-manager">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Recurring Transactions</h3>
        <div>
          <button 
            className="btn btn-success me-2"
            onClick={generateRecurringTransactions}
            disabled={recurringTransactions.filter(r => r.isActive).length === 0}
          >
            <FaPlay /> Generate This Month
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddRecurring(!showAddRecurring)}
          >
            <FaPlus /> Add Recurring
          </button>
        </div>
      </div>

      {/* Add/Edit Recurring Transaction Form */}
      {showAddRecurring && (
        <div className="card mb-3">
          <div className="card-header">
            <h5>{editingRecurring ? 'Edit Recurring Transaction' : 'Add New Recurring Transaction'}</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newRecurring.name}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Salary, Rent, EMI"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newRecurring.type}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, type: e.target.value, category: '' }))}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newRecurring.category}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {(newRecurring.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
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
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="col-md-1">
                <label className="form-label">Action</label>
                <div className="d-grid">
                  <button 
                    className="btn btn-success"
                    onClick={editingRecurring ? handleUpdateRecurring : handleAddRecurring}
                  >
                    {editingRecurring ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-3">
                <label className="form-label">Frequency</label>
                <select
                  className="form-select"
                  value={newRecurring.frequency}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newRecurring.startDate}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={newRecurring.description}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Transactions Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recurringTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No recurring transactions found. Add your salary, EMIs, and other recurring transactions.
                </td>
              </tr>
            ) : (
              recurringTransactions.map((recurring) => (
                <tr key={recurring.id}>
                  <td><strong>{recurring.name}</strong></td>
                  <td>
                    <span className={`badge bg-${recurring.type === 'income' ? 'success' : 'danger'}`}>
                      {recurring.type}
                    </span>
                  </td>
                  <td>{recurring.category}</td>
                  <td className={recurring.type === 'income' ? 'text-success' : 'text-danger'}>
                    {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {recurring.frequency}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${recurring.isActive ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggleRecurringStatus(recurring.id)}
                    >
                      {recurring.isActive ? <FaPlay /> : <FaPause />}
                      {recurring.isActive ? ' Active' : ' Paused'}
                    </button>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleEditRecurring(recurring)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteRecurring(recurring.id)}
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

      {recurringTransactions.length > 0 && (
        <div className="mt-3">
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Monthly Income</h6>
                  <h5 className="text-success">
                    {formatCurrency(
                      recurringTransactions
                        .filter(r => r.type === 'income' && r.isActive && r.frequency === 'monthly')
                        .reduce((sum, r) => sum + r.amount, 0)
                    )}
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Monthly Expenses</h6>
                  <h5 className="text-danger">
                    {formatCurrency(
                      recurringTransactions
                        .filter(r => r.type === 'expense' && r.isActive && r.frequency === 'monthly')
                        .reduce((sum, r) => sum + r.amount, 0)
                    )}
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Net Monthly</h6>
                  <h5 className={
                    (recurringTransactions
                      .filter(r => r.isActive && r.frequency === 'monthly')
                      .reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0)) >= 0 
                        ? 'text-success' : 'text-danger'
                  }>
                    {formatCurrency(
                      recurringTransactions
                        .filter(r => r.isActive && r.frequency === 'monthly')
                        .reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0)
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

export default RecurringTransactionManager;
