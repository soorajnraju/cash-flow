import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const initialMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const [fixedIncome, setFixedIncome] = useState(
    getStoredData("fixedIncome", 0)
  );
  const [fixedExpenses, setFixedExpenses] = useState(
    getStoredData("fixedExpenses", 0)
  );
  const [months, setMonths] = useState(getStoredData("months", initialMonths));
  const [savingsOrDebts, setSavingsOrDebts] = useState(0);
  const [monthlySavingsOrDebts, setMonthlySavingsOrDebts] = useState([]);
  const [totalVariableIncome, setTotalVariableIncome] = useState(0);
  const [totalVariableExpenses, setTotalVariableExpenses] = useState(0);

  useEffect(() => {
    let totalSavingsOrDebts = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    const monthlyData = months.map((monthData) => {
      const totalMonthIncome = fixedIncome + monthData.variableIncome;
      const totalMonthExpenses = fixedExpenses + monthData.variableExpenses;
      totalSavingsOrDebts += totalMonthIncome - totalMonthExpenses;
      totalIncome += monthData.variableIncome;
      totalExpenses += monthData.variableExpenses;
      return totalSavingsOrDebts;
    });
    setSavingsOrDebts(totalSavingsOrDebts);
    setMonthlySavingsOrDebts(monthlyData);
    setTotalVariableIncome(totalIncome);
    setTotalVariableExpenses(totalExpenses);

    localStorage.setItem("fixedIncome", JSON.stringify(fixedIncome));
    localStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses));
    localStorage.setItem("months", JSON.stringify(months));
  }, [fixedIncome, fixedExpenses, months]);

  const handleInputChange = (index, field, value) => {
    const newMonths = [...months];
    newMonths[index][field] =
      field === "comments" ? value : parseFloat(value) || 0;
    setMonths(newMonths);
  };

  const handleFixedIncomeChange = (value) =>
    setFixedIncome(parseFloat(value) || 0);
  const handleFixedExpensesChange = (value) =>
    setFixedExpenses(parseFloat(value) || 0);

  const handleDeleteMonth = (index) => {
    const newMonths = months.filter((_, i) => i !== index);
    setMonths(newMonths);
  };

  const handleDownload = () => {
    const data = { fixedIncome, fixedExpenses, months, savingsOrDebts };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cash-flow.json";
    a.click();
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setFixedIncome(data.fixedIncome);
      setFixedExpenses(data.fixedExpenses);
      setMonths(data.months);
      setSavingsOrDebts(data.savingsOrDebts);
    };
    reader.readAsText(file);
  };

  const chartData = {
    labels: months.map((month) => month.month),
    datasets: [
      {
        label: "Total Savings/Debts",
        data: monthlySavingsOrDebts,
        fill: false,
        borderColor: "blue",
      },
    ],
  };

  const barChartData = {
    labels: months.map((month) => month.month),
    datasets: [
      {
        label: "Variable Income",
        data: months.map((month) => month.variableIncome),
        backgroundColor: "green",
      },
      {
        label: "Variable Expenses",
        data: months.map((month) => month.variableExpenses),
        backgroundColor: "red",
      },
    ],
  };

  const getInsights = () => {
    const avgIncome = (fixedIncome + totalVariableIncome) / 12;
    const avgExpenses = (fixedExpenses + totalVariableExpenses) / 12;
    const netSavings = savingsOrDebts;

    return {
      avgIncome,
      avgExpenses,
      netSavings,
    };
  };

  const insights = getInsights();

  return (
    <div className="App container-fluid">
      <div className="rotate-message">
        Please rotate your device to landscape mode.
      </div>
      <h1 className="text-center my-4">Cash Flow</h1>
      <div className="row mb-3">
        <div className="col-md-6 col-sm-12">
          <label className="form-label">Fixed Income: </label>
          <input
            type="text"
            className="form-control"
            value={fixedIncome}
            onChange={(e) => handleFixedIncomeChange(e.target.value)}
          />
        </div>
        <div className="col-md-6 col-sm-12">
          <label className="form-label">Fixed Expenses: </label>
          <input
            type="text"
            className="form-control"
            value={fixedExpenses}
            onChange={(e) => handleFixedExpensesChange(e.target.value)}
          />
        </div>
      </div>
      <table className="table table-bordered table-responsive">
        <thead>
          <tr>
            <th>Month</th>
            <th>Variable Income</th>
            <th>Variable Expenses</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {months.map((monthData, index) => (
            <tr key={index}>
              <td>{monthData.month}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={monthData.variableIncome}
                  onChange={(e) =>
                    handleInputChange(index, "variableIncome", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={monthData.variableExpenses}
                  onChange={(e) =>
                    handleInputChange(index, "variableExpenses", e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  value={monthData.comments}
                  onChange={(e) =>
                    handleInputChange(index, "comments", e.target.value)
                  }
                />
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteMonth(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>
        {savingsOrDebts >= 0 ? "Savings" : "Debts"}: {Math.abs(savingsOrDebts)}
      </h2>
      <button className="btn btn-primary me-2" onClick={handleDownload}>
        Download JSON
      </button>
      <input
        type="file"
        className="form-control-file"
        onChange={handleUpload}
      />
      <div className="my-4">
        <Line data={chartData} />
      </div>
      <div className="my-4">
        <Bar data={barChartData} />
      </div>
      <div className="my-4">
        <h3>Insights</h3>
        <div className="card-deck">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Monthly Income</h5>
              <p className="card-text">{insights.avgIncome.toFixed(2)}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Monthly Expenses</h5>
              <p className="card-text">{insights.avgExpenses.toFixed(2)}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                Net {insights.netSavings > 0 ? "Savings" : "Debts"}
              </h5>
              <p className="card-text">{insights.netSavings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center my-4">
        Built using GitHub Copilot and ChatGPT
      </footer>
    </div>
  );
}

export default App;
