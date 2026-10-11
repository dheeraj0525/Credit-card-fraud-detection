import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function RiskDistributionChart({ low = 88, medium = 9, high = 3 }) {
  const safeLow = Math.max(0, low);
  const safeHigh = Math.max(0, high);
  const safeMedium = Math.max(0, medium);

  const data = {
    labels: ["Low / Safe Risk", "Medium Risk", "High / Critical Fraud"],
    datasets: [
      {
        data: [safeLow, safeMedium, safeHigh],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        hoverBackgroundColor: ["#34d399", "#fbbf24", "#f87171"],
        borderColor: ["#0b0f19", "#0b0f19", "#0b0f19"],
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          font: { family: "Inter", size: 11, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  return (
    <div className="h-60 w-full flex items-center justify-center relative">
      <div className="h-52 w-52 relative">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

export default RiskDistributionChart;
