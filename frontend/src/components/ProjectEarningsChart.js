import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: '#1a1d27',
  border: '1px solid #2a2f45',
  borderRadius: '8px',
  color: '#e8eaf0',
};

function ProjectEarningsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Budget vs Earned by Project</h3>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
          No project data yet
        </p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Budget vs Earned by Project</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
          <XAxis dataKey="name" stroke="#8b90a5" fontSize={11} />
          <YAxis stroke="#8b90a5" fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar dataKey="budget" fill="#818cf8" name="Budget ($)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="earned" fill="#22c55e" name="Earned ($)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProjectEarningsChart;
