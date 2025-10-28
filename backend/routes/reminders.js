const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our token-checking middleware
const Reminder = require('../models/Reminder');
const User = require('../models/User');

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

