import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function MarchantChart() {
  const data = {
    labels: ["Luxury Goods", "Amazon Store", "Unknown E-com", "Walmart", "Chevron Gas"],
    datasets: [
      {
        label: "Fraud Risk Coefficient",
        data: [0.89, 0.35, 0.68, 0.21, 0.08],
        backgroundColor: [
          "#ef4444",
          "#3b82f6",
          "#f59e0b",
          "#10b981",
          "#10b981"
        ],
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Risk: ${(ctx.raw * 100).toFixed(0)}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "#273549" },
        ticks: { color: "#94a3b8" },
        max: 1.0,
      },
      y: {
        grid: { color: "#273549" },
        ticks: { color: "#94a3b8" },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}

export default MarchantChart;
