const express = require('express');
const {
  createLead,
  getLeads,
  updateLeadStatus
} = require('../controllers/leads');

const router = express.Router();

const { protect, optionalProtect, authorize } = require('../middleware/auth');

router.route('/')
  .post(optionalProtect, createLead)
  .get(protect, authorize('b2b', 'admin'), getLeads);

router.route('/:id/status')
  .put(protect, authorize('b2b', 'admin'), updateLeadStatus);

module.exports = router;
