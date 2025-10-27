import { db } from './config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

/**
 * Admin service for managing users and data
 * Only accessible to admin users
 */

// Generate a simple hash for password (in production, use bcrypt on backend)
const simpleHash = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data
 * @param {string} userData.name - User's full name
 * @param {string} userData.role - User's role in the club
 * @param {string} userData.email - User's email
 * @param {string} userData.phone - User's phone number
 * @param {string} password - User's unique password
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (userData, password) => {
  try {
    if (!password || password.trim() === '') {
      throw new Error('Şifre gereklidir');
    }
    
    if (!userData.name || userData.name.trim() === '') {
      throw new Error('İsim gereklidir');
    }
    
    const passwordHash = simpleHash(password);
    
    const newUser = {
      name: userData.name,
      role: userData.role || 'Üye',
      email: userData.email || '',
      phone: userData.phone || '',
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      isAdmin: userData.isAdmin || false
    };
    
    const docRef = await addDoc(collection(db, 'users'), newUser);
    
    return {
      id: docRef.id,
      ...newUser,
      password: password // Return password so admin can give it to user
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = { id: doc.id, ...doc.data() };
      delete userData.passwordHash; // Don't expose password hashes
      users.push(userData);
    });
    
    return users;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Update user data (admin only)
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Reset user password (admin only)
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<string>} New password
 */
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const passwordHash = simpleHash(newPassword);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { passwordHash });
    return newPassword;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

