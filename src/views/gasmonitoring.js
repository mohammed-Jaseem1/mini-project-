import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/gasmonitoring.css";


function GasLevelGauge({ value }) {
  const radius = 80;
  const stroke = 16;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg height={radius * 2} width={radius * 2}>
        <defs>
          <linearGradient id="gasLevelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#388e3c" />
            <stop offset="100%" stopColor="#1976d2" />
          </linearGradient>
        </defs>
        <circle
          stroke="#e0e0e0"
          fill="none"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={percent < 20 ? "#d32f2f" : "url(#gasLevelGradient)"}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize="2.5em"
          fill="#222"
          fontWeight="bold"
        >
          {value}%
        </text>
      </svg>
      <span
        style={{
          marginTop: "1em",
          fontWeight: 700,
          color: percent < 20 ? "#d32f2f" : "#1976d2",
          fontSize: "1.2em",
          letterSpacing: "0.04em",
        }}
      >
        {percent < 20 ? "Low Gas Level" : "Gas Level Normal"}
      </span>
    </div>
  );
}

function GasLevelLineChart({ data }) {
  if (!data || data.length === 0) return null;

  const width = 340;
  const height = 120;
  const padding = 40;
  const maxLevel = 100;

  const points = data.map((d, i) => {
    const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
    const y = height - padding - ((height - 2 * padding) * d.gasLevel) / maxLevel;
    return { x, y, date: d.date, level: d.gasLevel };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(" ");

  return (
    <svg width={width} height={height} style={{ background: "#f7f9fc", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#bbb" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#bbb" />
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <text key={v} x={padding - 8} y={height - padding - ((height - 2 * padding) * v) / maxLevel + 5} fontSize="0.8em" fill="#888" textAnchor="end">
          {v}
        </text>
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height - padding + 18} fontSize="0.8em" fill="#888" textAnchor="middle">
          {p.date}
        </text>
      ))}
      <path d={linePath} fill="none" stroke="#1976d2" strokeWidth="3" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#388e3c" />
      ))}
    </svg>
  );
}

function GasLevelPie({ value }) {
  const percent = Math.max(0, Math.min(100, value));
  const size = 120;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const angle = (percent / 100) * 360;
  const radians = (angle - 90) * (Math.PI / 180);
  const x = cx + radius * Math.cos(radians);
  const y = cy + radius * Math.sin(radians);
  const largeArcFlag = percent > 50 ? 1 : 0;

  const pathData = `
    M ${cx} ${cy}
    L ${cx} ${cy - radius}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}
    Z
  `;

  return (
    <div style={{ textAlign: "center", margin: "2em 0 1em 0" }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={radius} fill="#e0e0e0" />
        <path d={pathData} fill={percent < 20 ? "#d32f2f" : "url(#gasLevelPieGradient)"} />
        <defs>
          <linearGradient id="gasLevelPieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#388e3c" />
            <stop offset="100%" stopColor="#1976d2" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="1.5em" fill="#222" fontWeight="bold">
          {percent}%
        </text>
      </svg>
      <div style={{ fontWeight: 600, color: percent < 20 ? "#d32f2f" : "#1976d2", fontSize: "1.1em", marginTop: "0.5em" }}>
        {percent < 20 ? "Low Gas Level" : "Gas Level Normal"}
      </div>
    </div>
  );
}

export default function GasDashboard() {
  const [gasData, setGasData] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGasStatus() {
      try {
        const res = await fetch("http://localhost:5000/api/gas/status", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setGasData(data);
          setError("");
        } else {
          const errData = await res.json();
          setGasData(null);
          setError(errData.message || "Unable to fetch gas data.");
        }
      } catch {
        setGasData(null);
        setError("Network error or server unavailable.");
      }
    }
    async function fetchHistory() {
      try {
        const res = await fetch("http://localhost:5000/api/gas/history", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(
            data.map((d) => ({
              date: new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              gasLevel: d.gasLevel,
            }))
          );
        }
      } catch {
        setHistory([]);
      }
    }
    fetchGasStatus();
    fetchHistory();
  }, []);

  return (
    <div className="dashboard-container" style={{ background: "linear-gradient(135deg, #e3f2fd 0%, #f7f9fc 100%)", minHeight: "100vh", paddingBottom: "2em" }}>
      <header className="dashboard-header" style={{ background: "linear-gradient(90deg, #1976d2 0%, #388e3c 100%)", color: "#fff", padding: "2em 0 1em 0", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: "2.5em", letterSpacing: "0.03em", textShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          Gas Level Monitoring
        </h1>
      </header>
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3em 0" }}>
        <button
          style={{
            marginBottom: "2em",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.7em 2em",
            fontWeight: 600,
            fontSize: "1.1em",
            cursor: "pointer"
          }}
          onClick={() => navigate('/userdash')}
        >
          &larr; Back to Dashboard
        </button>
        <div className="dashboard-card chart-card" style={{
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.12)",
          padding: "2.5em 2em 2em 2em",
          maxWidth: 1100,
          width: "100%",
          margin: "0 1em 2em 1em",
          display: "flex",
          flexDirection: "row", // <-- horizontal layout
          alignItems: "flex-start",
          gap: "2em",
          justifyContent: "center"
        }}>
          {/* Gauge */}
          <div style={{ width: 340, minWidth: 260 }}>
            <h2 style={{ textAlign: "center", fontWeight: 700, color: "#1976d2", marginBottom: "1.2em", fontSize: "1.3em" }}>
              Gas Level Gauge
            </h2>
            {error ? <p style={{ color: "#d32f2f", fontWeight: 600, textAlign: "center", fontSize: "1.1em" }}>{error}</p> : gasData ? <GasLevelGauge value={gasData.gasLevel} /> : <p style={{ textAlign: "center" }}>Loading...</p>}
          </div>
          {/* Pie */}
          <div style={{ width: 340, minWidth: 260 }}>
            <h2 style={{ textAlign: "center", fontWeight: 700, color: "#388e3c", marginBottom: "1.2em", fontSize: "1.3em" }}>
              Gas Level Pie Chart
            </h2>
            {error ? <p style={{ color: "#d32f2f", fontWeight: 600, textAlign: "center", fontSize: "1.1em" }}>{error}</p> : gasData ? <GasLevelPie value={gasData.gasLevel} /> : <p style={{ textAlign: "center" }}>Loading...</p>}
          </div>
          {/* Line */}
          <div style={{ width: 340, minWidth: 260 }}>
            <h2 style={{ textAlign: "center", fontWeight: 700, color: "#1976d2", marginBottom: "1.2em", fontSize: "1.3em" }}>
              Gas Level History
            </h2>
            {history.length > 0 ? <GasLevelLineChart data={history} /> : <p style={{ textAlign: "center" }}>No history available.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
