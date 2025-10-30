import { collection, getDocs, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, where, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { getUserPushTokens, sendPushNotification } from './pushNotificationsService';

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(notificationsQuery);
    
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Subscribe to notifications for a user
 */
export const subscribeToNotifications = (userId, callback) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(notifications);
  });
  
  return unsubscribe;
};

/**
 * Create a notification and send push notification
 */
export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false
    });
    
    // Send push notification
    try {
      const pushTokens = await getUserPushTokens([notificationData.userId]);
      if (pushTokens.length > 0) {
        await sendPushNotification(
          pushTokens,
          notificationData.title,
          notificationData.message,
          {
            type: notificationData.type,
            notificationId: docRef.id,
            ...(notificationData.relatedId && { 
              [notificationData.relatedType === 'message' ? 'messageId' : 'eventId']: notificationData.relatedId 
            })
          }
        );
      }
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
      // Don't throw - notification was still created in Firestore
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications for a user
 */
export const deleteAllUserNotifications = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(notificationsQuery);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Create notification for users CC'd on a message
 */
export const notifyMessageCCUsers = async (ccUsers, messageData, allUsers) => {
  try {
    const notifications = [];
    
    for (const ccUserName of ccUsers) {
      const ccUser = allUsers.find(u => u.name === ccUserName);
      if (ccUser && ccUser.id) {
        notifications.push(
          createNotification({
            userId: ccUser.id,
            type: 'message_cc',
            title: 'CC: ' + messageData.title,
            message: `${messageData.sender} sizi bir mesajda CC'ledi`,
            relatedId: messageData.messageId,
            relatedType: 'message'
          })
        );
      }
    }
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying CC users:', error);
  }
};

/**
 * Create notification for message owner when someone replies
 */
export const notifyMessageOwnerOfReply = async (messageOwnerId, replyData, messageTitle) => {
  try {
    if (!messageOwnerId || messageOwnerId === replyData.senderId) return; // Don't notify if replying to own message
    
    await createNotification({
      userId: messageOwnerId,
      type: 'message_reply',
      title: 'Yeni Yanıt: ' + messageTitle,
      message: `${replyData.sender} mesajınıza yanıt verdi`,
      relatedId: replyData.messageId,
      relatedType: 'message'
    });
  } catch (error) {
    console.error('Error notifying message owner:', error);
  }
};

/**
 * Create notification for users tagged in a reply
 */
export const notifyTaggedUsers = async (taggedUserNames, replyData, messageTitle, allUsers) => {
  try {
    const notifications = [];
    
    for (const userName of taggedUserNames) {
      const user = allUsers.find(u => u.name === userName);
      if (user && user.id && user.id !== replyData.senderId) {
        notifications.push(
          createNotification({
            userId: user.id,
            type: 'reply_tag',
            title: 'Etiketlendiniz: ' + messageTitle,
            message: `${replyData.sender} sizi bir yanıtta etiketledi`,
            relatedId: replyData.messageId,
            relatedType: 'message'
          })
        );
      }
    }
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying tagged users:', error);
  }
};

/**
 * Create notification for event announcement reminder
 * Only creates if one doesn't already exist for today
 */
export const notifyEventAnnouncementReminder = async (captainId, coCaptainId, eventData, daysRemaining) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const notifications = [];
    
    // Helper to check if notification already sent today
    const shouldNotify = async (userId) => {
      const userNotifs = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('type', '==', 'event_announcement'),
        where('relatedId', '==', eventData.eventId)
      );
      
      const snapshot = await getDocs(userNotifs);
      
      // Check if any notification was created today
      for (const doc of snapshot.docs) {
        const notifDate = new Date(doc.data().createdAt);
        notifDate.setHours(0, 0, 0, 0);
        const notifDateStr = notifDate.toISOString().split('T')[0];
        
        if (notifDateStr === todayStr) {
          return false; // Already sent today
        }
      }
      
      return true; // No notification sent today
    };
    
    if (captainId && await shouldNotify(captainId)) {
      notifications.push(
        createNotification({
          userId: captainId,
          type: 'event_announcement',
          title: 'Duyuru Hatırlatması: ' + eventData.name,
          message: `${daysRemaining} gün kaldı ve duyuru henüz yapılmadı!`,
          relatedId: eventData.eventId,
          relatedType: 'event'
        })
      );
    }
    
    if (coCaptainId && coCaptainId !== captainId && await shouldNotify(coCaptainId)) {
      notifications.push(
        createNotification({
          userId: coCaptainId,
          type: 'event_announcement',
          title: 'Duyuru Hatırlatması: ' + eventData.name,
          message: `${daysRemaining} gün kaldı ve duyuru henüz yapılmadı!`,
          relatedId: eventData.eventId,
          relatedType: 'event'
        })
      );
    }
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating announcement reminder:', error);
  }
};

