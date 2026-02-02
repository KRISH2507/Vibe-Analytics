# Vibe Analytics - Setup Guide

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Google OAuth credentials
- Groq API key
- Razorpay account (for payments)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your credentials:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GROQ_API_KEY` - From Groq dashboard
- `SMTP_USER` & `SMTP_PASS` - Gmail credentials for email
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - From Razorpay dashboard

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.example frontend/.env.local
```

### 3. Database Setup

The database schema will be created automatically on first run. See `backend/src/db/schema.sql` for the structure.

### 4. Start Development Servers

**Option 1: Both servers at once (Windows)**
```bash
start-all.bat
```

**Option 2: Manually**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Servers will be running at:**
- Backend: http://localhost:5000
- Frontend: http://localhost:8081

## 📦 Project Structure

```
Vibe-Analytics/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── auth/     # Authentication (Google OAuth, OTP)
│   │   ├── controllers/  # Route handlers
│   │   ├── services/ # Business logic (Groq AI, Mastodon)
│   │   ├── payments/ # Razorpay integration
│   │   ├── db/       # Database setup & migrations
│   │   └── server.ts
│   └── package.json
│
├── frontend/         # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/  # UI components
│   │   ├── api/      # API client functions
│   │   └── hooks/    # Custom React hooks
│   └── package.json
│
├── .github/          # GitHub Actions (if any)
├── README.md
└── start-all.bat     # Quick start script
```

## 🔑 Getting API Keys

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

### Groq AI
1. Sign up at [Groq Console](https://console.groq.com/)
2. Generate an API key
3. Model used: `llama-3.3-70b-versatile`

### Razorpay
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get test keys from Settings → API Keys
3. Use test cards for development

### Neon PostgreSQL
1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string

## 🧪 Testing Payments

Use Razorpay test card:
- Card: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

## 📝 Features

- ✅ Google OAuth authentication
- ✅ AI-powered sentiment analysis (Groq)
- ✅ Real-time social media data (Mastodon)
- ✅ Usage limits (Free: 3 searches, Pro: 1000)
- ✅ Payment integration (Razorpay)
- ✅ Search history & reports
- ✅ Trending topics dashboard

## 🆘 Troubleshooting

**Backend won't start?**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is accessible
- Verify all .env variables are set

**Frontend can't connect to backend?**
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env.local

**Payment issues?**
- Verify Razorpay test keys are correct
- Check browser console for errors
- Ensure Razorpay script is loaded (check Network tab)

## 📚 Documentation

- [Razorpay Setup](./RAZORPAY_SETUP.md) - Detailed payment integration guide
- [Payment Fix](./PAYMENT_FIX.md) - Recent payment fixes

## 📄 License

MIT License - See LICENSE file for details
