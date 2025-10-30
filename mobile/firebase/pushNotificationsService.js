import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and get push token
 */
export const registerForPushNotifications = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token: permission denied');
      return null;
    }

    // Get push token (requires EAS projectId in managed/bare workflows)
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log('No Expo EAS projectId configured. Add extra.eas.projectId to app.json');
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    console.log('Push token:', token.data);

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'ITUFK Bildirimleri',
        description: 'ITUFK uygulamasından gelen bildirimler',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B00',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Save push token to user's Firestore document
 */
export const savePushToken = async (userId, pushToken) => {
  try {
    if (!userId || !pushToken) return;

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      pushToken,
      lastTokenUpdate: new Date().toISOString(),
    }, { merge: true });

    console.log('Push token saved for user:', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

/**
 * Remove push token when user logs out
 */
export const removePushToken = async (userId) => {
  try {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      pushToken: null,
      lastTokenUpdate: new Date().toISOString(),
    }, { merge: true });

    console.log('Push token removed for user:', userId);
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};

/**
 * Send a local notification (for when app is in foreground)
 */
export const showLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
};

/**
 * Send push notification to specific users
 * This should ideally be done from a backend/cloud function for security
 * For now, this is a client-side implementation
 */
export const sendPushNotification = async (pushTokens, title, body, data = {}) => {
  try {
    const messages = pushTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return null;
  }
};

/**
 * Get user's push tokens from Firestore
 */
export const getUserPushTokens = async (userIds) => {
  try {
    const tokens = [];
    
    for (const userId of userIds) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists() && userSnap.data().pushToken) {
        tokens.push(userSnap.data().pushToken);
      }
    }
    
    return tokens;
  } catch (error) {
    console.error('Error getting push tokens:', error);
    return [];
  }
};

