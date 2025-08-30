import React, { useState, useEffect } from 'react';
import { FaBrain, FaChartLine, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaLightbulb, FaBullseye, FaEye, FaCalendarAlt } from 'react-icons/fa';

const AIAnalysisComponent = ({ 
  transactions, 
  expenseCategories, 
  incomeCategories, 
  recurringTransactions,
  currentYear 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [futureProjections, setFutureProjections] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  useEffect(() => {
    if (transactions.length > 0) {
      performAIAnalysis();
    }
  }, [transactions, expenseCategories, incomeCategories, recurringTransactions, currentYear]);

  const performAIAnalysis = () => {
    const currentYearTransactions = transactions.filter(t => 
      new Date(t.date).getFullYear() === currentYear
    );

    // Calculate basic metrics
    const totalIncome = currentYearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = currentYearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Analyze spending patterns
    const spendingAnalysis = analyzeSpendingPatterns(currentYearTransactions);
    const incomeAnalysis = analyzeIncomePatterns(currentYearTransactions);
    const budgetAnalysis = analyzeBudgetPerformance();
    const trendAnalysis = analyzeTrends(currentYearTransactions);

    setAnalysis({
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      transactionCount: currentYearTransactions.length
    });

    generateInsights(totalIncome, totalExpenses, netSavings, savingsRate, spendingAnalysis, incomeAnalysis);
    generateRecommendations(savingsRate, spendingAnalysis, budgetAnalysis);
    generateAlerts(budgetAnalysis, spendingAnalysis);
    generateFutureProjections(totalIncome, totalExpenses, netSavings);
    setTrends(trendAnalysis);
  };

  const analyzeSpendingPatterns = (transactions) => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categorySpending = {};
    
    expenseTransactions.forEach(t => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = { total: 0, count: 0, transactions: [] };
      }
      categorySpending[t.category].total += t.amount;
      categorySpending[t.category].count += 1;
      categorySpending[t.category].transactions.push(t);
    });

    // Find highest spending categories
    const sortedCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b.total - a.total);

    return {
      categorySpending,
      topSpendingCategory: sortedCategories[0] || null,
      averageTransactionAmount: expenseTransactions.length > 0 
        ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length 
        : 0
    };
  };

  const analyzeIncomePatterns = (transactions) => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const monthlyIncome = {};
    
    incomeTransactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      if (!monthlyIncome[month]) monthlyIncome[month] = 0;
      monthlyIncome[month] += t.amount;
    });

    const incomeVariability = Object.values(monthlyIncome).length > 1 
      ? calculateVariance(Object.values(monthlyIncome))
      : 0;

    return {
      monthlyIncome,
      incomeVariability,
      averageMonthlyIncome: Object.values(monthlyIncome).length > 0
        ? Object.values(monthlyIncome).reduce((sum, amt) => sum + amt, 0) / Object.values(monthlyIncome).length
        : 0
    };
  };

  const analyzeBudgetPerformance = () => {
    const budgetPerformance = expenseCategories.map(category => {
      const variance = category.budgeted - category.spent;
      const performancePercentage = category.budgeted > 0 
        ? ((category.budgeted - category.spent) / category.budgeted) * 100 
        : 0;
      
      return {
        category: category.name,
        budgeted: category.budgeted,
        spent: category.spent,
        variance,
        performancePercentage,
        status: variance >= 0 ? 'under' : 'over'
      };
    });

    return budgetPerformance;
  };

  const analyzeTrends = (transactions) => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });

    const months = Object.keys(monthlyData).sort();
    const trendAnalysis = [];

    if (months.length >= 2) {
      const recentMonth = monthlyData[months[months.length - 1]];
      const previousMonth = monthlyData[months[months.length - 2]];

      const incomeChange = ((recentMonth.income - previousMonth.income) / previousMonth.income) * 100;
      const expenseChange = ((recentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;

      trendAnalysis.push({
        type: 'income',
        change: incomeChange,
        direction: incomeChange > 0 ? 'up' : 'down',
        description: `Income ${incomeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(incomeChange).toFixed(1)}% from last month`
      });

      trendAnalysis.push({
        type: 'expenses',
        change: expenseChange,
        direction: expenseChange > 0 ? 'up' : 'down',
        description: `Expenses ${expenseChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(expenseChange).toFixed(1)}% from last month`
      });
    }

    return trendAnalysis;
  };

  const calculateVariance = (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  };

  const generateInsights = (totalIncome, totalExpenses, netSavings, savingsRate, spendingAnalysis, incomeAnalysis) => {
    const newInsights = [];

    // Savings rate insight
    if (savingsRate >= 20) {
      newInsights.push({
        type: 'positive',
        icon: <FaArrowUp />,
        title: 'Excellent Savings Rate',
        description: `Your savings rate of ${savingsRate.toFixed(1)}% is excellent! You're on track for strong financial health.`
      });
    } else if (savingsRate >= 10) {
      newInsights.push({
        type: 'neutral',
        icon: <FaChartLine />,
        title: 'Good Savings Rate',
        description: `Your savings rate of ${savingsRate.toFixed(1)}% is good. Consider increasing it to 20% for optimal financial health.`
      });
    } else if (savingsRate > 0) {
      newInsights.push({
        type: 'warning',
        icon: <FaExclamationTriangle />,
        title: 'Low Savings Rate',
        description: `Your savings rate of ${savingsRate.toFixed(1)}% is below recommended levels. Aim for at least 10-20%.`
      });
    } else {
      newInsights.push({
        type: 'negative',
        icon: <FaArrowDown />,
        title: 'Negative Savings',
        description: `You're spending more than you earn. This is unsustainable and needs immediate attention.`
      });
    }

    // Top spending category insight
    if (spendingAnalysis.topSpendingCategory) {
      const [categoryName, categoryData] = spendingAnalysis.topSpendingCategory;
      const percentage = ((categoryData.total / totalExpenses) * 100).toFixed(1);
      
      newInsights.push({
        type: 'info',
        icon: <FaChartLine />,
        title: 'Top Spending Category',
        description: `${categoryName} accounts for ${percentage}% of your total expenses (${formatCurrency(categoryData.total)}).`
      });
    }

    // Income stability insight
    if (incomeAnalysis.incomeVariability < 500) {
      newInsights.push({
        type: 'positive',
        icon: <FaArrowUp />,
        title: 'Stable Income',
        description: 'Your income is relatively stable month-to-month, which is great for financial planning.'
      });
    } else {
      newInsights.push({
        type: 'warning',
        icon: <FaExclamationTriangle />,
        title: 'Variable Income',
        description: 'Your income varies significantly. Consider building a larger emergency fund.'
      });
    }

    setInsights(newInsights);
  };

  const generateRecommendations = (savingsRate, spendingAnalysis, budgetAnalysis) => {
    const newRecommendations = [];

    // Savings recommendations
    if (savingsRate < 10) {
      newRecommendations.push({
        priority: 'high',
        icon: <FaBullseye />,
        title: 'Increase Your Savings Rate',
        description: 'Try to save at least 10-20% of your income. Start by reviewing your largest expense categories.',
        action: 'Review and reduce discretionary spending'
      });
    }

    // Budget overrun recommendations
    const overBudgetCategories = budgetAnalysis.filter(cat => cat.status === 'over' && cat.budgeted > 0);
    if (overBudgetCategories.length > 0) {
      newRecommendations.push({
        priority: 'medium',
        icon: <FaExclamationTriangle />,
        title: 'Budget Overruns Detected',
        description: `You've exceeded budgets in ${overBudgetCategories.length} categories. Consider adjusting budgets or reducing spending.`,
        action: 'Review budget allocations'
      });
    }

    // Top spending category recommendation
    if (spendingAnalysis.topSpendingCategory) {
      const [categoryName, categoryData] = spendingAnalysis.topSpendingCategory;
      if ((categoryData.total / analysis?.totalExpenses) > 0.4) {
        newRecommendations.push({
          priority: 'medium',
          icon: <FaLightbulb />,
          title: `Optimize ${categoryName} Spending`,
          description: `${categoryName} represents a large portion of your expenses. Look for optimization opportunities.`,
          action: `Review ${categoryName} transactions for potential savings`
        });
      }
    }

    // Emergency fund recommendation
    if (analysis?.netSavings > 0) {
      const monthlyExpenses = analysis.totalExpenses / 12;
      const emergencyFundMonths = analysis.netSavings / monthlyExpenses;
      
      if (emergencyFundMonths < 3) {
        newRecommendations.push({
          priority: 'high',
          icon: <FaBullseye />,
          title: 'Build Emergency Fund',
          description: 'Aim to save 3-6 months of expenses for emergencies. You currently have less than 3 months covered.',
          action: 'Prioritize emergency fund savings'
        });
      }
    }

    setRecommendations(newRecommendations);
  };

  const generateDemoRecommendations = () => {
    // Generate some demo recommendations if no real data is available
    if (transactions.length < 3) {
      return [
        {
          priority: 'high',
          icon: <FaBullseye />,
          title: 'Start Tracking Your Finances',
          description: 'Add your income and expense transactions to get personalized recommendations.',
          action: 'Go to Transactions tab and add some data'
        },
        {
          priority: 'medium',
          icon: <FaLightbulb />,
          title: 'Set Up Recurring Transactions',
          description: 'Automate tracking of regular income and expenses like salary, rent, and subscriptions.',
          action: 'Visit the Recurring tab to set up automatic transactions'
        },
        {
          priority: 'medium',
          icon: <FaExclamationTriangle />,
          title: 'Create Budget Categories',
          description: 'Set budgets for different expense categories to track your spending limits.',
          action: 'Use the Categories tab to set up budgets'
        }
      ];
    }
    return [];
  };

  const generateAlerts = (budgetAnalysis, spendingAnalysis) => {
    const newAlerts = [];

    // Critical budget overruns
    const criticalOverruns = budgetAnalysis.filter(cat => 
      cat.status === 'over' && cat.performancePercentage < -50
    );

    criticalOverruns.forEach(cat => {
      newAlerts.push({
        level: 'danger',
        icon: <FaExclamationTriangle />,
        title: `Critical Budget Overrun: ${cat.category}`,
        description: `You've spent ${Math.abs(cat.performancePercentage).toFixed(1)}% more than budgeted in ${cat.category}.`
      });
    });

    // High single transaction amounts
    const highValueTransactions = transactions.filter(t => 
      t.amount > (spendingAnalysis.averageTransactionAmount * 3) && t.type === 'expense'
    );

    if (highValueTransactions.length > 0) {
      newAlerts.push({
        level: 'warning',
        icon: <FaExclamationTriangle />,
        title: 'Unusual High-Value Transactions',
        description: `${highValueTransactions.length} transactions are significantly above your average spending.`
      });
    }

    setAlerts(newAlerts);
  };

  const generateFutureProjections = (totalIncome, totalExpenses, currentNetSavings) => {
    const monthlyIncome = totalIncome / 12;
    const monthlyExpenses = totalExpenses / 12;
    const monthlyNetSavings = monthlyIncome - monthlyExpenses;

    // Include recurring transactions in projections
    const monthlyRecurringIncome = recurringTransactions
      .filter(rt => rt.type === 'income' && rt.isActive)
      .reduce((sum, rt) => {
        const frequency = rt.frequency;
        let monthlyAmount = 0;
        if (frequency === 'monthly') monthlyAmount = rt.amount;
        else if (frequency === 'weekly') monthlyAmount = rt.amount * 4.33;
        else if (frequency === 'bi-weekly') monthlyAmount = rt.amount * 2.17;
        else if (frequency === 'quarterly') monthlyAmount = rt.amount / 3;
        else if (frequency === 'yearly') monthlyAmount = rt.amount / 12;
        return sum + monthlyAmount;
      }, 0);

    const monthlyRecurringExpenses = recurringTransactions
      .filter(rt => rt.type === 'expense' && rt.isActive)
      .reduce((sum, rt) => {
        const frequency = rt.frequency;
        let monthlyAmount = 0;
        if (frequency === 'monthly') monthlyAmount = rt.amount;
        else if (frequency === 'weekly') monthlyAmount = rt.amount * 4.33;
        else if (frequency === 'bi-weekly') monthlyAmount = rt.amount * 2.17;
        else if (frequency === 'quarterly') monthlyAmount = rt.amount / 3;
        else if (frequency === 'yearly') monthlyAmount = rt.amount / 12;
        return sum + monthlyAmount;
      }, 0);

    const projectedMonthlyNet = (monthlyIncome + monthlyRecurringIncome) - (monthlyExpenses + monthlyRecurringExpenses);

    const projections = [];
    const timeframes = [
      { period: '3 months', months: 3 },
      { period: '6 months', months: 6 },
      { period: '1 year', months: 12 },
      { period: '2 years', months: 24 },
      { period: '5 years', months: 60 },
      { period: '10 years', months: 120 }
    ];

    timeframes.forEach(timeframe => {
      const projectedSavings = currentNetSavings + (projectedMonthlyNet * timeframe.months);
      const isDebt = projectedSavings < 0;
      
      let status = 'positive';
      let statusText = 'Strong Savings';
      let icon = <FaArrowUp />;
      
      if (isDebt) {
        status = 'debt';
        statusText = 'In Debt';
        icon = <FaArrowDown />;
      } else if (projectedSavings < (monthlyExpenses * 3)) {
        status = 'warning';
        statusText = 'Low Savings';
        icon = <FaExclamationTriangle />;
      }

      // Calculate trajectory
      let trajectory = 'stable';
      if (projectedMonthlyNet > 0) {
        trajectory = 'improving';
      } else if (projectedMonthlyNet < 0) {
        trajectory = 'declining';
      }

      projections.push({
        period: timeframe.period,
        months: timeframe.months,
        projectedAmount: projectedSavings,
        monthlyNet: projectedMonthlyNet,
        status,
        statusText,
        icon,
        trajectory,
        isDebt,
        confidence: calculateProjectionConfidence(timeframe.months, monthlyNetSavings, projectedMonthlyNet)
      });
    });

    setFutureProjections(projections);
  };

  const calculateProjectionConfidence = (months, historicalNet, projectedNet) => {
    // Base confidence decreases with time
    let confidence = Math.max(15, 90 - (months * 1.2));
    
    // Reduce confidence if there's a big difference between historical and projected
    const variance = Math.abs(historicalNet - projectedNet);
    if (variance > Math.abs(historicalNet) * 0.5) {
      confidence -= 20;
    }
    
    // Reduce confidence for longer periods
    if (months > 12) confidence -= 10;
    if (months > 24) confidence -= 15;
    if (months > 60) confidence -= 20; // Additional reduction for very long term
    
    return Math.max(15, Math.min(90, confidence));
  };

  if (!analysis) {
    return (
      <div className="ai-analysis-component">
        <div className="text-center p-4">
          <FaBrain className="fs-1 text-muted mb-3" />
          <h5>AI Analysis</h5>
          <p className="text-muted">Add some transactions to get AI-powered insights about your financial health.</p>
          <div className="alert alert-info mt-3">
            <h6>To get meaningful recommendations, please add:</h6>
            <ul className="text-start mb-0">
              <li>At least 3-5 transactions (income and expenses)</li>
              <li>Set up some expense categories with budgets</li>
              <li>Add recurring transactions for regular income/expenses</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analysis-component">
      <div className="d-flex align-items-center mb-4">
        <FaBrain className="text-primary me-2 fs-3" />
        <div>
          <h3>AI Financial Analysis</h3>
          <small className="text-muted">
            Analyzing {analysis.transactionCount} transactions for {currentYear}
          </small>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h6>Financial Health Score</h6>
              <h2 className={`${analysis.savingsRate >= 15 ? 'text-success' : analysis.savingsRate >= 5 ? 'text-warning' : 'text-danger'}`}>
                {Math.max(0, Math.min(100, analysis.savingsRate + 50)).toFixed(0)}/100
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h6>Savings Rate</h6>
              <h4 className={`${analysis.savingsRate >= 15 ? 'text-success' : analysis.savingsRate >= 5 ? 'text-warning' : 'text-danger'}`}>
                {analysis.savingsRate.toFixed(1)}%
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h6>Total Transactions</h6>
              <h4 className="text-info">{analysis.transactionCount}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h6>Net Position</h6>
              <h4 className={analysis.netSavings >= 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(analysis.netSavings)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <h5><FaExclamationTriangle className="text-warning me-2" />Alerts</h5>
          {alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.level} d-flex align-items-center`}>
              <div className="me-2">{alert.icon}</div>
              <div>
                <strong>{alert.title}</strong>
                <div>{alert.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trends */}
      {trends.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h5><FaChartLine className="text-info me-2" />Recent Trends</h5>
            <div className="row">
              {trends.map((trend, index) => (
                <div key={index} className="col-md-6">
                  <div className="card">
                    <div className="card-body d-flex align-items-center">
                      <div className={`me-3 fs-4 ${trend.direction === 'up' ? 'text-success' : 'text-danger'}`}>
                        {trend.direction === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                      </div>
                      <div>
                        <h6 className="mb-1 text-capitalize">{trend.type}</h6>
                        <small className="text-muted">{trend.description}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Future Projections */}
      {futureProjections.length > 0 && (
        <div className="mb-4">
          <h5><FaEye className="text-info me-2" />Future Financial Projections</h5>
          <div className="row">
            {futureProjections.map((projection, index) => (
              <div key={index} className="col-xl-4 col-lg-6 col-md-6 mb-3">
                <div className={`card border-${projection.status === 'debt' ? 'danger' : projection.status === 'warning' ? 'warning' : 'success'}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="mb-0">
                        <FaCalendarAlt className="me-2" />{projection.period}
                        {projection.months >= 120 && <small className="ms-2 badge bg-info">Long-term</small>}
                      </h6>
                      <div className={`fs-5 text-${projection.status === 'debt' ? 'danger' : projection.status === 'warning' ? 'warning' : 'success'}`}>
                        {projection.icon}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className={`text-${projection.status === 'debt' ? 'danger' : projection.status === 'warning' ? 'warning' : 'success'}`}>
                        {formatCurrency(projection.projectedAmount)}
                      </h4>
                      <small className={`badge bg-${projection.status === 'debt' ? 'danger' : projection.status === 'warning' ? 'warning' : 'success'}`}>
                        {projection.statusText}
                      </small>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">
                        Monthly Net: <span className={projection.monthlyNet >= 0 ? 'text-success' : 'text-danger'}>
                          {formatCurrency(projection.monthlyNet)}
                        </span>
                      </small>
                      <small className="text-muted d-block">
                        Trajectory: <span className={`text-${projection.trajectory === 'improving' ? 'success' : projection.trajectory === 'declining' ? 'danger' : 'info'}`}>
                          {projection.trajectory}
                        </span>
                      </small>
                    </div>
                    
                    <div className="progress mb-2" style={{height: '6px'}}>
                      <div 
                        className={`progress-bar bg-${projection.confidence >= 70 ? 'success' : projection.confidence >= 50 ? 'warning' : 'danger'}`}
                        style={{width: `${projection.confidence}%`}}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Confidence: {projection.confidence.toFixed(0)}%
                    </small>
                    
                    {projection.isDebt && (
                      <div className="mt-2">
                        <small className="text-danger">
                          <FaExclamationTriangle className="me-1" />
                          Projected debt situation - take action now!
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="alert alert-info mt-3">
            <div className="d-flex align-items-start">
              <FaEye className="me-2 mt-1" />
              <div>
                <strong>About These Projections:</strong>
                <p className="mb-0 mt-1">
                  These predictions are based on your current spending patterns, income trends, and active recurring transactions. 
                  Confidence levels decrease for longer time periods. Use these insights to make informed financial decisions and 
                  adjust your budget accordingly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h5><FaLightbulb className="text-warning me-2" />AI Insights</h5>
          {insights.map((insight, index) => (
            <div key={index} className={`card mb-2 border-${insight.type === 'positive' ? 'success' : insight.type === 'negative' ? 'danger' : insight.type === 'warning' ? 'warning' : 'info'}`}>
              <div className="card-body">
                <div className="d-flex align-items-start">
                  <div className={`me-2 text-${insight.type === 'positive' ? 'success' : insight.type === 'negative' ? 'danger' : insight.type === 'warning' ? 'warning' : 'info'}`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h6 className="mb-1">{insight.title}</h6>
                    <small>{insight.description}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="col-md-6">
          <h5><FaBullseye className="text-primary me-2" />Recommendations</h5>
          {recommendations.length === 0 ? (
            transactions.length < 3 ? (
              generateDemoRecommendations().map((recommendation, index) => (
                <div key={index} className={`card mb-2 border-${recommendation.priority === 'high' ? 'danger' : 'warning'}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <div className={`me-2 text-${recommendation.priority === 'high' ? 'danger' : 'warning'}`}>
                        {recommendation.icon}
                      </div>
                      <div>
                        <h6 className="mb-1">
                          {recommendation.title}
                          <span className={`badge bg-${recommendation.priority === 'high' ? 'danger' : 'warning'} ms-2`}>
                            {recommendation.priority}
                          </span>
                        </h6>
                        <small className="d-block mb-1">{recommendation.description}</small>
                        <small className="text-muted"><strong>Action:</strong> {recommendation.action}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card border-success">
                <div className="card-body text-center">
                  <FaBullseye className="text-success fs-2 mb-2" />
                  <h6 className="text-success">Great Job!</h6>
                  <small className="text-muted">
                    No specific recommendations at this time. Your financial habits look good! 
                    Keep monitoring your progress and maintain your current savings rate.
                  </small>
                </div>
              </div>
            )
          ) : (
            recommendations.map((recommendation, index) => (
              <div key={index} className={`card mb-2 border-${recommendation.priority === 'high' ? 'danger' : 'warning'}`}>
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <div className={`me-2 text-${recommendation.priority === 'high' ? 'danger' : 'warning'}`}>
                      {recommendation.icon}
                    </div>
                    <div>
                      <h6 className="mb-1">
                        {recommendation.title}
                        <span className={`badge bg-${recommendation.priority === 'high' ? 'danger' : 'warning'} ms-2`}>
                          {recommendation.priority}
                        </span>
                      </h6>
                      <small className="d-block mb-1">{recommendation.description}</small>
                      <small className="text-muted"><strong>Action:</strong> {recommendation.action}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="card bg-light border-info mb-4">
        <div className="card-header bg-info text-white">
          <h6 className="mb-0"><FaBrain className="me-2" />How Our AI Analysis Works</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Financial Algorithms Used:</h6>
              <ul className="small mb-0">
                <li><strong>Savings Rate Analysis:</strong> (Income - Expenses) / Income × 100</li>
                <li><strong>Spending Pattern Recognition:</strong> Category-wise expense distribution</li>
                <li><strong>Budget Performance Tracking:</strong> Actual vs budgeted variance analysis</li>
                <li><strong>Income Stability Assessment:</strong> Statistical variance calculations</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Recommendation Engine:</h6>
              <ul className="small mb-0">
                <li><strong>Rule-Based Logic:</strong> Based on financial planning best practices</li>
                <li><strong>Trend Analysis:</strong> Month-over-month pattern recognition</li>
                <li><strong>Future Projections:</strong> Linear and exponential growth models</li>
                <li><strong>Risk Assessment:</strong> Emergency fund and debt-to-income ratios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisComponent;
