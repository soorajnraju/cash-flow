import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  useEffect(() => {
    let totalSavingsOrDebts = 0;
    const monthlyData = months.map((monthData) => {
      const totalIncome = fixedIncome + monthData.variableIncome;
      const totalExpenses = fixedExpenses + monthData.variableExpenses;
      totalSavingsOrDebts += totalIncome - totalExpenses;
      return totalSavingsOrDebts;
    });
    setSavingsOrDebts(totalSavingsOrDebts);
    setMonthlySavingsOrDebts(monthlyData);

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

  return (
    <div className="App container">
      <h1 className="text-center my-4">Cash flow</h1>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Fixed Income: </label>
          <input
            type="text"
            className="form-control"
            value={fixedIncome}
            onChange={(e) => handleFixedIncomeChange(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fixed Expenses: </label>
          <input
            type="text"
            className="form-control"
            value={fixedExpenses}
            onChange={(e) => handleFixedExpensesChange(e.target.value)}
          />
        </div>
      </div>
      <table className="table table-bordered">
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
    </div>
  );
}

export default App;
