const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleMilestone,
  getDashboardStats,
} = require('../controllers/projectController');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.patch('/:projectId/milestones/:milestoneId', toggleMilestone);

module.exports = router;
