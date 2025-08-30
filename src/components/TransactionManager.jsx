import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { useAlert, ValidatedField, ValidationErrors } from './AlertSystem';
import { validateTransaction, safeParseFloat } from '../utils/validation';
import { ValidatedDatePicker, DatePresets } from './DatePickerComponent';

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
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError, showWarning } = useAlert();
  
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    recurring: false
  });

  const formatCurrency = (amount) => {
    const safeAmount = safeParseFloat(amount, 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(safeAmount);
  };

  const handleAddTransaction = async () => {
    setIsSubmitting(true);
    setValidationErrors({});

    // Validate the transaction
    const validation = validateTransaction(newTransaction);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showError('Please fix the validation errors below');
      setIsSubmitting(false);
      return;
    }

    try {
      const transaction = {
        id: Date.now(),
        ...newTransaction,
        amount: safeParseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toISOString(),
        description: newTransaction.description.trim()
      };

      setTransactions(prev => [...prev, transaction]);
      
      // Update category totals
      updateCategoryTotals(transaction);
      
      // Reset form
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        recurring: false
      });
      
      setShowAddTransaction(false);
      showSuccess(`Transaction added successfully: ${formatCurrency(transaction.amount)}`);
    } catch (error) {
      showError('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    setNewTransaction({ 
      ...transaction,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setValidationErrors({});
    setShowAddTransaction(true);
  };

  const handleUpdateTransaction = async () => {
    setIsSubmitting(true);
    setValidationErrors({});

    // Validate the transaction
    const validation = validateTransaction(newTransaction);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showError('Please fix the validation errors below');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedTransaction = {
        ...editingTransaction,
        ...newTransaction,
        amount: safeParseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toISOString(),
        description: newTransaction.description.trim()
      };

      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id ? updatedTransaction : t
      ));
      
      setEditingTransaction(null);
      setShowAddTransaction(false);
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        recurring: false
      });
      
      showSuccess(`Transaction updated successfully: ${formatCurrency(updatedTransaction.amount)}`);
    } catch (error) {
      showError('Failed to update transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = (id) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
      showError('Transaction not found');
      return;
    }

    if (window.confirm(`Are you sure you want to delete this transaction: ${transaction.description}?`)) {
      try {
        setTransactions(prev => prev.filter(t => t.id !== id));
        showSuccess('Transaction deleted successfully');
      } catch (error) {
        showError('Failed to delete transaction. Please try again.');
      }
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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">Transactions ({currentYear})</h4>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddTransaction(!showAddTransaction)}
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-2">
        <div className="col-md-3 col-sm-6 mb-2">
          <select 
            className="form-select form-select-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="col-md-3 col-sm-6 mb-2">
          <select 
            className="form-select form-select-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {getAllCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 col-sm-6 mb-2">
          <button 
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={() => {
              setFilterType('');
              setFilterCategory('');
            }}
          >
            <FaFilter /> Clear
          </button>
        </div>
      </div>

      {/* Add/Edit Transaction Form */}
      {showAddTransaction && (
        <div className="card mb-2">
          <div className="card-header py-2">
            <h6 className="mb-0">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h6>
          </div>
          <div className={`card-body py-2 ${isSubmitting ? 'form-loading' : ''}`}>
            <div className="row g-2">
              <div className="col-md-2 col-sm-6">
                <ValidatedDatePicker
                  label="Date"
                  value={newTransaction.date}
                  onChange={(date) => setNewTransaction(prev => ({ ...prev, date }))}
                  validation={{
                    required: true,
                    maxToday: true,
                    minYear: 2020
                  }}
                  disabled={isSubmitting}
                  size="sm"
                />
              </div>
              <div className="col-md-2 col-sm-6">
                <ValidatedField 
                  label="Type" 
                  errors={validationErrors} 
                  field="type" 
                  required
                  size="sm"
                >
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value, category: '' }))}
                    disabled={isSubmitting}
                    className="form-select form-select-sm"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </ValidatedField>
              </div>
              <div className="col-md-2 col-sm-6">
                <ValidatedField 
                  label="Category" 
                  errors={validationErrors} 
                  field="category" 
                  required
                  size="sm"
                >
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                    disabled={isSubmitting}
                    className="form-select form-select-sm"
                  >
                    <option value="">Category</option>
                    {(newTransaction.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </ValidatedField>
              </div>
              <div className="col-md-2 col-sm-6">
                <ValidatedField 
                  label="Amount" 
                  errors={validationErrors} 
                  field="amount" 
                  required
                  size="sm"
                >
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999999"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="0.00"
                    className="form-control form-control-sm"
                  />
                </ValidatedField>
              </div>
              <div className="col-md-4 col-sm-12">
                <ValidatedField 
                  label="Description" 
                  errors={validationErrors} 
                  field="description" 
                  required
                  size="sm"
                >
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="Description"
                    maxLength="100"
                    className="form-control form-control-sm"
                  />
                </ValidatedField>
              </div>
            </div>
            <div className="row g-2 mt-1">
              <div className="col-md-6 col-sm-6 d-flex align-items-center">
                <div className="recurring-toggle">
                  <input 
                    type="checkbox" 
                    id="recurringCheck" 
                    className="toggle-checkbox" 
                    checked={newTransaction.recurring}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, recurring: e.target.checked }))}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="recurringCheck" className="toggle-label">
                    <span className="toggle-text">Monthly Recurring</span>
                  </label>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 d-flex align-items-center justify-content-end">
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm me-2"
                  onClick={() => {
                    setShowAddTransaction(false);
                    setEditingTransaction(null);
                    setValidationErrors({});
                    setNewTransaction({
                      date: new Date().toISOString().split('T')[0],
                      type: 'expense',
                      category: '',
                      amount: '',
                      description: '',
                      recurring: false
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : (editingTransaction ? 'Update' : 'Add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th width="100">Actions</th>
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
                    <td className="text-nowrap">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-sm bg-${transaction.type === 'income' ? 'success' : 'danger'}`}>
                        {transaction.type === 'income' ? 'Inc' : 'Exp'}
                      </span>
                    </td>
                    <td className="text-truncate" style={{maxWidth: '120px'}} title={transaction.category}>
                      {transaction.category}
                    </td>
                    <td className={`text-nowrap ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="text-truncate" style={{maxWidth: '200px'}} title={transaction.description}>
                      {transaction.description}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEditTransaction(transaction)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="mt-2">
          <div className="row g-2">
            <div className="col-md-4 col-sm-6">
              <div className="card card-sm">
                <div className="card-body text-center py-2">
                  <h6 className="card-title mb-1 small">Total Income</h6>
                  <h6 className="text-success mb-0">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + safeParseFloat(t.amount), 0)
                    )}
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6">
              <div className="card card-sm">
                <div className="card-body text-center py-2">
                  <h6 className="card-title mb-1 small">Total Expenses</h6>
                  <h6 className="text-danger mb-0">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + safeParseFloat(t.amount), 0)
                    )}
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12">
              <div className="card card-sm">
                <div className="card-body text-center py-2">
                  <h6 className="card-title mb-1 small">Net Balance</h6>
                  <h6 className={`mb-0 ${
                    filteredTransactions.reduce((sum, t) => 
                      sum + (t.type === 'income' ? safeParseFloat(t.amount) : -safeParseFloat(t.amount)), 0) >= 0 
                        ? 'text-success' : 'text-danger'
                  }`}>
                    {formatCurrency(
                      filteredTransactions.reduce((sum, t) => 
                        sum + (t.type === 'income' ? safeParseFloat(t.amount) : -safeParseFloat(t.amount)), 0)
                    )}
                  </h6>
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
