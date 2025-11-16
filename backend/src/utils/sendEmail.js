const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (text)
 * @param {string} options.html - Email message (HTML)
 */
const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};

/**
 * Generate email templates
 */
const emailTemplates = {
  issueCreated: (issue, user) => ({
    subject: 'Issue Reported Successfully - CivicSync',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Issue Reported Successfully</h2>
        <p>Dear ${user.name},</p>
        <p>Your issue has been successfully reported and is now being reviewed by our team.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${issue.title}</h3>
          <p><strong>Category:</strong> ${issue.category}</p>
          <p><strong>Status:</strong> ${issue.status}</p>
          <p><strong>Location:</strong> ${issue.location.address}</p>
        </div>
        <p>We'll keep you updated on the progress.</p>
        <p>Thank you for helping make our city better!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">CivicSync - Smart City Issue Reporting</p>
      </div>
    `
  }),

  issueStatusUpdate: (issue, user, newStatus) => ({
    subject: `Issue Status Updated: ${newStatus} - CivicSync`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Issue Status Updated</h2>
        <p>Dear ${user.name},</p>
        <p>The status of your reported issue has been updated.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${issue.title}</h3>
          <p><strong>New Status:</strong> <span style="color: #10b981;">${newStatus.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${issue.category}</p>
        </div>
        <p>Thank you for your patience!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">CivicSync - Smart City Issue Reporting</p>
      </div>
    `
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to CivicSync!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to CivicSync!</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for joining CivicSync - your voice in making our city better!</p>
        <p>With CivicSync, you can:</p>
        <ul>
          <li>Report civic issues in your area</li>
          <li>Track the status of your reports</li>
          <li>View issues on an interactive map</li>
          <li>Engage with your community</li>
        </ul>
        <p>Let's work together to build a smarter, better city!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">CivicSync - Smart City Issue Reporting</p>
      </div>
    `
  })
};

module.exports = { sendEmail, emailTemplates };