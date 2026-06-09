import { useState } from 'react';

function TaskForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      dueDate: form.dueDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Task Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
