# Firebase Integration Guide

## 📋 Overview

This guide shows you how to integrate Firebase authentication and data into your existing İTÜ FK App.

## 🔄 Integration Steps

### Step 1: Add Login Screen

Add this login screen component to your `App.js`:

\`\`\`javascript
// Add this function before the main return statement in App.js

const renderLogin = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userData = await loginWithPassword(password);
      
      // Login successful - reload app state
      const user = await checkAuthStatus();
      if (user) {
        // User is logged in, trigger app to show main content
        setShowMainPage(true);
      }
    } catch (err) {
      setError(err.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Animated.View style={[styles.loginBox, { opacity: logoFadeAnim }]}>
        <Image 
          source={require('./assets/itufklogo.png')} 
          style={styles.loginLogo}
        />
        <Text style={styles.loginTitle}>İTÜ Fotoğraf Kulübü</Text>
        <Text style={styles.loginSubtitle}>Yönetim Kurulu Uygulaması</Text>
        
        <TextInput
          style={[styles.loginInput, error && styles.loginInputError]}
          placeholder="Şifrenizi girin"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          editable={!loading}
        />
        
        {error ? (
          <Text style={styles.loginError}>{error}</Text>
        ) : null}
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.loginHelp}>
          Şifrenizi hatırlamıyor musunuz?{'\n'}
          Yönetim kurulu başkanı ile iletişime geçin.
        </Text>
      </Animated.View>
    </View>
  );
};
\`\`\`

### Step 2: Add Login Styles

Add these styles to your StyleSheet:

\`\`\`javascript
// Add to StyleSheet.create({...})

loginContainer: {
  flex: 1,
  backgroundColor: '#f5f5f5',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
loginBox: {
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 30,
  width: '100%',
  maxWidth: 400,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
},
loginLogo: {
  width: 100,
  height: 100,
  marginBottom: 20,
},
loginTitle: {
  fontFamily: 'Inter_18pt-Bold',
  fontSize: 24,
  color: '#000',
  marginBottom: 8,
  textAlign: 'center',
},
loginSubtitle: {
  fontFamily: 'Inter_18pt-Regular',
  fontSize: 14,
  color: '#666',
  marginBottom: 30,
  textAlign: 'center',
},
loginInput: {
  width: '100%',
  backgroundColor: '#f8f8f8',
  borderRadius: 10,
  padding: 15,
  fontFamily: 'Inter_18pt-Regular',
  fontSize: 16,
  color: '#000',
  borderWidth: 2,
  borderColor: '#e5e5e5',
  marginBottom: 10,
},
loginInputError: {
  borderColor: '#FF3B30',
},
loginError: {
  fontFamily: 'Inter_18pt-Regular',
  fontSize: 14,
  color: '#FF3B30',
  marginBottom: 15,
  textAlign: 'center',
},
loginButton: {
  width: '100%',
  backgroundColor: '#007AFF',
  borderRadius: 10,
  padding: 15,
  alignItems: 'center',
  marginBottom: 20,
},
loginButtonDisabled: {
  backgroundColor: '#ccc',
},
loginButtonText: {
  fontFamily: 'Inter_18pt-Bold',
  fontSize: 16,
  color: '#fff',
},
loginHelp: {
  fontFamily: 'Inter_18pt-Regular',
  fontSize: 12,
  color: '#999',
  textAlign: 'center',
  lineHeight: 18,
},
\`\`\`

### Step 3: Add Firebase Imports

At the top of your `App.js`, add:

\`\`\`javascript
import { loginWithPassword, checkAuthStatus, logout } from './firebase/authService';
import { getCurrentUser } from './firebase/authService';
\`\`\`

### Step 4: Add Authentication Check

Modify your component to check authentication on load:

\`\`\`javascript
export default function App() {
  // ... existing state ...
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const user = await checkAuthStatus();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setShowMainPage(true);
      }
      setCheckingAuth(false);
    };
    
    if (fontsLoaded) {
      checkAuth();
    }
  }, [fontsLoaded]);

  // ... rest of your code ...
\`\`\`

### Step 5: Modify Main Return Statement

Update the main return to show login screen if not authenticated:

\`\`\`javascript
// At the end of App component, before final return

if (!fontsLoaded || checkingAuth) {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar style="auto" />
    </View>
  );
}

// If not authenticated, show login
if (!isAuthenticated) {
  return renderLogin();
}

// If authenticated, show main app (existing code)
if (showMainPage) {
  return (
    // ... your existing SafeAreaView with main app ...
  );
}

// Splash screen (existing code)
return (
  // ... your existing splash screen ...
);
\`\`\`

### Step 6: Add Logout Functionality

Add a logout button to your settings or menu:

\`\`\`javascript
const handleLogout = async () => {
  try {
    await logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowMainPage(false);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Add to your settings page or sidebar menu:
<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
  <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
</TouchableOpacity>
\`\`\`

## 🔄 Migrating to Firebase Data

### Events Data

Replace your static `eventsData` array with Firebase:

\`\`\`javascript
import { getAllEvents, subscribeToEvents } from './firebase/eventsService';

// In your component:
const [eventsData, setEventsData] = useState([]);

useEffect(() => {
  // Option 1: Load once
  const loadEvents = async () => {
    const events = await getAllEvents();
    setEventsData(events);
  };
  loadEvents();

  // Option 2: Real-time updates (recommended)
  const unsubscribe = subscribeToEvents((events) => {
    setEventsData(events);
  });

  return () => unsubscribe();
}, []);
\`\`\`

### Messages Data

Similarly for messages:

\`\`\`javascript
import { getAllMessages, subscribeToMessages } from './firebase/messagesService';

const [messagesData, setMessagesData] = useState([]);

useEffect(() => {
  // Real-time updates
  const unsubscribe = subscribeToMessages((messages) => {
    setMessagesData(messages);
  });

  return () => unsubscribe();
}, []);
\`\`\`

### Creating Events

Update your event creation to use Firebase:

\`\`\`javascript
import { createEvent } from './firebase/eventsService';

const handleCreateEvent = async () => {
  if (!eventName.trim()) {
    setEventNameError(true);
    return;
  }

  try {
    await createEvent({
      name: eventName,
      date: eventDate ? eventDate.toISOString().split('T')[0] : null,
      captain: eventCaptain,
      coCaptain: eventBackupCaptain,
    }, currentUser.id);

    // Reset form
    setEventName('');
    setEventDate(null);
    setEventCaptain('');
    setEventBackupCaptain('');
    setEventNameError(false);
    navigateToPage('events');
  } catch (error) {
    console.error('Create event error:', error);
    alert('Etkinlik oluşturulurken bir hata oluştu');
  }
};
\`\`\`

### Updating Events

\`\`\`javascript
import { updateEvent } from './firebase/eventsService';

const handleSaveChanges = async () => {
  try {
    await updateEvent(selectedEvent.id, {
      name: eventName,
      date: eventDate ? eventDate.toISOString().split('T')[0] : null,
      time: eventTime,
      location: eventLocation,
      text: eventText,
      captain: eventCaptain,
      coCaptain: eventCoCaptain,
    });

    navigateToPage('eventDetail');
  } catch (error) {
    console.error('Update event error:', error);
    alert('Etkinlik güncellenirken bir hata oluştu');
  }
};
\`\`\`

### Deleting Events

\`\`\`javascript
import { deleteEvent } from './firebase/eventsService';

const handleDeleteEvent = async () => {
  try {
    await deleteEvent(selectedEvent.id);
    navigateToPage('events');
  } catch (error) {
    console.error('Delete event error:', error);
    alert('Etkinlik silinirken bir hata oluştu');
  }
};
\`\`\`

## 🎯 Using Current User Data

Access the current user's information:

\`\`\`javascript
// Display user name in dashboard
<Text style={styles.userName}>{currentUser?.name || 'Mert'}</Text>

// Display user role
<Text style={styles.profileRole}>{currentUser?.role || 'Yönetim Kurulu Üyesi'}</Text>

// Check if user is admin
const isAdmin = currentUser?.isAdmin || false;

// Show admin-only features
{isAdmin && (
  <TouchableOpacity onPress={handleAdminAction}>
    <Text>Admin İşlemi</Text>
  </TouchableOpacity>
)}
\`\`\`

## 📊 Testing Your Integration

1. Set up Firebase (follow FIREBASE_SETUP.md)
2. Create a test user in Firestore
3. Run your app
4. Try logging in with the test password
5. Verify data loads from Firebase
6. Try creating/editing/deleting events
7. Test logout functionality

## 🐛 Common Issues

### "Cannot find module './firebase/authService'"
- Make sure all Firebase files are in `mobile/firebase/` directory
- Run `npm start -- --reset-cache`

### "Permission denied" when accessing Firestore
- Check Firebase security rules
- Verify user is authenticated (check AsyncStorage for authToken)

### Events not updating in real-time
- Use `subscribeToEvents` instead of `getAllEvents`
- Make sure you're calling the unsubscribe function on unmount

### Login screen not showing
- Check the conditional rendering logic in main return statement
- Verify `isAuthenticated` state is properly set

## 📝 Next Steps

After basic integration:

1. Add image upload for events
2. Implement message board with replies
3. Add notifications system
4. Create admin panel for user management
5. Add profile editing
6. Implement search functionality

## 🆘 Need Help?

If you encounter issues:
1. Check browser/app console for errors
2. Verify Firebase configuration
3. Check Firestore rules
4. Test API calls in Firebase Console

Your Firebase backend is ready! The structure supports:
- ✅ Authentication
- ✅ Events management
- ✅ Messages & replies
- ✅ Image uploads
- ✅ Real-time synchronization
- ✅ User management

