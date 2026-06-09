import { useState } from 'react';

const emptyMilestone = () => ({ title: '', dueDate: '', completed: false });

function ProjectForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    clientName: initial?.clientName || '',
    projectName: initial?.projectName || '',
    description: initial?.description || '',
    deadline: initial?.deadline ? initial.deadline.slice(0, 10) : '',
    budget: initial?.budget || '',
    status: initial?.status || 'active',
    earnedAmount: initial?.earnedAmount || 0,
    milestones: initial?.milestones?.length
      ? initial.milestones.map((m) => ({
          title: m.title,
          dueDate: m.dueDate ? m.dueDate.slice(0, 10) : '',
          completed: m.completed || false,
        }))
      : [emptyMilestone()],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMilestoneChange = (index, field, value) => {
    const milestones = [...form.milestones];
    milestones[index] = { ...milestones[index], [field]: value };
    setForm({ ...form, milestones });
  };

  const addMilestone = () => {
    setForm({ ...form, milestones: [...form.milestones, emptyMilestone()] });
  };

  const removeMilestone = (index) => {
    const milestones = form.milestones.filter((_, i) => i !== index);
    setForm({ ...form, milestones: milestones.length ? milestones : [emptyMilestone()] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      budget: Number(form.budget),
      earnedAmount: Number(form.earnedAmount),
      milestones: form.milestones
        .filter((m) => m.title.trim())
        .map((m) => ({
          title: m.title,
          dueDate: m.dueDate || undefined,
          completed: m.completed || false,
        })),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Client Name</label>
          <input name="clientName" value={form.clientName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Project Name</label>
          <input name="projectName" value={form.projectName} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Deadline</label>
          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Budget ($)</label>
          <input
            type="number"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Earned Amount ($)</label>
          <input
            type="number"
            name="earnedAmount"
            value={form.earnedAmount}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Milestones</label>
        {form.milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              placeholder="Milestone title"
              value={m.title}
              onChange={(e) => handleMilestoneChange(i, 'title', e.target.value)}
              style={{ flex: 2 }}
            />
            <input
              type="date"
              value={m.dueDate}
              onChange={(e) => handleMilestoneChange(i, 'dueDate', e.target.value)}
              style={{ flex: 1 }}
            />
            {form.milestones.length > 1 && (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeMilestone(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={addMilestone}>
          + Add Milestone
        </button>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;
