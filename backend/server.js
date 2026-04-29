/**
 * JK Global Translations — Backend API
 * Node.js + Express
 * Endpoints: POST /contact
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

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
  } catch {
    return [];
  }
};

const saveLead = (lead) => {
  const leads = loadLeads();
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
};

// ---- RESEND SETUP (SAFE INIT) ----
let resend = null;

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY missing");
} else {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend initialized");
  } catch (err) {
    console.error("❌ Resend init error:", err.message);
  }
}

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

  // Save lead
  try {
    saveLead(lead);
  } catch (err) {
    console.error('Lead save error:', err);
  }

  // Send email
  const sendMail = async () => {
    try {
      if (!resend) {
        console.error("❌ Resend not initialized");
        return;
      }

      // 📩 Admin notification
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.NOTIFY_EMAIL,
        subject: `🌐 New Lead: ${projectType} — ${name}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Service:</strong> ${lead.projectType}</p>
          <p><strong>Message:</strong> ${lead.message}</p>
          <p><strong>Time:</strong> ${new Date(lead.timestamp).toLocaleString()}</p>
        `,
      });

      // 📩 Auto reply
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: lead.email,
        subject: `We received your request — JK Global Translations`,
        html: `
          <h2>Thank you, ${lead.name}!</h2>
          <p>We’ve received your request for <strong>${lead.projectType}</strong>.</p>
          <p>Our team will contact you within 2 hours.</p>
          <br>
          <p>— JK Global Translations</p>
        `,
      });

      console.log('✅ Emails sent successfully');
    } catch (err) {
      console.error('❌ Email error:', err.message);
    }
  };

  sendMail();

  return res.status(200).json({
    success: true,
    message: "Your message has been received. We'll respond within 2 hours.",
    leadId: lead.id,
  });
});

// Protected leads route
app.get('/leads', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.json({ success: true, leads: loadLeads() });
});

// ---- START ----
app.listen(PORT, () => {
  console.log(`🌐 JK Global Translations API running on port ${PORT}`);
});