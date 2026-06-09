const Task = require('../models/Task');
const Project = require('../models/Project');

const getOwnedProject = async (projectId, userId) =>
  Project.findOne({ _id: projectId, userId });

const getTaskWithOwnership = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) return null;
  const project = await getOwnedProject(task.projectId, userId);
  if (!project) return null;
  return task;
};

exports.getTasksByProject = async (req, res) => {
  try {
    const project = await getOwnedProject(req.params.projectId, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ projectId: project._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const project = await getOwnedProject(req.body.projectId, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const existing = await getTaskWithOwnership(req.params.id, req.user._id);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const existing = await getTaskWithOwnership(req.params.id, req.user._id);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
