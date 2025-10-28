// --- 1. Imports ---
// require('dotenv') MUST be the first line
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const Reminder = require('./models/Reminder');
const { sendSms, sendEmail } = require('./services/notificationService');

// --- 2. App Initialization ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- 3. Middleware ---
app.use(cors());
app.use(express.json());

// Add middleware to log all requests and headers
// (Removed temporary request/header logging middleware)

// --- 4. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- 5. API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reminders', require('./routes/reminders'));

// --- 6. The Notification Scheduler ---
console.log('Scheduler started. Will check for reminders every minute.');
cron.schedule('* * * * *', async () => {
  const now = new Date();
  console.log(`Running cron job at ${now.toLocaleTimeString()}: Checking for reminders...`);

  try {
    const dueReminders = await Reminder.find({
      remindAt: { $lte: now },
      isSent: false,
    });

    if (dueReminders.length === 0) {
      console.log('No due reminders found.');
      return;
    }

    const MAX_RETRIES = parseInt(process.env.MAX_REMINDER_RETRIES || '5', 10);
    for (const reminder of dueReminders) {
      console.log(`Processing reminder ${reminder._id} for message: "${reminder.message}"`);
      // Attempt to send via both channels when available. Each function
      // returns { success: true } or { success: false, error }.
      let emailResult = { success: false };
      let smsResult = { success: false };
      const errors = [];

      if (reminder.recipientEmail) {
        try {
          emailResult = await sendEmail(reminder.recipientEmail, reminder.message);
          if (!emailResult.success) errors.push(`email:${emailResult.error}`);
        } catch (e) {
          console.error('Unexpected error when sending email:', e);
          errors.push(`email:Unexpected error`);
        }
      }

      if (reminder.recipientPhone) {
        try {
          smsResult = await sendSms(reminder.recipientPhone, reminder.message);
          if (!smsResult.success) errors.push(`sms:${smsResult.error}`);
        } catch (e) {
          console.error('Unexpected error when sending sms:', e);
          errors.push(`sms:Unexpected error`);
        }
      }

      const delivered = (emailResult && emailResult.success) || (smsResult && smsResult.success);

      if (delivered) {
        // Mark as sent to avoid re-delivery
        reminder.isSent = true;
        reminder.lastError = undefined;
        reminder.retryCount = 0;
        await reminder.save();
        console.log(`Reminder ${reminder._id} processed and marked as sent.`);
      } else {
        // Do not mark as sent. Increment retry counter and save last error.
        reminder.retryCount = (reminder.retryCount || 0) + 1;
        reminder.lastError = errors.join('; ');

        // If we've exceeded retries, mark as failed so it won't be retried endlessly
        if (reminder.retryCount >= MAX_RETRIES) {
          reminder.failed = true;
          console.error(`Reminder ${reminder._id} exceeded max retries (${MAX_RETRIES}). Marking as failed. Last errors: ${reminder.lastError}`);
        } else {
          console.error(`Failed to deliver reminder ${reminder._id}. Will retry later. Errors: ${reminder.lastError}`);
        }

        await reminder.save();
      }
    }

  } catch (error) {
    console.error('Error in cron job:', error.message);
  }
});

// --- 7. Start The Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

