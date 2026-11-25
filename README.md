# Campus Lost and Found Management Portal

**Live Website:** https://2403a51087-wq.github.io/sesd-project/

A clean, responsive B.Tech college project built with **HTML5, CSS3, Vanilla JavaScript, Vite, and Express.js**, styled after the Google Stitch *Campus Lost & Found Portal* design system.

## Features

- **Homepage (`index.html`)**: Hero search bar, quick CTAs (Browse Lost, Browse Found, Report Item), live portal statistics, recently lost & found items, and a 3-step How It Works guide.
- **Lost & Found Directories (`pages/lost-items.html`, `pages/found-items.html`)**: Live search by item name/description, category filter, campus location filter, date range filter, and sorting (newest/oldest/name).
- **Report Forms (`pages/report-lost.html`, `pages/report-found.html`)**: Input validation, image upload with live preview, campus location selector, storage location (for found items), and contact preference.
- **Item Details (`pages/item-details.html?id=...`)**: Full item specifications, status badge, **Claim This Item** (found) or **I Found This Item** (lost) action modal, and similar items section.
- **My Reports (`pages/my-reports.html`)**: Protected page with filter tabs (All, Lost, Found, Active, Resolved) and Edit, Delete, and Mark as Resolved actions.
- **Claim Requests (`pages/claims.html`)**: Protected page to view claim details, cancel submitted claims, or approve/reject incoming claims on items you reported.
- **Notifications (`pages/notifications.html`)**: Protected notification center for claim requests, approvals, rejections, status updates, and item matches with Mark as Read and Clear All.
- **Profile (`pages/profile.html`)**: Protected student profile with photo upload, Edit Profile, Change Password, and Logout.
- **Demo Authentication (`pages/login.html`, `pages/register.html`)**: LocalStorage-backed demo auth with protected-route redirects.
- **Express Health Route**: `GET /api/health` returns `{ "status": "ok", "message": "Campus Lost and Found Portal is running" }`.

## Project Structure

```text
.
├── package.json
├── vite.config.js
├── server.js
├── index.html
├── .gitignore
├── README.md
├── public/
│   ├── css/style.css
│   ├── js/
│   │   ├── storage.js
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── reports.js
│   │   └── app.js
│   └── assets/images/
└── pages/
    ├── login.html
    ├── register.html
    ├── lost-items.html
    ├── found-items.html
    ├── report-lost.html
    ├── report-found.html
    ├── item-details.html
    ├── my-reports.html
    ├── claims.html
    ├── notifications.html
    └── profile.html
```

## Installation

```bash
npm install
```

## Running the Project

- **Run Vite frontend dev server** (`http://localhost:5173`):
  ```bash
  npm run dev
  ```
- **Run Express server** (`http://localhost:3000`):
  ```bash
  npm run server
  ```
- **Run both Express and Vite together**:
  ```bash
  npm run start
  ```
- **Build for production**:
  ```bash
  npm run build
  ```

## Demo Login Credentials

- **Email**: `student@college.edu`
- **Password**: `student123`

> **Security Note**: This demo uses browser `localStorage` for educational demonstration only. Do not store plain-text passwords in client-side storage in a production application.
