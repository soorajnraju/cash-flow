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
  const [fixedIncome, setFixedIncome] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState(0);
  const [months, setMonths] = useState([
    { month: "January", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "February", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "March", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "April", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "May", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "June", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "July", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "August", variableIncome: 0, variableExpenses: 0, comments: "" },
    {
      month: "September",
      variableIncome: 0,
      variableExpenses: 0,
      comments: "",
    },
    { month: "October", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "November", variableIncome: 0, variableExpenses: 0, comments: "" },
    { month: "December", variableIncome: 0, variableExpenses: 0, comments: "" },
  ]);

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
  }, [fixedIncome, fixedExpenses, months]);

  const handleInputChange = (index, field, value) => {
    const newMonths = [...months];
    newMonths[index][field] = field === "comments" ? value : parseFloat(value);
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
            type="number"
            className="form-control"
            value={fixedIncome}
            onChange={(e) => setFixedIncome(parseFloat(e.target.value))}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fixed Expenses: </label>
          <input
            type="number"
            className="form-control"
            value={fixedExpenses}
            onChange={(e) => setFixedExpenses(parseFloat(e.target.value))}
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
          </tr>
        </thead>
        <tbody>
          {months.map((monthData, index) => (
            <tr key={index}>
              <td>{monthData.month}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={monthData.variableIncome}
                  onChange={(e) =>
                    handleInputChange(index, "variableIncome", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="my-3">
        <h2>
          {savingsOrDebts >= 0 ? "Savings" : "Debts"}:{" "}
          {Math.abs(savingsOrDebts)}
        </h2>
      </div>
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
