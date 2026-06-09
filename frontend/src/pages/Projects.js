import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../services/api';
import ProjectForm from '../components/ProjectForm';
import ProgressBar from '../components/ProgressBar';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await createProject(formData);
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const daysUntil = (deadline) => {
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    return `${diff}d left`;
  };

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p>Your personal client projects, deadlines, and budgets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Project
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state card">
          <h3>No projects yet</h3>
          <p>Create your first freelance project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
            + Add Project
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>{project.projectName}</h3>
                  <p className="client">{project.clientName}</p>
                </div>
                <span className={`badge badge-${project.status}`}>{project.status}</span>
              </div>

              <ProgressBar
                value={project.progress}
                label={`Tasks (${project.doneTaskCount}/${project.taskCount})`}
              />

              <div className="project-meta">
                <span className="budget">{formatCurrency(project.budget)}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {formatDate(project.deadline)} · {daysUntil(project.deadline)}
                </span>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => handleDelete(e, project._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Project</h2>
            <ProjectForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
