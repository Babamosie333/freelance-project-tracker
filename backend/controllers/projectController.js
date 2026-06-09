const Project = require('../models/Project');
const Task = require('../models/Task');

const enrichProjects = async (projects) =>
  Promise.all(
    projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter((t) => t.status === 'done').length;
      const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
      const totalMilestones = project.milestones.length;
      const doneMilestones = project.milestones.filter((m) => m.completed).length;

      return {
        ...project.toObject(),
        taskCount: totalTasks,
        doneTaskCount: doneTasks,
        progress,
        milestoneProgress:
          totalMilestones === 0 ? 0 : Math.round((doneMilestones / totalMilestones) * 100),
      };
    })
  );

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const projectsWithProgress = await enrichProjects(projects);
    res.json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ projectId: project._id }).sort({ createdAt: -1 });
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    res.json({ ...project.toObject(), tasks, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, userId: req.user._id });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const project = await Project.findOne({ _id: projectId, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.completed = !milestone.completed;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ projectId: { $in: projectIds } });

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalEarned = projects.reduce((sum, p) => sum + p.earnedAmount, 0);
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;

    const earningsByMonth = {};
    projects.forEach((p) => {
      const month = new Date(p.createdAt).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      earningsByMonth[month] = (earningsByMonth[month] || 0) + p.earnedAmount;
    });

    const earningsChart = Object.entries(earningsByMonth).map(([month, earnings]) => ({
      month,
      earnings,
    }));

    const projectEarnings = projects.map((p) => ({
      name: p.projectName,
      budget: p.budget,
      earned: p.earnedAmount,
    }));

    res.json({
      userName: req.user.name,
      totalBudget,
      totalEarned,
      pendingEarnings: totalBudget - totalEarned,
      activeProjects,
      completedProjects,
      totalProjects: projects.length,
      totalTasks,
      doneTasks,
      taskCompletionRate: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
      earningsChart,
      projectEarnings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
