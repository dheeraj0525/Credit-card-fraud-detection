import React from "react";
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
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function FraudTrendChart({ transactions = [] }) {
  // Setup sample display curves for trend analytics
  const defaultLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
  const defaultGenuine = [120, 85, 240, 310, 280, 210, 150];
  const defaultFraud = [4, 8, 2, 11, 6, 8, 3];

  const data = {
    labels: defaultLabels,
    datasets: [
      {
        label: "Genuine Transactions",
        data: defaultGenuine,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Fraudulent Alerts",
        data: defaultFraud,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8",
          font: { family: "Inter" },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#273549" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        grid: { color: "#273549" },
        ticks: { color: "#94a3b8" },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export default FraudTrendChart;
