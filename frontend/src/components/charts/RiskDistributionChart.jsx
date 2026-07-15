import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function RiskDistributionChart({ low = 88, medium = 9, high = 3 }) {
  const data = {
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [
      {
        data: [low, medium, high],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: ["#0b0f19", "#0b0f19", "#0b0f19"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { family: "Inter" },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <div className="h-56 w-56">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

export default RiskDistributionChart;
