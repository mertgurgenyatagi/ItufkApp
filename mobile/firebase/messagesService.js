import { collection, getDocs, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';

/**
 * Get all messages
 */
export const getAllMessages = async () => {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(messagesQuery);
    
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Subscribe to messages changes
 */
export const subscribeToMessages = (callback) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(messages);
  });
  
  return unsubscribe;
};

/**
 * Create a new message
 */
export const createMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      createdAt: new Date().toISOString(),
      replyCount: 0
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    
    // Also delete all replies to this message
    const repliesQuery = query(collection(db, `messages/${messageId}/replies`));
    const repliesSnapshot = await getDocs(repliesQuery);
    
    const deletePromises = [];
    repliesSnapshot.forEach((replyDoc) => {
      deletePromises.push(deleteDoc(doc(db, `messages/${messageId}/replies`, replyDoc.id)));
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Get replies for a message
 */
export const getReplies = async (messageId) => {
  try {
    const repliesQuery = query(
      collection(db, `messages/${messageId}/replies`),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(repliesQuery);
    
    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return replies;
  } catch (error) {
    console.error('Error getting replies:', error);
    throw error;
  }
};

/**
 * Subscribe to replies for a message
 */
export const subscribeToReplies = (messageId, callback) => {
  const repliesQuery = query(
    collection(db, `messages/${messageId}/replies`),
    orderBy('createdAt', 'asc')
  );
  
  const unsubscribe = onSnapshot(repliesQuery, (querySnapshot) => {
    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(replies);
  });
  
  return unsubscribe;
};

/**
 * Create a reply to a message
 */
export const createReply = async (messageId, replyData) => {
  try {
    const docRef = await addDoc(collection(db, `messages/${messageId}/replies`), {
      ...replyData,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

/**
 * Delete a reply
 */
export const deleteReply = async (messageId, replyId) => {
  try {
    await deleteDoc(doc(db, `messages/${messageId}/replies`, replyId));
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw error;
  }
};
