const express = require('express');
const router = express.Router();
const { 
  updatePropertyStatus, 
  getActivityLogs, 
  getUsers,
  updateUserStatus,
  getDashboardStats,
  createUser,
  updateUser,
  deleteUser,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // Only admins can access these routes

router.get('/stats', getDashboardStats);
router.put('/properties/:id/status', updatePropertyStatus);
router.get('/logs', getActivityLogs);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);

router.get('/plans', getSubscriptionPlans);
router.post('/plans', createSubscriptionPlan);
router.put('/plans/:id', updateSubscriptionPlan);
router.delete('/plans/:id', deleteSubscriptionPlan);

module.exports = router;
