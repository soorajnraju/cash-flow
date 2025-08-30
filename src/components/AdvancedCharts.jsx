import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const AdvancedCharts = ({ 
  months, 
  transactions, 
  expenseCategories, 
  incomeCategories, 
  currentYear 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Enhanced Cash Flow Projection Chart with ML-like predictions
  const getCashFlowProjectionData = () => {
    const monthlyData = months.map((monthData, index) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear && 
               transactionDate.getMonth() === index;
      });

      const monthlyIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: monthData.month,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses
      };
    });

    // Calculate actual cumulative cash flow
    let cumulative = 0;
    const cumulativeData = monthlyData.map(data => {
      cumulative += data.net;
      return cumulative;
    });

    // Generate projections for next 6 months
    const lastThreeMonths = monthlyData.slice(-3);
    const avgIncome = lastThreeMonths.reduce((sum, m) => sum + m.income, 0) / 3;
    const avgExpenses = lastThreeMonths.reduce((sum, m) => sum + m.expenses, 0) / 3;
    const avgNet = avgIncome - avgExpenses;

    // Add trend factor
    const incomeGrowthRate = lastThreeMonths.length > 1 
      ? (lastThreeMonths[lastThreeMonths.length - 1].income - lastThreeMonths[0].income) / lastThreeMonths[0].income / 3
      : 0;
    
    const expenseGrowthRate = lastThreeMonths.length > 1 
      ? (lastThreeMonths[lastThreeMonths.length - 1].expenses - lastThreeMonths[0].expenses) / lastThreeMonths[0].expenses / 3
      : 0;

    const projectionMonths = ['Jan+1', 'Feb+1', 'Mar+1', 'Apr+1', 'May+1', 'Jun+1'];
    const projectedData = [];
    let projectedCumulative = cumulative;

    projectionMonths.forEach((month, index) => {
      const projectedIncome = avgIncome * (1 + incomeGrowthRate * (index + 1));
      const projectedExpenses = avgExpenses * (1 + expenseGrowthRate * (index + 1));
      const projectedNet = projectedIncome - projectedExpenses;
      projectedCumulative += projectedNet;
      projectedData.push(projectedCumulative);
    });

    return {
      labels: [...monthlyData.map(d => d.month), ...projectionMonths],
      datasets: [
        {
          label: 'Monthly Net Cash Flow',
          data: [...monthlyData.map(d => d.net), ...Array(6).fill(null)],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Cumulative Cash Flow (Actual)',
          data: [...cumulativeData, ...Array(6).fill(null)],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y1',
          tension: 0.4
        },
        {
          label: 'Projected Cumulative Cash Flow',
          data: [...Array(12).fill(null), ...projectedData],
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderDash: [5, 5],
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };
  };

  // Budget vs Actual Chart
  const getBudgetVsActualData = () => {
    const categories = [...expenseCategories];
    
    return {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          label: 'Budgeted',
          data: categories.map(cat => cat.budgeted),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Actual',
          data: categories.map(cat => cat.spent),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        }
      ]
    };
  };

  // Expense Category Breakdown (Doughnut)
  const getExpenseCategoryData = () => {
    const categoryTotals = expenseCategories
      .filter(cat => cat.spent > 0)
      .map(cat => ({
        name: cat.name,
        amount: cat.spent
      }));

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];

    return {
      labels: categoryTotals.map(cat => cat.name),
      datasets: [{
        data: categoryTotals.map(cat => cat.amount),
        backgroundColor: colors.slice(0, categoryTotals.length),
        borderWidth: 2
      }]
    };
  };

  // Income vs Expense Trend
  const getIncomeExpenseTrendData = () => {
    const monthlyData = months.map((monthData, index) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear && 
               transactionDate.getMonth() === index;
      });

      const monthlyIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: monthData.month,
        income: monthlyIncome,
        expenses: monthlyExpenses
      };
    });

    return {
      labels: monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Income',
          data: monthlyData.map(d => d.income),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Expenses',
          data: monthlyData.map(d => d.expenses),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y || context.parsed);
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
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

  const basicChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y || context.parsed);
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + formatCurrency(context.parsed) + ` (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="advanced-charts">
      <h3>Financial Analytics</h3>
      
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Cash Flow Projection</h5>
            </div>
            <div className="card-body">
              <Line data={getCashFlowProjectionData()} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Income vs Expenses Trend</h5>
            </div>
            <div className="card-body">
              <Line data={getIncomeExpenseTrendData()} options={basicChartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Expense Categories</h5>
            </div>
            <div className="card-body">
              <Doughnut data={getExpenseCategoryData()} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Budget vs Actual Spending</h5>
            </div>
            <div className="card-body">
              <Bar data={getBudgetVsActualData()} options={basicChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
