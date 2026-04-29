/**
 * JK Global Translations — Backend API
 * Node.js + Express
 * Endpoints: POST /contact
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const LEADS_FILE = path.join(__dirname, 'leads.json');

// ---- MIDDLEWARE ----
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- HELPERS ----
const loadLeads = () => {
  try {
    if (!fs.existsSync(LEADS_FILE)) return [];
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch { return []; }
};

const saveLead = (lead) => {
  const leads = loadLeads();
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
};

// ---- EMAIL TRANSPORTER (configure with your credentials) ----
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your_email@gmail.com',
    pass: process.env.SMTP_PASS || 'your_app_password',
  },
});

// ---- VALIDATION ----
const validate = ({ name, email, projectType, message }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required.');
  if (!projectType) errors.push('Project type is required.');
  if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters.');
  return errors;
};

// ---- ROUTES ----

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'JK Global Translations API', version: '1.0.0' });
});

// Contact form submission
app.post('/contact', async (req, res) => {
  const { name, email, projectType, message } = req.body;

  // Validate
  const errors = validate({ name, email, projectType, message });
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const lead = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    projectType,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    ip: req.ip,
  };

  // Save lead to JSON
  try {
    saveLead(lead);
  } catch (err) {
    console.error('Lead save error:', err);
  }

  // Send email notification (non-blocking)
  const sendMail = async () => {
    try {
      const mailOptions = {
        from: `"JK Global Translations" <${process.env.SMTP_USER || 'noreply@jkglobaltranslations.com'}>`,
        to: process.env.NOTIFY_EMAIL || 'jatin@jkglobaltranslations.com',
        subject: `🌐 New Lead: ${projectType} — ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h2 style="color: #4f8ef7; margin-bottom: 24px;">New Quote Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; color: #94a3b8; width: 140px;">Name</td><td style="padding: 10px 0; font-weight: 600;">${lead.name}</td></tr>
              <tr><td style="padding: 10px 0; color: #94a3b8;">Email</td><td style="padding: 10px 0;"><a href="mailto:${lead.email}" style="color: #4f8ef7;">${lead.email}</a></td></tr>
              <tr><td style="padding: 10px 0; color: #94a3b8;">Service</td><td style="padding: 10px 0;">${lead.projectType}</td></tr>
              <tr><td style="padding: 10px 0; color: #94a3b8; vertical-align: top;">Message</td><td style="padding: 10px 0; line-height: 1.6;">${lead.message}</td></tr>
              <tr><td style="padding: 10px 0; color: #94a3b8;">Time</td><td style="padding: 10px 0;">${new Date(lead.timestamp).toLocaleString()}</td></tr>
            </table>
            <p style="margin-top: 32px; font-size: 12px; color: #475569;">JK Global Translations API · Lead ID: ${lead.id}</p>
          </div>
        `,
      };

      // Also send auto-reply to client
      const autoReply = {
        from: `"JK Global Translations" <${process.env.SMTP_USER}>`,
        to: lead.email,
        subject: `We received your request — JK Global Translations`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h2 style="color: #4f8ef7;">Thank you, ${lead.name}!</h2>
            <p style="line-height: 1.7; color: #94a3b8;">We've received your request for <strong style="color: #e2e8f0;">${lead.projectType}</strong> services. Our team will review your project details and get back to you within <strong style="color: #1dd8a0;">2 business hours</strong>.</p>
            <p style="line-height: 1.7; color: #94a3b8;">In the meantime, feel free to reply to this email with any additional details.</p>
            <p style="margin-top: 32px; color: #94a3b8;">Best regards,<br><strong style="color: #e2e8f0;">Jatin Kumar</strong><br>Founder & Translation Specialist<br>JK Global Translations</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      await transporter.sendMail(autoReply);
    } catch (err) {
      console.error('Email error:', err.message);
    }
  };

  sendMail(); // Fire and forget

  return res.status(200).json({
    success: true,
    message: 'Your message has been received. We\'ll respond within 2 hours.',
    leadId: lead.id,
  });
});

// Get all leads (protected — add auth in production!)
app.get('/leads', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.json({ success: true, leads: loadLeads() });
});

// ---- START ----
app.listen(PORT, () => {
  console.log(`\n🌐 JK Global Translations API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   Contact: POST http://localhost:${PORT}/contact\n`);
});
