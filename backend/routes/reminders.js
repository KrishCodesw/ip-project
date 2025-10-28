const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our token-checking middleware
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendSms, sendEmail } = require('../services/notificationService');

// Admin: Get reminders that failed delivery (retryCount > 0 or failed true)
router.get('/failed', auth, async (req, res) => {
  try {
    // For now, return reminders for the logged-in user only. If you want admin access,
    // extend the User model/roles and check here.
    const reminders = await Reminder.find({ user: req.user.id, $or: [{ retryCount: { $gt: 0 } }, { failed: true }] });
    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reminders/:id/resend
// @desc    Attempt to re-send a reminder immediately (manual/admin action)
// @access  Private
router.post('/:id/resend', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ msg: 'Reminder not found' });

    // Ensure the logged-in user owns this reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to resend this reminder' });
    }

    if (reminder.isSent) {
      return res.status(400).json({ msg: 'Reminder already sent' });
    }

    const MAX_RETRIES = parseInt(process.env.MAX_REMINDER_RETRIES || '5', 10);

    if (!reminder.recipientEmail && !reminder.recipientPhone) {
      return res.status(400).json({ msg: 'Reminder has no recipient email or phone to resend' });
    }

    // Attempt delivery similar to cron job
    let emailResult = { success: false };
    let smsResult = { success: false };
    const errors = [];

    if (reminder.recipientEmail) {
      try {
        emailResult = await sendEmail(reminder.recipientEmail, reminder.message);
        if (!emailResult.success) errors.push(`email:${emailResult.error}`);
      } catch (e) {
        console.error('Unexpected error when sending email:', e);
        errors.push('email:Unexpected error');
      }
    }

    if (reminder.recipientPhone) {
      try {
        smsResult = await sendSms(reminder.recipientPhone, reminder.message);
        if (!smsResult.success) errors.push(`sms:${smsResult.error}`);
      } catch (e) {
        console.error('Unexpected error when sending sms:', e);
        errors.push('sms:Unexpected error');
      }
    }

    const delivered = (emailResult && emailResult.success) || (smsResult && smsResult.success);

    if (delivered) {
      reminder.isSent = true;
      reminder.lastError = undefined;
      reminder.retryCount = 0;
      reminder.failed = false;
      await reminder.save();
      return res.json({ msg: 'Reminder delivered', emailResult, smsResult });
    }

    // failure path
    reminder.retryCount = (reminder.retryCount || 0) + 1;
    reminder.lastError = errors.join('; ');
    if (reminder.retryCount >= MAX_RETRIES) {
      reminder.failed = true;
    }
    await reminder.save();

    return res.status(500).json({ msg: 'Failed to deliver reminder', emailResult, smsResult, lastError: reminder.lastError, retryCount: reminder.retryCount });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reminders
// @desc    Create a new reminder
// @access  Private (Requires user to be logged in)
router.post('/', auth, async (req, res) => {
  const { message, remindAt, recipientEmail, recipientPhone } = req.body;
  
  // Basic validation
  if (!message || !remindAt) {
    return res.status(400).json({ msg: 'Please provide a message and a reminder time.' });
  }
  if (!recipientEmail && !recipientPhone) {
     return res.status(400).json({ msg: 'At least one recipient (email or phone) is required.' });
  }

  try {
    const newReminder = new Reminder({
      message,
      remindAt: new Date(remindAt), // Convert string to Date object
      recipientEmail,
      recipientPhone,
      user: req.user.id, // This is CRITICAL: Associate the reminder with the logged-in user
    });

    const reminder = await newReminder.save();
    res.json(reminder); // Send the newly created reminder back to the client

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reminders
// @desc    Get all reminders for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all reminders where the 'user' field matches the logged-in user's ID
    // Sort by 'remindAt' in ascending order (earliest first)
    const reminders = await Reminder.find({ user: req.user.id });
    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reminders/:id
// @desc    Delete a reminder by its ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ msg: 'Reminder not found' });
    }

    // Security Check: Make sure the user owns this reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this reminder' });
    }

    // If all checks pass, delete the reminder
    await Reminder.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Reminder removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

