import React from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaPiggyBank } from 'react-icons/fa';
import { safeParseFloat } from '../utils/validation';

const Dashboard = ({ insights, currentYear }) => {
  const formatCurrency = (amount) => {
    const safeAmount = safeParseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(safeAmount));
  };

  const getDashboardCards = () => {
    // Validate insights object and provide defaults
    const safeInsights = insights || {};
    const totalIncome = safeParseFloat(safeInsights.totalIncome);
    const totalExpenses = safeParseFloat(safeInsights.totalExpenses);
    const netSavings = safeParseFloat(safeInsights.netSavings);
    const monthlyAverage = safeParseFloat(safeInsights.monthlyAverage);

    return [
      {
        title: 'Total Income',
        value: formatCurrency(totalIncome),
        icon: <FaArrowUp />,
        color: 'success',
        description: 'Year-to-date income'
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(totalExpenses),
        icon: <FaArrowDown />,
        color: 'danger',
        description: 'Year-to-date expenses'
      },
      {
        title: 'Net Savings',
        value: formatCurrency(netSavings),
        icon: netSavings >= 0 ? <FaPiggyBank /> : <FaWallet />,
        color: netSavings >= 0 ? 'success' : 'danger',
        description: netSavings >= 0 ? 'Total savings' : 'Total debt'
      },
      {
        title: 'Monthly Average',
        value: formatCurrency(monthlyAverage),
        icon: <FaWallet />,
        color: monthlyAverage >= 0 ? 'success' : 'warning',
        description: 'Average monthly balance'
      }
    ];
  };

  return (
    <div className="dashboard-container mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Financial Dashboard - {currentYear}</h2>
      </div>
      
      <div className="row">
        {getDashboardCards().map((card, index) => (
          <div key={index} className="col-md-3 col-sm-6 mb-3">
            <div className={`card border-${card.color} h-100`}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className={`text-${card.color} fs-4`}>
                    {card.icon}
                  </div>
                  <small className="text-muted">{card.description}</small>
                </div>
                <h5 className="card-title">{card.title}</h5>
                <h3 className={`card-text text-${card.color} mb-0`}>
                  {card.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
