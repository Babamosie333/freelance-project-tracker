import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import EarningsChart from '../components/EarningsChart';
import ProjectEarningsChart from '../components/ProjectEarningsChart';
import ProgressBar from '../components/ProgressBar';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page container">
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page container">
        <p style={{ color: 'var(--danger)' }}>Failed to load dashboard. Is the backend running?</p>
      </div>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <h1>Hi, {user?.name || stats.userName} 👋</h1>
          <p>Your personal earnings dashboard — only your projects and income</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      <div className="stats-grid">
        <div className="card">
          <div className="card-title">Total Earned</div>
          <div className="card-value" style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.totalEarned)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Total Budget</div>
          <div className="card-value">{formatCurrency(stats.totalBudget)}</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Earnings</div>
          <div className="card-value" style={{ color: 'var(--warning)' }}>
            {formatCurrency(stats.pendingEarnings)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Active Projects</div>
          <div className="card-value">{stats.activeProjects}</div>
        </div>
        <div className="card">
          <div className="card-title">Completed Projects</div>
          <div className="card-value">{stats.completedProjects}</div>
        </div>
        <div className="card">
          <div className="card-title">Task Completion</div>
          <div className="card-value">
            {stats.doneTasks}/{stats.totalTasks}
          </div>
          <ProgressBar value={stats.taskCompletionRate} variant="success" />
        </div>
      </div>

      <div className="charts-row">
        <EarningsChart data={stats.earningsChart} title="Monthly Earnings" />
        <ProjectEarningsChart data={stats.projectEarnings} />
      </div>
    </div>
  );
}

export default Dashboard;