/**
 * Create notification for WhatsApp announcement reminder
 * Only creates if one doesn't already exist for today
 */
export const notifyWhatsAppAnnouncementReminder = async (captainId, coCaptainId, eventData, daysRemaining) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const notifications = [];
    
    // Helper to check if notification already sent today
    const shouldNotify = async (userId) => {
      const userNotifs = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('type', '==', 'whatsapp_announcement'),
        where('relatedId', '==', eventData.eventId)
      );
      
      const snapshot = await getDocs(userNotifs);
      
      // Check if any notification was created today
      for (const doc of snapshot.docs) {
        const notifDate = new Date(doc.data().createdAt);
        notifDate.setHours(0, 0, 0, 0);
        const notifDateStr = notifDate.toISOString().split('T')[0];
        
        if (notifDateStr === todayStr) {
          return false; // Already sent today
        }
      }
      
      return true; // No notification sent today
    };
    
    if (captainId && await shouldNotify(captainId)) {
      notifications.push(
        createNotification({
          userId: captainId,
          type: 'whatsapp_announcement',
          title: 'WhatsApp Duyuru Hatırlatması: ' + eventData.name,
          message: `${daysRemaining} gün kaldı ve WhatsApp duyurusu henüz yapılmadı!`,
          relatedId: eventData.eventId,
          relatedType: 'event'
        })
      );
    }
    
    if (coCaptainId && coCaptainId !== captainId && await shouldNotify(coCaptainId)) {
      notifications.push(
        createNotification({
          userId: coCaptainId,
          type: 'whatsapp_announcement',
          title: 'WhatsApp Duyuru Hatırlatması: ' + eventData.name,
          message: `${daysRemaining} gün kaldı ve WhatsApp duyurusu henüz yapılmadı!`,
          relatedId: eventData.eventId,
          relatedType: 'event'
        })
      );
    }
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating WhatsApp announcement reminder:', error);
  }
};

/**
 * Create notification for Instagram announcement reminder
 * Only creates if one doesn't already exist for today
 */
export const notifyInstagramAnnouncementReminder = async (captainId, coCaptainId, eventData, daysRemaining) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const notifications = [];
    
    // Helper to check if notification already sent today
    const shouldNotify = async (userId) => {
      const userNotifs = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('type', '==', 'instagram_announcement'),
        where('relatedId', '==', eventData.eventId)
      );
      
      const snapshot = await getDocs(userNotifs);
      
      // Check if any notification was created today
      for (const doc of snapshot.docs) {
        const notifDate = new Date(doc.data().createdAt);
        notifDate.setHours(0, 0, 0, 0);
        const notifDateStr = notifDate.toISOString().split('T')[0];
        
        if (notifDateStr === todayStr) {
          return false; // Already sent today
        }
      }
      
      return true; // No notification sent today
    };
    
    if (captainId && await shouldNotify(captainId)) {
      notifications.push(
        createNotification({
          userId: captainId,
          type: 'instagram_announcement',
          title: 'Instagram Duyuru Hatırlatması: ' + eventData.name,
          message: `${daysRemaining} gün kaldı ve Instagram duyurusu henüz yapılmadı!`,
          relatedId: eventData.eventId,
          relatedType: 'event'
        })
      );
    }
    
    if (coCaptainId && coCaptainId !== captainId && await shouldNotify(coCaptainId)) {
      notifications.push(
        createNotification({
          userId: coCaptainId,
          type: 'instagram_announcement',
          title: 'Instagram Duyuru Hatırlatması: ' + eventData.name,
          message: `${daysRemaining} gün kaldı ve Instagram duyurusu henüz yapılmadı!`,
          relatedId: eventData.eventId,
          relatedType: 'event'
        })
      );
    }
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating Instagram announcement reminder:', error);
  }
};

