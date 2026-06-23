# 🗂️ Personal CRM System

> **CODTECH Internship Project — Task 1**

---

## 📋 Project Info

| Field | Details |
|-------|---------|
| **Intern ID** | *(Add your Intern ID here)* |
| **Full Name** | *(Add your Full Name here)* |
| **No. of Weeks** | *(Add your internship duration)* |
| **Project Name** | Personal CRM System |
| **Domain** | Web Development / Full Stack |
| **Tech Stack** | HTML5, CSS3, Vanilla JavaScript, localStorage |

---

## 📌 Project Scope

A **Personal Contact Relationship Manager (CRM)** built as a fully client-side web application. It allows users to manage personal and professional contacts, track interactions, set follow-up reminders, and analyze networking patterns — all stored locally in the browser.

---

## ✨ Features

### 👤 Contact Management
- Add, edit, delete contacts
- Categorize: Work, Personal, Family, Client, Other
- Tags, birthday, company, job title, social links
- Grid & List view with sorting and filtering
- One-click contact detail popup

### 💬 Interaction Logging
- Log calls, emails, meetings, messages
- Sentiment tracking (Positive / Neutral / Negative)
- Follow-up flags
- Chronological timeline view with filters

### ⏰ Reminder System
- Set dated reminders linked to contacts
- Priority levels: High / Medium / Low
- Overdue detection with visual alerts
- Mark reminders as complete

### 📊 Analytics Dashboard
- Contacts by category bar chart
- Interactions by type chart
- 30-day activity chart
- Top 5 most-engaged contacts
- Contacts needing attention (30+ days no contact)

### 🔧 Other Features
- Global search across all contacts
- Export contacts to CSV
- Stats at a glance (dashboard)
- LocalStorage persistence (data saved in browser)
- Responsive design (mobile friendly)
- Dark theme UI

---

## 🚀 How to Run

1. **Download or clone** this repository
2. Open the `index.html` file directly in any modern browser
3. No server, no installation, no dependencies needed!

```bash
git clone https://github.com/YOUR_USERNAME/personal-crm.git
cd personal-crm
# Just open index.html in Chrome/Firefox/Edge
```

> 💡 Sample data loads automatically on first open so you can explore features right away.

---

## 📁 Project Structure

```
personal-crm/
├── index.html          # Main HTML — all layout & modals
├── css/
│   └── style.css       # Complete styling (dark theme, responsive)
├── js/
│   └── app.js          # All application logic (CRUD, charts, export)
├── screenshots/
│   ├── dashboard.png
│   ├── contacts.png
│   ├── interactions.png
│   ├── reminders.png
│   └── analytics.png
└── README.md           # This file
```

---

## 🗄️ Data Storage

All data is stored in the browser's **localStorage** under these keys:

| Key | Contains |
|-----|----------|
| `crm_contacts` | All contact records (JSON array) |
| `crm_interactions` | All interaction logs (JSON array) |
| `crm_reminders` | All reminders (JSON array) |

---

## 🖼️ Screenshots

*(Add screenshots of each section here after running the project)*

| Dashboard | Contacts |
|-----------|----------|
| ![Dashboard](screenshots/dashboard.png) | ![Contacts](screenshots/contacts.png) |

| Interactions | Analytics |
|-------------|-----------|
| ![Interactions](screenshots/interactions.png) | ![Analytics](screenshots/analytics.png) |

---

## 🔮 Possible Enhancements

- Firebase/Supabase backend for cloud sync
- Email integration (send from CRM)
- Import contacts from CSV/vCard
- Contact photo upload
- Birthday notifications
- Mobile app (React Native)

---

## 📜 License

This project was created as part of the **CODTECH IT Solutions** internship program.

---

*Built with ❤️ using pure HTML, CSS, and JavaScript — no frameworks, no build tools.*
