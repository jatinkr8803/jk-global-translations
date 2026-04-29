# JK Global Translations — Complete Website

Premium translation agency website built for Jatin Kumar.

---

## 📁 Folder Structure

```
jk-global-translations/
├── frontend/
│   ├── index.html       ← Main website (all sections)
│   ├── styles.css       ← Premium dark theme CSS
│   └── script.js        ← Animations, slider, form logic
│
├── backend/
│   ├── server.js        ← Express API (contact form + leads)
│   ├── package.json     ← Dependencies
│   ├── .env.example     ← Environment variables template
│   └── leads.json       ← Auto-created when first lead arrives
│
└── README.md            ← This file
```

---

## 🚀 DEPLOYMENT GUIDE

### STEP 1 — Deploy Backend (Render.com — FREE)

1. Create a free account at https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (push this folder first)
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add Environment Variables (in Render dashboard → Environment):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   NOTIFY_EMAIL=jatin@jkglobaltranslations.com
   FRONTEND_URL=https://your-netlify-url.netlify.app
   ADMIN_KEY=supersecretrandomkey123
   ```
6. Click **"Create Web Service"**
7. Copy your Render URL (e.g. `https://jk-translations-api.onrender.com`)

### STEP 2 — Configure Frontend API URL

Open `frontend/script.js` and update line ~70:
```javascript
const API_URL = window.API_URL || 'https://jk-translations-api.onrender.com';
```

OR add this line to your HTML before `<script src="script.js">`:
```html
<script>window.API_URL = 'https://jk-translations-api.onrender.com';</script>
```

### STEP 3 — Deploy Frontend (Netlify — FREE)

**Option A — Drag & Drop (Easiest):**
1. Go to https://netlify.com → Sign up / Log in
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag the `frontend/` folder into the drop zone
4. Done! You'll get a URL like `https://amazing-name-123.netlify.app`

**Option B — GitHub (Recommended for updates):**
1. Push your project to GitHub
2. Netlify → "Import from Git" → Select repo
3. Publish directory: `frontend`
4. Click "Deploy"

### STEP 4 — Set Up Gmail (for email notifications)

1. Go to your Google Account → Security
2. Enable **2-Factor Authentication**
3. Search "App passwords" → Create one for "Mail"
4. Copy the 16-character password
5. Set `SMTP_PASS=xxxx xxxx xxxx xxxx` in Render environment

---

## 📧 Email Features

When someone submits the contact form:
1. ✅ Lead is saved to `leads.json` on the server
2. ✅ You receive an email notification with all details
3. ✅ The client receives a professional auto-reply

---

## 📊 Viewing Your Leads

```bash
curl -H "x-api-key: your_admin_key" https://your-api.onrender.com/leads
```

---

## 🛠 Local Development

### Run Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Open Frontend:
```bash
# Simply open frontend/index.html in your browser
# Or use Live Server in VS Code
```

### Test Contact Form:
```bash
curl -X POST http://localhost:3001/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","projectType":"MTPE","message":"This is a test project submission."}'
```

---

## 🎨 Customizations

| What | Where |
|------|-------|
| Founder photo | Replace the SVG placeholder in `index.html` with `<img src="jatin.jpg">` |
| Real email | Set `SMTP_USER` and `NOTIFY_EMAIL` in `.env` |
| Contact email shown | Search `hello@jkglobaltranslations.com` in `index.html` |
| Backend API URL | Update `API_URL` in `script.js` |
| Brand colors | Edit CSS variables in `styles.css` (`:root` block) |
| Add Google Analytics | Paste GA script tag before `</head>` in `index.html` |

---

## ✅ Features Checklist

- [x] Dark premium UI (#080e1a theme)
- [x] Hero with animated orbs + gradient text
- [x] Trust logos section
- [x] 9 service cards with hover effects
- [x] Tools & Technologies grid (CAT, MT, DTP, QA)
- [x] Industries section
- [x] Animated statistics counters
- [x] Founder section with bio
- [x] Auto-playing testimonials slider
- [x] Contact form with validation
- [x] Express backend API
- [x] Lead storage (JSON file)
- [x] Email notifications (Nodemailer)
- [x] Auto-reply to clients
- [x] Scroll reveal animations
- [x] Mobile responsive
- [x] Deployment ready

---

Built for **JK Global Translations** · Founded by **Jatin Kumar**
