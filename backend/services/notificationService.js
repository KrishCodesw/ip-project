// This file will handle all our communication logic

require('dotenv').config();
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

// --- Twilio SMS Setup ---
// We initialize the client with the keys from our .env file
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends an SMS using Twilio
 * @param {string} to - The recipient's phone number (e.g., +15551234567)
 * @param {string} message - The text message to send
 */
const sendSms = async (to, message) => {
  try {
    await twilioClient.messages.create({
      body: `Reminder: ${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log(`SMS sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error.message);
    // Return structured failure so caller can decide what to do
    return { success: false, error: error.message };
  }
};


// --- SendGrid Email Setup ---
// We set the API key from our .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an Email using Twilio SendGrid
 * @param {string} to - The recipient's email address
 * @param {string} message - The text message to send
 */
const sendEmail = async (to, message) => {
  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_EMAIL, // This MUST be your verified sender email
    subject: 'Your Reminder',
    text: `This is a reminder: ${message}`,
    html: `<p>This is a reminder:</p><strong>${message}</strong>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    if (error.response) {
      console.error(error.response.body);
      return { success: false, error: JSON.stringify(error.response.body) };
    }
    return { success: false, error: error.message };
  }
};

// We export both functions to be used elsewhere in our app
module.exports = { sendSms, sendEmail };

