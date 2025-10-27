import { db, storage } from './config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Events service for managing photography club events
 */

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (eventData, createdBy) => {
  try {
    const newEvent = {
      name: eventData.name,
      date: eventData.date || null,
      time: eventData.time || null,
      location: eventData.location || null,
      text: eventData.text || null,
      color: eventData.color || '#6B8E9E',
      hasImage: false,
      imageUrl: null,
      captain: eventData.captain || null,
      coCaptain: eventData.coCaptain || null,
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'events'), newEvent);
    
    return {
      id: docRef.id,
      ...newEvent
    };
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

/**
 * Get all events
 * @returns {Promise<Array>} Array of events
 */
export const getAllEvents = async () => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      orderBy('date', 'desc')
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = [];
    
    eventsSnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    return events;
  } catch (error) {
    console.error('Get all events error:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time events updates
 * @param {Function} callback - Function to call when events update
 * @returns {Function} Unsubscribe function
 */
export const subscribeToEvents = (callback) => {
  const eventsQuery = query(
    collection(db, 'events'),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(eventsQuery, (snapshot) => {
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    callback(events);
  });
};

/**
 * Update an event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    // TODO: Also delete associated image from storage if exists
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};

/**
 * Upload event image
 * @param {string} eventId - Event ID
 * @param {Blob|File} imageFile - Image file
 * @returns {Promise<string>} Image URL
 */
export const uploadEventImage = async (eventId, imageFile) => {
  try {
    const imageRef = ref(storage, `events/${eventId}/${Date.now()}.jpg`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    
    // Update event with image URL
    await updateEvent(eventId, {
      hasImage: true,
      imageUrl: imageUrl
    });
    
    return imageUrl;
  } catch (error) {
    console.error('Upload event image error:', error);
    throw error;
  }
};

/**
 * Delete event image
 * @param {string} eventId - Event ID
 * @param {string} imageUrl - Image URL to delete
 * @returns {Promise<void>}
 */
export const deleteEventImage = async (eventId, imageUrl) => {
  try {
    // Delete from storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    
    // Update event
    await updateEvent(eventId, {
      hasImage: false,
      imageUrl: null
    });
  } catch (error) {
    console.error('Delete event image error:', error);
    throw error;
  }
};

