import { db, auth } from '../lib/firebase-config';
import { collection, addDoc } from 'firebase/firestore';

interface AnalyticsEvent {
  eventName: string;
  params?: Record<string, any>;
  timestamp: string;
  platform: string;
  userId: string;
}

export const logCustomEvent = async (eventName: string, params?: Record<string, any>): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.warn('User not authenticated, skipping analytics');
      return;
    }

    const eventData: AnalyticsEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      platform: 'extension',
      userId: auth.currentUser.uid,
      // Only include params if they exist and have values
      ...(params && Object.keys(params).length > 0 && { params })
    };

    const eventsCollection = collection(db, 'analytics_events');
    await addDoc(eventsCollection, eventData);
    console.log(`Event logged successfully: ${eventName}`);
  } catch (error) {
    console.error('Failed to log custom event:', error);
    // Don't throw the error to prevent app crashes
  }
};