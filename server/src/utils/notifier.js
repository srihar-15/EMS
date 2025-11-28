
const Notification = require('../models/Notification');

const notify = async (recipientId, type, message, link = '') => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      message,
      link,
      isRead: false
    });
  } catch (error) {
    console.error('Notification Failed:', error);
  }
};

module.exports = notify;
