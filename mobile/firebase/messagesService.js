import { db } from './config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

/**
 * Messages service for the message board
 */

/**
 * Create a new message
 * @param {Object} messageData - Message data
 * @param {string} authorId - Author user ID
 * @returns {Promise<Object>} Created message
 */
export const createMessage = async (messageData, authorId) => {
  try {
    const newMessage = {
      title: messageData.title,
      content: messageData.content,
      author: authorId,
      tagged: messageData.tagged || [], // Array of user IDs
      attachments: messageData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyCount: 0
    };
    
    const docRef = await addDoc(collection(db, 'messages'), newMessage);
    
    return {
      id: docRef.id,
      ...newMessage
    };
  } catch (error) {
    console.error('Create message error:', error);
    throw error;
  }
};

/**
 * Get all messages
 * @returns {Promise<Array>} Array of messages
 */
export const getAllMessages = async () => {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc')
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = [];
    
    messagesSnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    return messages;
  } catch (error) {
    console.error('Get all messages error:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time messages updates
 * @param {Function} callback - Function to call when messages update
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMessages = (callback) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

/**
 * Update a message
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateMessage = async (messageId, updates) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update message error:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (messageId) => {
  try {
    // TODO: Also delete all replies
    await deleteDoc(doc(db, 'messages', messageId));
  } catch (error) {
    console.error('Delete message error:', error);
    throw error;
  }
};

/**
 * Add a reply to a message
 * @param {string} messageId - Message ID
 * @param {Object} replyData - Reply data
 * @param {string} authorId - Author user ID
 * @returns {Promise<Object>} Created reply
 */
export const addReply = async (messageId, replyData, authorId) => {
  try {
    const newReply = {
      content: replyData.content,
      author: authorId,
      messageId: messageId,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'replies'), newReply);
    
    // Increment reply count on parent message
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      replyCount: arrayUnion(docRef.id).length
    });
    
    return {
      id: docRef.id,
      ...newReply
    };
  } catch (error) {
    console.error('Add reply error:', error);
    throw error;
  }
};

/**
 * Get replies for a message
 * @param {string} messageId - Message ID
 * @returns {Promise<Array>} Array of replies
 */
export const getReplies = async (messageId) => {
  try {
    const repliesQuery = query(
      collection(db, 'replies'),
      where('messageId', '==', messageId),
      orderBy('createdAt', 'asc')
    );
    const repliesSnapshot = await getDocs(repliesQuery);
    const replies = [];
    
    repliesSnapshot.forEach((doc) => {
      replies.push({ id: doc.id, ...doc.data() });
    });
    
    return replies;
  } catch (error) {
    console.error('Get replies error:', error);
    throw error;
  }
};

/**
 * Delete a reply
 * @param {string} replyId - Reply ID
 * @param {string} messageId - Parent message ID
 * @returns {Promise<void>}
 */
export const deleteReply = async (replyId, messageId) => {
  try {
    await deleteDoc(doc(db, 'replies', replyId));
    
    // Decrement reply count on parent message
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    const currentCount = messageDoc.data().replyCount || 0;
    await updateDoc(messageRef, {
      replyCount: Math.max(0, currentCount - 1)
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    throw error;
  }
};

