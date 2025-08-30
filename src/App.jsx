import { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSun, FaMoon, FaTrashAlt, FaChartLine, FaTable, FaCog, FaHome, FaCalendarAlt, FaBrain } from "react-icons/fa";
import "./App.css";

// Import new components
import Dashboard from "./components/Dashboard";
import CategoryManager from "./components/CategoryManager";
import TransactionManager from "./components/TransactionManager";
import AdvancedCharts from "./components/AdvancedCharts";
import DataManager from "./components/DataManager";
import RecurringTransactionManager from "./components/RecurringTransactionManager";
import AIAnalysisComponent from "./components/AIAnalysisComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  // Initial state structure
  const initialMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ].map((month) => ({
    month,
    variableIncome: 0,
    variableExpenses: 0,
    comments: "",
  }));

  const getStoredData = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  // Enhanced state management
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [theme, setTheme] = useState(getStoredData("theme", "light"));
  
  // Financial data state
  const [fixedIncome, setFixedIncome] = useState(getStoredData("fixedIncome", 0));
  const [fixedExpenses, setFixedExpenses] = useState(getStoredData("fixedExpenses", 0));
  const [months, setMonths] = useState(getStoredData("months", initialMonths));
  const [transactions, setTransactions] = useState(getStoredData("transactions", []));
  const [recurringTransactions, setRecurringTransactions] = useState(getStoredData("recurringTransactions", []));
  
  // Category management
  const [expenseCategories, setExpenseCategories] = useState(
    getStoredData("expenseCategories", [
      { name: 'Housing', budgeted: 0, spent: 0 },
      { name: 'Food & Dining', budgeted: 0, spent: 0 },
      { name: 'Transportation', budgeted: 0, spent: 0 }
    ])
  );
  
  const [incomeCategories, setIncomeCategories] = useState(
    getStoredData("incomeCategories", [
      { name: 'Salary', budgeted: 0, actual: 0 },
      { name: 'Freelance', budgeted: 0, actual: 0 }
    ])
  );

  // Calculated values
  const [insights, setInsights] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    monthlyAverage: 0
  });

  // Calculate insights based on transactions and categories
  useEffect(() => {
    const currentYearTransactions = transactions.filter(t => 
      new Date(t.date).getFullYear() === currentYear
    );

    const totalIncome = currentYearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = currentYearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const monthlyAverage = netSavings / 12;

    setInsights({
      totalIncome,
      totalExpenses,
      netSavings,
      monthlyAverage
    });

    // Update category totals
    updateCategoryTotals(currentYearTransactions);
  }, [transactions, currentYear]);

  // Update category spending totals
  const updateCategoryTotals = (currentYearTransactions) => {
    // Update expense categories
    setExpenseCategories(prev => prev.map(category => ({
      ...category,
      spent: currentYearTransactions
        .filter(t => t.type === 'expense' && t.category === category.name)
        .reduce((sum, t) => sum + t.amount, 0)
    })));

    // Update income categories
    setIncomeCategories(prev => prev.map(category => ({
      ...category,
      actual: currentYearTransactions
        .filter(t => t.type === 'income' && t.category === category.name)
        .reduce((sum, t) => sum + t.amount, 0)
    })));
  };

  // Persist data to localStorage
  useEffect(() => {
    const dataToStore = {
      theme,
      fixedIncome,
      fixedExpenses,
      months,
      transactions,
      recurringTransactions,
      expenseCategories,
      incomeCategories,
      currentYear
    };

    Object.entries(dataToStore).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }, [theme, fixedIncome, fixedExpenses, months, transactions, recurringTransactions, expenseCategories, incomeCategories, currentYear]);

  // Theme management
  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme" : "";
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Data management functions
  const handleDataImport = (importData) => {
    if (importData.fixedIncome !== undefined) setFixedIncome(importData.fixedIncome);
    if (importData.fixedExpenses !== undefined) setFixedExpenses(importData.fixedExpenses);
    if (importData.months) setMonths(importData.months);
    if (importData.transactions) setTransactions(importData.transactions);
    if (importData.recurringTransactions) setRecurringTransactions(importData.recurringTransactions);
    if (importData.expenseCategories) setExpenseCategories(importData.expenseCategories);
    if (importData.incomeCategories) setIncomeCategories(importData.incomeCategories);
    if (importData.currentYear) setCurrentYear(importData.currentYear);
  };

  const handleDataReset = () => {
    localStorage.clear();
    setFixedIncome(0);
    setFixedExpenses(0);
    setMonths(initialMonths);
    setTransactions([]);
    setRecurringTransactions([]);
    setExpenseCategories([
      { name: 'Housing', budgeted: 0, spent: 0 },
      { name: 'Food & Dining', budgeted: 0, spent: 0 },
      { name: 'Transportation', budgeted: 0, spent: 0 }
    ]);
    setIncomeCategories([
      { name: 'Salary', budgeted: 0, actual: 0 },
      { name: 'Freelance', budgeted: 0, actual: 0 }
    ]);
    setCurrentView('dashboard');
  };

  const handleGenerateRecurringTransactions = (generatedTransactions) => {
    setTransactions(prev => [...prev, ...generatedTransactions]);
  };

  // Navigation
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'recurring', label: 'Recurring', icon: <FaCalendarAlt /> },
    { id: 'transactions', label: 'Transactions', icon: <FaTable /> },
    { id: 'categories', label: 'Categories', icon: <FaCog /> },
    { id: 'charts', label: 'Analytics', icon: <FaChartLine /> },
    { id: 'ai-analysis', label: 'AI Insights', icon: <FaBrain /> },
    { id: 'data', label: 'Data Management', icon: <FaTrashAlt /> }
  ];

  const allData = {
    fixedIncome,
    fixedExpenses,
    months,
    transactions,
    recurringTransactions,
    expenseCategories,
    incomeCategories,
    currentYear
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard insights={insights} currentYear={currentYear} />;
      case 'recurring':
        return (
          <RecurringTransactionManager
            recurringTransactions={recurringTransactions}
            setRecurringTransactions={setRecurringTransactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            onGenerateTransactions={handleGenerateRecurringTransactions}
          />
        );
      case 'transactions':
        return (
          <TransactionManager
            transactions={transactions}
            setTransactions={setTransactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            currentYear={currentYear}
          />
        );
      case 'categories':
        return (
          <CategoryManager
            expenseCategories={expenseCategories}
            setExpenseCategories={setExpenseCategories}
            incomeCategories={incomeCategories}
            setIncomeCategories={setIncomeCategories}
          />
        );
      case 'charts':
        return (
          <AdvancedCharts
            months={months}
            transactions={transactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            currentYear={currentYear}
          />
        );
      case 'ai-analysis':
        return (
          <AIAnalysisComponent
            transactions={transactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            recurringTransactions={recurringTransactions}
            currentYear={currentYear}
          />
        );
      case 'data':
        return (
          <DataManager
            data={allData}
            onImport={handleDataImport}
            onReset={handleDataReset}
            appVersion="3.0.0"
          />
        );
      default:
        return <Dashboard insights={insights} currentYear={currentYear} />;
    }
  };

  return (
    <div className="App container-fluid">
      <div className="rotate-message">
        Please rotate your device to landscape mode.
      </div>
      
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center my-3 p-3 bg-light rounded">
        <div className="text-start">
          <h1 className="mb-0 text-start">Cash Flow Pro</h1>
          <small className="text-muted">Advanced Financial Management v3.1 - Now with AI Analysis & Recurring Transactions</small>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <FaCalendarAlt className="me-2" />
            <select 
              className="form-select"
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-outline-secondary" onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="mb-4">
        <div className="nav nav-pills nav-fill">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              {item.icon} <span className="ms-2">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="text-center my-4 py-3 border-top">
        <small className="text-muted">
          Built with React, Chart.js & Bootstrap | Enhanced with AI-powered features | v3.1.0
        </small>
      </footer>
    </div>
  );
}

export default App;
