import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import { app } from '../lib/firebase-config';

let analytics: Analytics | null = null;

export const initializeAnalytics = async () => {
  try {
    // Check if analytics is supported in this environment
    const isAnalyticsSupported = await isSupported();
    
    if (!isAnalyticsSupported) {
      console.log('Firebase Analytics is not supported in this environment');
      return;
    }
    
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};

export const logAnalyticsEvent = (eventName: string, params?: object) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.warn('Failed to log analytics event:', error);
    }
  }
};