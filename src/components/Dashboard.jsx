import React from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaPiggyBank } from 'react-icons/fa';

const Dashboard = ({ insights, currentYear }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getDashboardCards = () => {
    return [
      {
        title: 'Total Income',
        value: formatCurrency(insights.totalIncome),
        icon: <FaArrowUp />,
        color: 'success',
        description: 'Year-to-date income'
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(insights.totalExpenses),
        icon: <FaArrowDown />,
        color: 'danger',
        description: 'Year-to-date expenses'
      },
      {
        title: 'Net Savings',
        value: formatCurrency(insights.netSavings),
        icon: insights.netSavings >= 0 ? <FaPiggyBank /> : <FaWallet />,
        color: insights.netSavings >= 0 ? 'success' : 'danger',
        description: insights.netSavings >= 0 ? 'Total savings' : 'Total debt'
      },
      {
        title: 'Monthly Average',
        value: formatCurrency(insights.monthlyAverage),
        icon: <FaWallet />,
        color: insights.monthlyAverage >= 0 ? 'success' : 'warning',
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
