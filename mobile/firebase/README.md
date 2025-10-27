# Firebase Backend for İTÜ FK App

## 📁 Project Structure

\`\`\`
firebase/
├── README.md                   # This file
├── FIREBASE_SETUP.md          # Step-by-step Firebase setup guide
├── INTEGRATION_GUIDE.md       # How to integrate into your app
├── config.js                  # Firebase configuration
├── authService.js             # Authentication service
├── adminService.js            # Admin user management
├── eventsService.js           # Events CRUD operations
└── messagesService.js         # Messages & replies operations
\`\`\`

## 🚀 Quick Start

### 1. Set Up Firebase Project

Follow **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for complete instructions.

**TL;DR:**
1. Create Firebase project at console.firebase.google.com
2. Enable Firestore Database
3. Enable Storage
4. Copy config to `config.js`
5. Create initial users in Firestore

### 2. Integrate into App

Follow **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** for integration steps.

**TL;DR:**
1. Add login screen
2. Add authentication check on app load
3. Replace static data with Firebase calls
4. Add logout functionality

## 🎯 Features

### ✅ Authentication
- **Password-based login**: Each user has unique password
- **Persistent sessions**: Auto-login with stored tokens
- **Secure logout**: Clears all local data

### ✅ User Management (Admin)
- Create users with unique passwords
- Update user profiles
- Reset passwords
- Delete users
- View all users

### ✅ Events Management
- Create events with all details
- Update event information
- Delete events
- Upload event images
- Real-time synchronization
- Filter by date (past/future)

### ✅ Message Board
- Create messages
- Tag users
- Add replies
- Delete messages/replies
- Real-time updates
- Attachment support

### ✅ Storage
- Image uploads for events
- Automatic URL generation
- Delete old images

## 📊 Database Schema

### Users Collection
\`\`\`javascript
users/{userId}
├── name: string               // "Mert Gürgenyatağı"
├── role: string               // "Yönetim Kurulu Başkanı"
├── email: string              // "mert@itufk.com"
├── phone: string              // "+905551234567"
├── passwordHash: string       // Hashed password
├── isAdmin: boolean           // Admin privileges
└── createdAt: string          // ISO timestamp
\`\`\`

### Events Collection
\`\`\`javascript
events/{eventId}
├── name: string               // "Tanışma Toplantısı"
├── date: string               // "2025-10-12"
├── time: string               // "14:00"
├── location: string           // "İTÜ Merkez Kampüs"
├── text: string               // Event description
├── color: string              // "#6B8E9E"
├── hasImage: boolean          // true/false
├── imageUrl: string           // Firebase Storage URL
├── captain: string            // "Mert"
├── coCaptain: string          // "Ahmet"
├── createdBy: string          // User ID
├── createdAt: string          // ISO timestamp
└── updatedAt: string          // ISO timestamp
\`\`\`

### Messages Collection
\`\`\`javascript
messages/{messageId}
├── title: string              // "Toplantı Duyurusu"
├── content: string            // Message content
├── author: string             // User ID
├── tagged: array              // [userId1, userId2]
├── attachments: array         // [url1, url2]
├── replyCount: number         // Number of replies
├── createdAt: string          // ISO timestamp
└── updatedAt: string          // ISO timestamp
\`\`\`

### Replies Collection
\`\`\`javascript
replies/{replyId}
├── content: string            // Reply content
├── author: string             // User ID
├── messageId: string          // Parent message ID
└── createdAt: string          // ISO timestamp
\`\`\`

## 🔐 Security

### Current Setup (Development)
- Test mode security rules
- Simple password hashing
- Client-side authentication

### For Production
See FIREBASE_SETUP.md for:
- Strict Firestore security rules
- Storage access rules
- Proper password hashing (bcrypt)
- App Check configuration

## 💰 Cost Estimate

### Firebase Spark Plan (FREE)

**Firestore:**
- 1GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day

**Storage:**
- 1GB storage
- 10GB/month bandwidth

**For 10-15 active users:**
- Expected: ~1,000 reads/day
- Expected: ~100 writes/day
- Expected: ~50MB storage
- **Cost: FREE** ✅

## 📱 API Reference

### Authentication

\`\`\`javascript
import { loginWithPassword, checkAuthStatus, logout } from './firebase/authService';

// Login
const userData = await loginWithPassword('password123');

// Check if logged in
const user = await checkAuthStatus();

// Logout
await logout();
\`\`\`

### Events

\`\`\`javascript
import { 
  createEvent, 
  getAllEvents, 
  updateEvent, 
  deleteEvent,
  subscribeToEvents 
} from './firebase/eventsService';

// Create
const event = await createEvent(eventData, userId);

// Read
const events = await getAllEvents();

// Real-time
const unsubscribe = subscribeToEvents((events) => {
  console.log('Events updated:', events);
});

// Update
await updateEvent(eventId, { name: 'New Name' });

// Delete
await deleteEvent(eventId);
\`\`\`

### Messages

\`\`\`javascript
import { 
  createMessage, 
  getAllMessages, 
  addReply,
  subscribeToMessages 
} from './firebase/messagesService';

// Create message
const message = await createMessage(messageData, authorId);

// Add reply
const reply = await addReply(messageId, replyData, authorId);

// Real-time updates
const unsubscribe = subscribeToMessages((messages) => {
  console.log('Messages updated:', messages);
});
\`\`\`

### Admin

\`\`\`javascript
import { 
  createUser, 
  getAllUsers, 
  updateUser,
  resetUserPassword 
} from './firebase/adminService';

// Create user
const user = await createUser({
  name: 'Ahmet Yılmaz',
  role: 'Yönetim Kurulu Üyesi',
  email: 'ahmet@itufk.com'
}, 'password123');

// Get all users
const users = await getAllUsers();

// Reset password
await resetUserPassword(userId, 'newpassword');
\`\`\`

## 🧪 Testing

### Test Users

Create these users in Firestore for testing:

1. **Admin User**
   - Name: "Mert Gürgenyatağı"
   - Role: "Yönetim Kurulu Başkanı"
   - Password: "mert123"
   - Hash: "48430018"
   - isAdmin: true

2. **Regular User**
   - Name: "Ahmet Yılmaz"
   - Role: "Yönetim Kurulu Üyesi"
   - Password: "user123"
   - Hash: "-1421602370"
   - isAdmin: false

### Manual Testing Checklist

- [ ] Login with correct password
- [ ] Login with wrong password (should fail)
- [ ] Auto-login after app restart
- [ ] Create event
- [ ] Edit event
- [ ] Delete event
- [ ] Upload image (when implemented)
- [ ] Create message
- [ ] Add reply to message
- [ ] Logout
- [ ] Admin: Create new user
- [ ] Admin: Reset user password

## 🐛 Troubleshooting

### Common Errors

**"Permission denied"**
- Check Firestore rules
- Verify user is authenticated
- Check AsyncStorage for authToken

**"Module not found"**
- Run `npm install`
- Clear cache: `npm start -- --reset-cache`

**"Invalid password"**
- Verify password hash in Firestore
- Check simpleHash function
- Try creating new user

**Data not updating**
- Use subscribeToX functions for real-time
- Check internet connection
- Verify Firestore data exists

## 📖 Additional Documentation

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Storage Docs](https://firebase.google.com/docs/storage)
- [Security Rules](https://firebase.google.com/docs/rules)

## 🎯 Roadmap

### Phase 1: Basic Setup (Current)
- [x] Authentication system
- [x] Events CRUD
- [x] Messages CRUD
- [x] Basic user management

### Phase 2: Enhanced Features
- [ ] Image upload from mobile
- [ ] Push notifications
- [ ] Offline support
- [ ] Profile editing

### Phase 3: Advanced Features
- [ ] Admin web panel
- [ ] Analytics dashboard
- [ ] Export data
- [ ] Bulk operations

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review Firebase Console for errors
3. Test with Firebase Emulator (optional)

---

**Ready to get started?** 

👉 Follow **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** now!

