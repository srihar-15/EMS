
const Notification = require('../models/Notification');

// @desc    Get My Notifications
// @route   GET /api/notifications/my
const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(notifications);
};

// @desc    Mark as Read
// @route   PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  const notif = await Notification.findById(req.params.id);

  if (!notif) return res.status(404).json({ message: 'Not found' });
  if (notif.recipient.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  notif.isRead = true;
  await notif.save();
  res.json(notif);
};

module.exports = { getMyNotifications, markRead };
