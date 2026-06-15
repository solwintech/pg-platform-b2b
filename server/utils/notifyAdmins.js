const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEventToUser } = require('./sse');

/**
 * Sends a notification to all admin users and emits a socket event.
 */
const notifyAdmins = async (req, message, type, relatedId) => {
  try {
    const admins = await User.find({ role: 'admin' });

    for (let admin of admins) {
      const newNotif = await Notification.create({
        user: admin._id,
        message,
        type,
        relatedId
      });

      sendEventToUser(req, admin._id, 'new_notification', newNotif);
    }
  } catch (err) {
    console.error('Failed to notify admins:', err);
  }
};

module.exports = notifyAdmins;
