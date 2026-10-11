import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function MarchantChart() {
  const data = {
    labels: ["Luxury Retail", "Global E-Com", "Digital Gaming", "Electronics", "Petroleum / Fuel"],
    datasets: [
      {
        label: "Fraud Risk Coefficient",
        data: [0.89, 0.68, 0.42, 0.24, 0.08],
        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#3b82f6",
          "#10b981",
          "#10b981"
        ],
        borderRadius: 6,
        barThickness: 16,
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
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => `Risk Factor: ${(ctx.raw * 100).toFixed(0)}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: {
          color: "#64748b",
          font: { family: "JetBrains Mono", size: 10 },
          callback: (val) => `${(val * 100).toFixed(0)}%`
        },
        max: 1.0,
      },
      y: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { family: "Inter", size: 11, weight: "500" } },
      },
    },
  };

  return (
    <div className="h-60 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}

export default MarchantChart;
