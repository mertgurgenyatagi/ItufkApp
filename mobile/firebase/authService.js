import { db } from './config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom authentication service for password-based login
 * Each user has a unique password that maps to their profile
 */

// Generate a simple hash for password (in production, use bcrypt on backend)
const simpleHash = (password) => {
  // This is a placeholder - in production, use proper backend hashing
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

/**
 * Login user with password
 * @param {string} password - The user's unique password
 * @returns {Promise<Object>} User data if successful
 */
export const loginWithPassword = async (password) => {
  try {
    if (!password || password.trim() === '') {
      throw new Error('Şifre gereklidir');
    }

    const passwordHash = simpleHash(password);
    
    // Query users collection for matching password hash
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('passwordHash', '==', passwordHash));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Geçersiz şifre');
    }
    
    // Get the first matching user
    const userDoc = querySnapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };
    
    // Remove sensitive data before returning
    delete userData.passwordHash;
    
    // Store auth token (userId) in AsyncStorage
    await AsyncStorage.setItem('authToken', userData.id);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Check if user is already logged in
 * @returns {Promise<Object|null>} User data if logged in, null otherwise
 */
export const checkAuthStatus = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const userDataString = await AsyncStorage.getItem('userData');
    
    if (!authToken || !userDataString) {
      return null;
    }
    
    const userData = JSON.parse(userDataString);
    
    // Verify user still exists in database
    const userDoc = await getDoc(doc(db, 'users', authToken));
    if (!userDoc.exists()) {
      // User was deleted, clear local storage
      await logout();
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
};

/**
 * Logout current user
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current user data from storage
 * @returns {Promise<Object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (!userDataString) return null;
    return JSON.parse(userDataString);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Update user data in storage (after profile updates)
 * @param {Object} userData - Updated user data
 */
export const updateStoredUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Update stored user error:', error);
    throw error;
  }
};

