# 🚀 MongoDB Backend Setup

Your portfolio site now has a **real MongoDB backend** instead of localStorage!

## 📋 What's New

- ✅ **MongoDB Database** - Real data persistence
- ✅ **JWT Authentication** - Secure admin access
- ✅ **RESTful API** - Professional backend architecture
- ✅ **Contact Form Storage** - Messages saved to database
- ✅ **Admin Dashboard** - View/manage all submissions

## 🛠️ Setup Instructions

### 1. **Start the Backend Server**

```bash
npm run server
```

This will start your Express server on port 5000.

### 2. **Start Both Frontend & Backend**

```bash
npm run dev:full
```

This runs both your React frontend (port 5173) and backend (port 5000) simultaneously.

### 3. **First-Time Admin Setup**

1. **Run the admin setup script:**

   ```bash
   npm run setup-admin
   ```

   This will create your admin account with default credentials:

   - Username: `admin`
   - Password: `admin123`

2. **Go to:** `http://localhost:5173/admin`
3. **Login** with the credentials from step 1
4. **Change your password** after first login (recommended)

## 🔐 Security Features

- **JWT Tokens** - Secure authentication
- **Password Hashing** - bcrypt encryption
- **Protected Routes** - Admin-only access
- **MongoDB Atlas** - Cloud database

## 📊 API Endpoints

| Endpoint           | Method | Description         |
| ------------------ | ------ | ------------------- |
| `/api/contact`     | POST   | Submit contact form |
| `/api/admin/login` | POST   | Admin login         |

| `/api/admin/messages` | GET | Get all messages |
| `/api/admin/stats` | GET | Get dashboard statistics |
| `/api/health` | GET | Server health check |

## 🗄️ Database Collections

### **Contacts Collection**

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  message: String,
  timestamp: Date,
  read: Boolean
}
```

### **Admins Collection**

```javascript
{
  _id: ObjectId,
  username: String,
  password: String (hashed),
  createdAt: Date
}
```

## 🌐 Environment Variables

Create a `.env` file (or use `config.env`):

```env
MONGODB_URI=mongodb+srv://millikifleyesus:UDJRZCy8oZEnl20h@web.pdksjp4.mongodb.net/portfolio
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## 🚨 Important Notes

1. **Admin Account**: Only one admin account can exist (created via setup script)
2. **JWT Secret**: Change the JWT secret in production
3. **MongoDB**: Your connection string is already configured
4. **CORS**: Backend allows frontend (localhost:5173) to connect
5. **No Signup**: Admin accounts can only be created via the setup script

## 🔧 Troubleshooting

### **Server Won't Start**

- Check if MongoDB connection string is correct
- Ensure port 5000 is available
- Check console for error messages

### **Can't Connect to Backend**

- Verify backend is running (`npm run server`)
- Check if frontend is calling correct URL
- Ensure CORS is properly configured

### **Admin Login Issues**

- Clear localStorage: `localStorage.clear()`
- Check if admin account exists
- Verify username/password

## 📱 Usage

1. **Contact Form**: Visitors submit messages → stored in MongoDB
2. **Admin Access**: You login at `/admin` → access dashboard
3. **Dashboard**: View, manage, and delete contact submissions
4. **Real-time**: Data updates immediately in database

## 🚀 Production Deployment

When deploying to production:

1. Change JWT_SECRET to a strong random string
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Set up proper MongoDB Atlas security rules

---

**🎉 Your portfolio now has enterprise-level backend functionality!**
