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
  const defaultLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
  
  // Calculate dynamic genuine vs fraud counts if transaction events exist
  const fraudCount = transactions.filter((t) => t.risk_level === "HIGH" || t.risk_level === "FRAUD").length;
  const genuineCount = Math.max(0, transactions.length - fraudCount);

  const genuineData = transactions.length > 0
    ? [Math.floor(genuineCount * 0.1), Math.floor(genuineCount * 0.15), Math.floor(genuineCount * 0.25), Math.floor(genuineCount * 0.2), Math.floor(genuineCount * 0.18), Math.floor(genuineCount * 0.08), Math.floor(genuineCount * 0.04)]
    : [140, 95, 260, 340, 310, 240, 180];

  const fraudData = transactions.length > 0
    ? [0, Math.min(fraudCount, 1), Math.min(fraudCount, 2), Math.min(fraudCount, 1), Math.min(fraudCount, 3), Math.min(fraudCount, 2), Math.min(fraudCount, 1)]
    : [3, 7, 2, 9, 5, 8, 2];

  const data = {
    labels: defaultLabels,
    datasets: [
      {
        label: "Genuine Stream",
        data: genuineData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        borderWidth: 2,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#0b0f19",
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Fraudulent Flags",
        data: fraudData,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.18)",
        borderWidth: 2,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#0b0f19",
        pointHoverRadius: 6,
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
        align: "end",
        labels: {
          color: "#94a3b8",
          usePointStyle: true,
          pointStyle: "circle",
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
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)", drawBorder: false },
        ticks: { color: "#64748b", font: { family: "JetBrains Mono, monospace", size: 10 } },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)", drawBorder: false },
        ticks: { color: "#64748b", font: { family: "JetBrains Mono, monospace", size: 10 } },
      },
    },
  };

  return (
    <div className="h-60 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export default FraudTrendChart;
