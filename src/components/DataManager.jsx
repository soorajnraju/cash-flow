import React, { useState } from 'react';
import { FaDownload, FaUpload, FaFileExport, FaFileImport } from 'react-icons/fa';

const DataManager = ({ 
  data, 
  onImport, 
  onReset,
  appVersion = "3.0.0" 
}) => {
  const [importFile, setImportFile] = useState(null);

  const handleExportJSON = () => {
    const exportData = {
      version: appVersion,
      exportDate: new Date().toISOString(),
      ...data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const { transactions } = data;
    
    // CSV Headers
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    
    // Convert transactions to CSV format
    const csvData = transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.type,
      transaction.category,
      transaction.amount,
      transaction.description || ''
    ]);
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate the imported data structure
        if (validateImportData(importData)) {
          onImport(importData);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format. Please select a valid cash flow backup file.');
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        // Skip header row and parse data
        const transactions = lines.slice(1)
          .filter(line => line.trim()) // Remove empty lines
          .map((line, index) => {
            const values = line.split(',').map(v => v.replace(/"/g, ''));
            
            return {
              id: Date.now() + index,
              date: new Date(values[0]).toISOString(),
              type: values[1],
              category: values[2],
              amount: parseFloat(values[3]) || 0,
              description: values[4] || '',
              recurring: false
            };
          })
          .filter(t => t.amount > 0); // Only include valid transactions

        if (transactions.length > 0) {
          // Create import data structure
          const importData = {
            ...data,
            transactions: [...data.transactions, ...transactions]
          };
          
          onImport(importData);
          alert(`Successfully imported ${transactions.length} transactions!`);
        } else {
          alert('No valid transactions found in the CSV file.');
        }
      } catch (error) {
        alert('Error reading CSV file. Please make sure it\'s properly formatted.');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  };

  const validateImportData = (importData) => {
    // Check if the imported data has the required structure
    const requiredFields = ['transactions', 'expenseCategories', 'incomeCategories', 'currentYear'];
    
    return requiredFields.every(field => field in importData) &&
           Array.isArray(importData.transactions) &&
           Array.isArray(importData.expenseCategories) &&
           Array.isArray(importData.incomeCategories);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      onReset();
      alert('All data has been reset successfully.');
    }
  };

  const getDataSummary = () => {
    const { transactions, expenseCategories, incomeCategories } = data;
    
    return {
      totalTransactions: transactions.length,
      expenseCategories: expenseCategories.length,
      incomeCategories: incomeCategories.length,
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    };
  };

  const summary = getDataSummary();

  return (
    <div className="data-manager">
      <h3>Data Management</h3>
      
      {/* Data Summary */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Data Summary</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h4 className="text-primary">{summary.totalTransactions}</h4>
                  <p className="text-muted">Total Transactions</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-success">{summary.expenseCategories}</h4>
                  <p className="text-muted">Expense Categories</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-info">{summary.incomeCategories}</h4>
                  <p className="text-muted">Income Categories</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-warning">
                    ${(summary.totalIncome - summary.totalExpenses).toFixed(2)}
                  </h4>
                  <p className="text-muted">Net Balance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5><FaFileExport /> Export Data</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Export your financial data for backup or analysis in other applications.
              </p>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={handleExportJSON}
                >
                  <FaDownload /> Export Complete Backup (JSON)
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleExportCSV}
                >
                  <FaDownload /> Export Transactions (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5><FaFileImport /> Import Data</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Import data from backup files or add transactions from CSV files.
              </p>
              <div className="mb-3">
                <label className="form-label">Import Complete Backup (JSON)</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".json"
                  onChange={handleImportJSON}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Import Transactions (CSV)</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".csv"
                  onChange={handleImportCSV}
                />
              </div>
              <small className="text-muted">
                CSV format: Date, Type, Category, Amount, Description
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-danger">
            <div className="card-header bg-danger text-white">
              <h5>Danger Zone</h5>
            </div>
            <div className="card-body">
              <p className="text-danger">
                <strong>Warning:</strong> This action will permanently delete all your financial data 
                including transactions, categories, and settings. This cannot be undone.
              </p>
              <button 
                className="btn btn-danger"
                onClick={handleReset}
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
