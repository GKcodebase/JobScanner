import { 
  signInWithCredential, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { StorageManager } from '../utils/storage';

// Authentication services
export const initializeAuth = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await StorageManager.setUserData({
        uid: user.uid,
        email: user.email
      });
    } else {
      await StorageManager.clearUserData();
    }
  });
};

export const loginWithGoogle = async () => {
  try {
    // Get auth token from Chrome identity
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ 
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ]
      }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(token as string);
      });
    });

    // Get user info using the token
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userInfo = await response.json();

    // Create credential with the token
    const credential = GoogleAuthProvider.credential(null, token);
    
    // Sign in to Firebase with credential
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error('Login error details:', error);
    throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const logoutUser = async () => {
  try {
    // Get current token
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(token as string);
      });
    });

    // Revoke token
    await new Promise<void>((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });

    // Sign out from Firebase
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Error logging service
export const logError = async (err: unknown, context?: unknown): Promise<void> => {
  const errorDetails = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    context
  };

  console.error('Extension Error:', errorDetails);
  
  try {
    const errorsCollection = collection(db, 'errors');
    await addDoc(errorsCollection, {
      error: errorDetails,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to log error to Firestore:', e);
  }
};