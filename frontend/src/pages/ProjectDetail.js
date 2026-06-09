import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  updateProject,
  createTask,
  updateTask,
  deleteTask,
  toggleMilestone,
} from '../services/api';
import ProjectForm from '../components/ProjectForm';
import TaskForm from '../components/TaskForm';
import ProgressBar from '../components/ProgressBar';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await getProject(id);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateProject(id, formData);
      setShowEditModal(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await createTask({ ...taskData, projectId: id });
      setShowTaskModal(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleTaskStatus = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      fetchProject();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      fetchProject();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      await toggleMilestone(id, milestoneId);
      fetchProject();
    } catch (err) {
      alert('Failed to update milestone');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

  if (loading) {
    return (
      <div className="page container">
        <p style={{ color: 'var(--text-muted)' }}>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page container">
        <p style={{ color: 'var(--danger)' }}>Project not found</p>
        <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const doneMilestones = project.milestones.filter((m) => m.completed).length;
  const milestoneProgress =
    project.milestones.length === 0
      ? 0
      : Math.round((doneMilestones / project.milestones.length) * 100);

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/projects')}
            style={{ marginBottom: '0.75rem' }}
          >
            ← Back
          </button>
          <h1>{project.projectName}</h1>
          <p>
            {project.clientName} · <span className={`badge badge-${project.status}`}>{project.status}</span>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
          Edit Project
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-title">Budget</div>
          <div className="card-value">{formatCurrency(project.budget)}</div>
        </div>
        <div className="card">
          <div className="card-title">Earned</div>
          <div className="card-value" style={{ color: 'var(--success)' }}>
            {formatCurrency(project.earnedAmount)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Deadline</div>
          <div className="card-value" style={{ fontSize: '1.1rem' }}>
            {formatDate(project.deadline)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Task Progress</div>
          <div className="card-value" style={{ fontSize: '1.1rem' }}>
            {project.progress}%
          </div>
          <ProgressBar value={project.progress} variant="success" />
        </div>
      </div>

      {project.description && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-title">Description</div>
          <p>{project.description}</p>
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>
              Milestones ({doneMilestones}/{project.milestones.length})
            </h3>
          </div>
          <ProgressBar value={milestoneProgress} label="Milestone Progress" variant="success" />
          <div className="milestone-list" style={{ marginTop: '1rem' }}>
            {project.milestones.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No milestones added</p>
            ) : (
              project.milestones.map((m) => (
                <div
                  key={m._id}
                  className={`milestone-item ${m.completed ? 'completed' : ''}`}
                  onClick={() => handleToggleMilestone(m._id)}
                >
                  <div className="milestone-checkbox">{m.completed ? '✓' : ''}</div>
                  <div>
                    <div className="milestone-title">{m.title}</div>
                    {m.dueDate && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Due: {formatDate(m.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Tasks ({project.tasks?.length || 0})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
              + Add Task
            </button>
          </div>
          <div className="task-list">
            {!project.tasks || project.tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tasks yet</p>
            ) : (
              project.tasks.map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{task.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <span className={`badge badge-${task.status}`}>{task.status}</span>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    {task.status !== 'done' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          handleTaskStatus(task._id, task.status === 'todo' ? 'in-progress' : 'done')
                        }
                      >
                        {task.status === 'todo' ? 'Start' : 'Done'}
                      </button>
                    )}
                    {task.status === 'done' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleTaskStatus(task._id, 'todo')}
                      >
                        Reopen
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <ProjectForm
              initial={project}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Task</h2>
            <TaskForm onSubmit={handleAddTask} onCancel={() => setShowTaskModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
