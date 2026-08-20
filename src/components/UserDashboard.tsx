import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Task } from "../types";

const card: React.CSSProperties = { background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "24px" };

function StatTile({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div style={{ ...card, padding: "20px", textAlign: "center" }}>
      <h2 style={{ color: color, margin: "0 0 4px", fontSize: "26px", fontWeight: 700 }}>{value}</h2>
      <p style={{ color: "#71717A", margin: 0, fontSize: "12.5px" }}>{label}</p>
    </div>
  );
}

// Horizontal bar chart. Every row carries its own text label, so identity
// never depends on color alone (colors are the app's semantic status colors).
function HBarChart({ title, rows }: { title: string; rows: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={card}>
      <h3 style={{ color: "white", margin: "0 0 18px", fontSize: "15px", fontWeight: 600 }}>{title}</h3>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{ width: "90px", flexShrink: 0, color: "#A1A1AA", fontSize: "12.5px", textAlign: "right" }}>{row.label}</span>
          <div style={{ flex: 1, height: "14px", background: "#1F1F23", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(row.value / max) * 100}%`, height: "100%", background: row.color, borderRadius: "0 4px 4px 0", transition: "width 0.4s ease" }} />
          </div>
          <span style={{ width: "24px", flexShrink: 0, color: "#E5E5E7", fontSize: "12.5px", fontWeight: 600 }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// Single-series 7-day trend, SVG line + area with hover tooltips.
interface TrendPoint {
  label: string;
  fullLabel: string;
  count: number;
}

function TrendChart({ title, points }: { title: string; points: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 150, PAD_X = 28, PAD_TOP = 14, PAD_BOTTOM = 26;
  const max = Math.max(...points.map((p) => p.count), 1);
  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1);
  const y = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.count)}`).join(" ");
  const areaPath = `${linePath} L${x(points.length - 1)},${H - PAD_BOTTOM} L${x(0)},${H - PAD_BOTTOM} Z`;

  return (
    <div style={card}>
      <h3 style={{ color: "white", margin: "0 0 6px", fontSize: "15px", fontWeight: 600 }}>{title}</h3>
      <p style={{ color: "#71717A", margin: "0 0 12px", fontSize: "12.5px", minHeight: "16px" }}>
        {hover !== null
          ? `${points[hover].fullLabel}: ${points[hover].count} task${points[hover].count === 1 ? "" : "s"}`
          : "Hover a point for details"}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} onMouseLeave={() => setHover(null)}>
        {[0.5, 1].map((f) => (
          <line key={f} x1={PAD_X} x2={W - PAD_X} y1={y(max * f)} y2={y(max * f)} stroke="#1F1F23" strokeWidth="1" />
        ))}
        <text x={PAD_X - 6} y={y(max) + 4} fill="#71717A" fontSize="10" textAnchor="end">{max}</text>
        <text x={PAD_X - 6} y={H - PAD_BOTTOM + 4} fill="#71717A" fontSize="10" textAnchor="end">0</text>
        <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_BOTTOM} y2={H - PAD_BOTTOM} stroke="#27272A" strokeWidth="1" />
        <path d={areaPath} fill="rgba(59,130,246,0.12)" />
        <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.fullLabel}>
            <circle cx={x(i)} cy={y(p.count)} r={hover === i ? 5 : 3.5} fill="#3B82F6" stroke="#111113" strokeWidth="2" />
            {/* larger invisible hit target */}
            <circle cx={x(i)} cy={y(p.count)} r="14" fill="transparent" onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }} />
            <text x={x(i)} y={H - 8} fill={hover === i ? "#E5E5E7" : "#71717A"} fontSize="10" textAnchor="middle">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    async function fetchTasks() {
      // The dashboard shows personal analytics, so only query own tasks —
      // security rules also reject anything broader for non-admins.
      const q = query(collection(db, "items"), where("createdBy", "==", uid));
      const snap = await getDocs(q);
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
    }
    fetchTasks();
  }, [currentUser]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const stats = useMemo(() => {
    const byStatus = { "To Do": 0, "In Progress": 0, Done: 0 };
    const byPriority = { High: 0, Medium: 0, Low: 0 };
    let overdue = 0;
    const now = new Date();
    for (const t of tasks) {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
      if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
      if (t.dueDate && t.status !== "Done" && new Date(t.dueDate + "T23:59:59") < now) overdue++;
    }
    const done = byStatus.Done;
    const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    // Last 7 days of task creation
    const trend: TrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      trend.push({
        label: day.toLocaleDateString(undefined, { weekday: "short" }),
        fullLabel: day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
        count: tasks.filter((t) => t.createdAt?.slice(0, 10) === key).length,
      });
    }
    return { byStatus, byPriority, overdue, completion, trend };
  }, [tasks]);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ ...card, padding: "26px 30px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", color: "white", fontWeight: "600" }}>Your dashboard</h1>
            <p style={{ margin: "6px 0 0", color: "#71717A", fontSize: "13.5px" }}>{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "18px" }}>
          <StatTile value={tasks.length} label="Total tasks" color="#3B82F6" />
          <StatTile value={stats.byStatus["In Progress"]} label="In progress" color="#EAB308" />
          <StatTile value={`${stats.completion}%`} label="Completed" color="#22C55E" />
          <StatTile value={stats.overdue} label="Overdue" color={stats.overdue > 0 ? "#EF4444" : "#71717A"} />
        </div>

        {tasks.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "48px", marginBottom: "18px" }}>
            <p style={{ color: "#71717A", fontSize: "14.5px", marginBottom: "18px" }}>No tasks yet — create your first task to see your analytics here.</p>
            <Link to="/create">
              <button className="btn-primary">Create a task</button>
            </Link>
          </div>
        ) : (
          <>
            {/* Breakdown charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "18px" }}>
              <HBarChart
                title="Tasks by status"
                rows={[
                  { label: "To Do", value: stats.byStatus["To Do"], color: "#A1A1AA" },
                  { label: "In Progress", value: stats.byStatus["In Progress"], color: "#3B82F6" },
                  { label: "Done", value: stats.byStatus.Done, color: "#22C55E" },
                ]}
              />
              <HBarChart
                title="Tasks by priority"
                rows={[
                  { label: "High", value: stats.byPriority.High, color: "#EF4444" },
                  { label: "Medium", value: stats.byPriority.Medium, color: "#EAB308" },
                  { label: "Low", value: stats.byPriority.Low, color: "#22C55E" },
                ]}
              />
            </div>

            {/* Trend */}
            <div style={{ marginBottom: "18px" }}>
              <TrendChart title="Tasks created — last 7 days" points={stats.trend} />
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div style={card}>
          <h3 style={{ color: "white", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>Quick actions</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/board")} className="btn-primary">
              Open board
            </button>
            <button onClick={() => navigate("/items")} className="btn-secondary">
              View all tasks
            </button>
            <button onClick={() => navigate("/create")} className="btn-secondary">
              Create new task
            </button>
            <button onClick={() => navigate("/assistant")} className="btn-secondary">
              AI assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
