# Quick Start Guide - MongoDB Integration

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start MongoDB
**Windows:**
- MongoDB should auto-start as a Windows service
- Or run: `mongosh` (if installed)

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

### Step 3: Run Backend (Terminal 1)
```bash
npm run dev:backend
```
✅ Should see: `Connected to MongoDB`  
✅ Backend running at: http://localhost:5000

### Step 4: Run Frontend (Terminal 2)
```bash
npm run dev
```
✅ Frontend running at: http://localhost:8080

### Step 5: Test It Works
1. Open http://localhost:8080
2. Sign in with your Firebase credentials
3. Try creating an item - it should save to MongoDB! ✨

---

## 📝 What Changed

| Before | After |
|--------|-------|
| Firebase Realtime DB | MongoDB (local) |
| `ref(db, "items")` | `api.items.getAll()` |
| Firebase config files | `.env` file |
| 1 server process | 2 server processes (frontend + backend) |

---

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Check if MongoDB is running: `mongosh`
- Make sure port 27017 is available

**"API errors in console"**
- Is backend running on port 5000?
- Is frontend running on port 8080?
- Check vite.config.ts has proxy configured

**"Port already in use"**
- Backend: Edit `backend/.env` PORT value
- Frontend: Edit `vite.config.ts` port value

---

## 📚 Documentation

- Full setup guide: See `MONGODB_SETUP.md`
- Implementation details: See `MONGODB_INTEGRATION_SUMMARY.md`

---

## ✅ Your App is Ready!

All database operations now use MongoDB. Start building! 🎉
