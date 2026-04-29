/**
 * JK Global Translations — Backend API
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const LEADS_FILE = path.join(__dirname, 'leads.json');

// ---- SAFE RESEND IMPORT (IMPORTANT FIX) ----
let Resend;
let resend = null;

try {
  ({ Resend } = require('resend'));
} catch (err) {
  console.error("❌ Failed to load resend:", err.message);
}

// ---- INIT RESEND ----
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY missing");
} else if (Resend) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend initialized");
  } catch (err) {
    console.error("❌ Resend init error:", err.message);
  }
}

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

// Health
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'JK Global API' });
});

// Contact
app.post('/contact', async (req, res) => {
  const { name, email, projectType, message } = req.body;

  const errors = validate({ name, email, projectType, message });
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const lead = {
    id: Date.now().toString(),
    name,
    email,
    projectType,
    message,
    timestamp: new Date().toISOString()
  };

  try {
    saveLead(lead);
  } catch (err) {
    console.error("Lead save error:", err);
  }

  // ---- EMAIL ----
  (async () => {
    try {
      if (!resend) {
        console.error("❌ Resend not initialized");
        return;
      }

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.NOTIFY_EMAIL,
        subject: `New Lead: ${name}`,
        html: `<p>${message}</p>`
      });

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'We received your request',
        html: `<p>Thanks ${name}, we will contact you soon.</p>`
      });

      console.log("✅ Emails sent");

    } catch (err) {
      console.error("❌ Email error:", err.message);
    }
  })();

  res.json({ success: true });
});

// Leads (protected)
app.get('/leads', (req, res) => {
  if (req.headers['x-api-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false });
  }
  res.json(loadLeads());
});

// ---- START ----
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});