import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { safeParseFloat, validateChartData } from '../utils/validation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const AdvancedCharts = ({ transactions }) => {
  const formatCurrency = (amount) => {
    const safeAmount = safeParseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(safeAmount);
  };

  const monthlyData = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        labels: [],
        income: [],
        expenses: [],
        balance: []
      };
    }

    const monthlyStats = {};
    
    transactions.forEach(transaction => {
      if (!transaction || !transaction.date) return;
      
      const date = new Date(transaction.date);
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { income: 0, expenses: 0 };
      }
      
      const amount = safeParseFloat(transaction.amount);
      if (transaction.type === 'income') {
        monthlyStats[monthKey].income += amount;
      } else {
        monthlyStats[monthKey].expenses += amount;
      }
    });

    const sortedMonths = Object.keys(monthlyStats).sort();
    let runningBalance = 0;
    
    const result = {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      income: [],
      expenses: [],
      balance: []
    };

    sortedMonths.forEach(month => {
      const income = monthlyStats[month].income;
      const expenses = monthlyStats[month].expenses;
      runningBalance += income - expenses;
      
      result.income.push(income);
      result.expenses.push(expenses);
      result.balance.push(runningBalance);
    });

    return validateChartData(result) ? result : {
      labels: [],
      income: [],
      expenses: [],
      balance: []
    };
  }, [transactions]);

  const cashFlowData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Income',
        data: monthlyData.income,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: monthlyData.expenses,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'Balance',
        data: monthlyData.balance,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        yAxisID: 'y1',
        type: 'line',
        tension: 0.4
      }
    ]
  };

  const categoryData = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          backgroundColor: ['#e0e0e0']
        }]
      };
    }

    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      if (!transaction || transaction.type !== 'expense') return;
      
      const category = transaction.category || 'Uncategorized';
      const amount = safeParseFloat(transaction.amount);
      
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    const categories = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    
    if (categories.length === 0) {
      return {
        labels: ['No Expenses'],
        datasets: [{
          data: [0],
          backgroundColor: ['#e0e0e0']
        }]
      };
    }

    return {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ]
      }]
    };
  }, [transactions]);

  const monthlyComparisonData = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        labels: [],
        datasets: []
      };
    }

    const currentDate = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(date);
    }

    const monthlyStats = last6Months.map(date => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthTransactions = transactions.filter(t => {
        if (!t || !t.date) return false;
        const tDate = new Date(t.date);
        if (isNaN(tDate.getTime())) return false;
        const tMonthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
        return tMonthKey === monthKey;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + safeParseFloat(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + safeParseFloat(t.amount), 0);

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      };
    });

    return {
      labels: monthlyStats.map(m => m.month),
      datasets: [
        {
          label: 'Income',
          data: monthlyStats.map(m => m.income),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: monthlyStats.map(m => m.expenses),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
        {
          label: 'Net',
          data: monthlyStats.map(m => m.net),
          backgroundColor: monthlyStats.map(m => m.net >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
          borderColor: monthlyStats.map(m => m.net >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
          borderWidth: 1
        }
      ]
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed || 0;
            return context.dataset.label + ': ' + formatCurrency(value);
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed || 0;
            return context.label + ': ' + formatCurrency(value);
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || 0;
            return context.dataset.label + ': ' + formatCurrency(value);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="alert alert-info">
        <h5>No Data Available</h5>
        <p>Add some transactions to see advanced charts and analytics.</p>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <h4 className="mb-4">Advanced Analytics</h4>
      </div>
      
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Cash Flow Trend</h5>
          </div>
          <div className="card-body">
            <div style={{ height: '400px' }}>
              <Line data={cashFlowData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Expense Categories</h5>
          </div>
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <Pie data={categoryData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">6-Month Comparison</h5>
          </div>
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <Bar data={monthlyComparisonData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
