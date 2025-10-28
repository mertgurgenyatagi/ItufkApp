import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from './config';

/**
 * Upload a profile image to Firebase Storage
 * @param {string} userId - The user ID
 * @param {string} uri - Local file URI from image picker
 * @returns {Promise<string>} - URL of uploaded image
 */
export const uploadProfileImage = async (userId, uri) => {
  try {
    console.log('Starting profile image upload for user:', userId);
    console.log('Image URI:', uri);
    
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    console.log('Blob created, size:', blob.size);
    
    // Create a reference to the storage location
    const filename = `profile_${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profileImages/${filename}`);
    
    console.log('Uploading to:', `profileImages/${filename}`);
    
    // Upload the image
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        () => {
          console.log('Upload complete');
          resolve();
        }
      );
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    // Update the user document with the new profile image URL
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profileImageUrl: downloadURL
    });
    
    console.log('User document updated');
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    console.error('Error details:', error.message);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

/**
 * Upload an event image to Firebase Storage
 * @param {string} eventId - The event ID
 * @param {string} uri - Local file URI from image picker
 * @returns {Promise<string>} - URL of uploaded image
 */
export const uploadEventImage = async (eventId, uri) => {
  try {
    console.log('Starting event image upload for event:', eventId);
    console.log('Image URI:', uri);
    
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    console.log('Blob created, size:', blob.size);
    
    // Create a reference to the storage location
    const filename = `event_${eventId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `eventImages/${filename}`);
    
    console.log('Uploading to:', `eventImages/${filename}`);
    
    // Upload the image
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        () => {
          console.log('Upload complete');
          resolve();
        }
      );
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    // Update the event document with the new image URL
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      imageUrl: downloadURL,
      hasImage: true
    });
    
    console.log('Event document updated');
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading event image:', error);
    console.error('Error details:', error.message);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

