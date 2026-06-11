# StockNova - MongoDB Setup Guide

This application has been configured to use MongoDB locally instead of Firebase for the database. Follow these steps to get started.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB installed and running locally

## Installation

1. **Install dependencies:**
```bash
npm install
```

## Setup MongoDB

### Option 1: Using MongoDB Community Edition

**On Windows:**
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will be installed and run as a Windows service by default
4. Verify it's running by connecting to `mongodb://localhost:27017`

**On macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**On Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Option 2: Using MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Update `backend/.env` with your MongoDB URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nova
```

## Running the Application

### Development Mode (with hot reload)

**Terminal 1 - Start the backend:**
```bash
npm run dev:backend
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Start the frontend:**
```bash
npm run dev
```
The frontend will run on `http://localhost:8080`

The frontend is configured to proxy API calls to the backend, so all requests to `/api/*` will be forwarded to the backend automatically.

### Production Mode

1. **Build the application:**
```bash
npm run build
```

2. **Start the backend:**
```bash
node backend/server.js
```

3. **Serve the frontend:**
```bash
npm run preview
```

## Database Structure

The MongoDB database `nova` contains the following collections:

- **categories** - Item categories
- **suppliers** - Vendor/supplier information
- **items** - Inventory items
- **stock_movements** - Stock movement history
- **notifications** - Low stock notifications
- **users** - User information
- **settings** - Application settings

## Environment Configuration

The `backend/.env` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/nova
PORT=5000
NODE_ENV=development
```

**Important:** Never commit `.env` to version control. It's listed in `.gitignore`.

## Testing the Connection

1. Start the backend:
```bash
npm run dev:backend
```

2. Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-06-11T10:30:00.000Z"}
```

## API Endpoints

All endpoints return data with an `id` field (MongoDB `_id` converted):

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Stock Movements
- `GET /api/stock-movements` - List all movements
- `POST /api/stock-movements` - Create movement
- `DELETE /api/stock-movements/:id` - Delete movement

### Notifications
- `GET /api/notifications` - List all notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings
- `GET /api/settings` - Get app settings
- `POST /api/settings` - Save app settings

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running: `mongosh` or use MongoDB Compass
- Check the connection string in `backend/.env`
- Ensure port 27017 is not blocked by firewall

### CORS Errors
- The backend is configured with CORS enabled
- If you still get errors, check that both frontend and backend are running
- Frontend runs on `http://localhost:8080`
- Backend runs on `http://localhost:5000`

### Port Already in Use
- Frontend: Change port in `vite.config.ts` (default: 8080)
- Backend: Change PORT in `backend/.env` (default: 5000)

## Migration from Firebase

The application has been updated to use MongoDB. All data previously stored in Firebase needs to be manually migrated or re-entered through the UI. The data structures are compatible with the same TypeScript interfaces used before.

## Firebase Authentication

The application still uses Firebase for authentication. Update `src/lib/firebase.ts` if needed, but database operations now use MongoDB.
