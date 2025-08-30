import React from 'react';

const EXPENSE_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Utilities',
  'Insurance',
  'Savings & Investments',
  'Debt Payments',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental',
  'Other'
];

const CategoryManager = ({ 
  expenseCategories, 
  setExpenseCategories,
  incomeCategories,
  setIncomeCategories 
}) => {
  const addExpenseCategory = (category) => {
    if (!expenseCategories.find(cat => cat.name === category)) {
      setExpenseCategories([...expenseCategories, { name: category, budgeted: 0, spent: 0 }]);
    }
  };

  const addIncomeCategory = (category) => {
    if (!incomeCategories.find(cat => cat.name === category)) {
      setIncomeCategories([...incomeCategories, { name: category, budgeted: 0, actual: 0 }]);
    }
  };

  const updateExpenseBudget = (categoryName, budget) => {
    setExpenseCategories(prev => prev.map(cat => 
      cat.name === categoryName ? { ...cat, budgeted: parseFloat(budget) || 0 } : cat
    ));
  };

  const updateIncomeBudget = (categoryName, budget) => {
    setIncomeCategories(prev => prev.map(cat => 
      cat.name === categoryName ? { ...cat, budgeted: parseFloat(budget) || 0 } : cat
    ));
  };

  const removeExpenseCategory = (categoryName) => {
    setExpenseCategories(prev => prev.filter(cat => cat.name !== categoryName));
  };

  const removeIncomeCategory = (categoryName) => {
    setIncomeCategories(prev => prev.filter(cat => cat.name !== categoryName));
  };

  return (
    <div className="category-manager">
      <h3>Budget Categories</h3>
      
      {/* Income Categories */}
      <div className="mb-4">
        <h5>Income Categories</h5>
        <div className="mb-3">
          <select 
            className="form-select mb-2" 
            onChange={(e) => e.target.value && addIncomeCategory(e.target.value)}
            value=""
          >
            <option value="">Add Income Category...</option>
            {INCOME_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budgeted</th>
                <th>Actual</th>
                <th>Variance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomeCategories.map((category, index) => (
                <tr key={index}>
                  <td>{category.name}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={category.budgeted}
                      onChange={(e) => updateIncomeBudget(category.name, e.target.value)}
                    />
                  </td>
                  <td>${category.actual.toFixed(2)}</td>
                  <td className={category.actual >= category.budgeted ? 'text-success' : 'text-warning'}>
                    ${(category.actual - category.budgeted).toFixed(2)}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => removeIncomeCategory(category.name)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="mb-4">
        <h5>Expense Categories</h5>
        <div className="mb-3">
          <select 
            className="form-select mb-2" 
            onChange={(e) => e.target.value && addExpenseCategory(e.target.value)}
            value=""
          >
            <option value="">Add Expense Category...</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budgeted</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories.map((category, index) => (
                <tr key={index}>
                  <td>{category.name}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={category.budgeted}
                      onChange={(e) => updateExpenseBudget(category.name, e.target.value)}
                    />
                  </td>
                  <td>${category.spent.toFixed(2)}</td>
                  <td className={category.budgeted - category.spent >= 0 ? 'text-success' : 'text-danger'}>
                    ${(category.budgeted - category.spent).toFixed(2)}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => removeExpenseCategory(category.name)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
