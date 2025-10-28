const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  remindAt: {
    type: Date,
    required: true,
  },
  recipientEmail: {
    type: String,
  },
  recipientPhone: {
    type: String,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
  },
  failed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// This validation ensures that at least one contact method is provided
reminderSchema.path('recipientEmail').validate(function (value) {
  return this.recipientEmail || this.recipientPhone;
}, 'At least one recipient (email or phone) is required.');

reminderSchema.path('recipientPhone').validate(function (value) {
  return this.recipientEmail || this.recipientPhone;
}, 'At least one recipient (email or phone) is required.');


module.exports = mongoose.model('Reminder', reminderSchema);

