import { auth } from '../lib/firebase-config';
import { loginWithGoogle, logoutUser, initializeAuth } from '../services/firebase-service';
import { logCustomEvent } from '../services/custom-analytics';
import { ContentScriptResponse } from '../types';
import { GoogleAPILoader } from '../utils/google-api-loader';
import { StorageManager } from '../utils/storage';

interface AuthUser {
  email: string | null;
}

const updateUserAvatar = (email: string) => {
  const avatar = document.getElementById('userAvatar');
  if (avatar) {
    avatar.textContent = email.charAt(0).toUpperCase();
  }
};

const openSidePanel = async (): Promise<void> => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentWindow = await chrome.windows.getCurrent();
    
    if (!currentWindow.id) {
      throw new Error('Window ID is undefined');
    }

    // Try to open side panel with both tab and window IDs
    await chrome.sidePanel.open({
      tabId: tab?.id,
      windowId: currentWindow.id
    });
  } catch (error) {
    console.error('Failed to open side panel:', error);
    // Fallback to just window ID if tab-specific fails
    const currentWindow = await chrome.windows.getCurrent();
    if (currentWindow.id) {
      await chrome.sidePanel.open({
        windowId: currentWindow.id
      });
    }
  }
};

const handleLogout = async (): Promise<void> => {
  try {
    await logoutUser();
    await StorageManager.clearUserData(); // Clear stored user data
    updateUIForAuthState(null); // Update UI immediately
    await logCustomEvent('user_logged_out');
    window.close(); // Close popup after logout
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const loadHeader = async (): Promise<void> => {
  const headerContainer = document.getElementById('headerContainer');
  if (!headerContainer) return;

  try {
    const response = await fetch(chrome.runtime.getURL('components/header.html'));
    const html = await response.text();
    headerContainer.innerHTML = html;

    // Set up settings button
    const settingsButton = document.getElementById('settingsButton');
    settingsButton?.addEventListener('click', async () => {
      try {
        await openSidePanel();
        window.close(); // Close popup after opening side panel
      } catch (error) {
        console.error('Failed to open settings:', error);
      }
    });

    // Set up logout button
    const logoutButton = document.getElementById('logoutButton');
    logoutButton?.addEventListener('click', handleLogout);

    // Update UI based on current auth state
    const userData = await StorageManager.getUserData();
    updateUIForAuthState(userData);
  } catch (error) {
    console.error('Failed to load header:', error);
  }
};

const updateUIForAuthState = (user: AuthUser | null): void => {
  const userInfo = document.getElementById('userInfo');
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const scanButton = document.getElementById('scanButton');
  const userEmail = document.getElementById('userEmail');
  const userAvatar = document.getElementById('userAvatar');

  if (user?.email) {
    userInfo?.classList.remove('hidden');
    loginButton?.classList.add('hidden');
    logoutButton?.classList.remove('hidden');
    scanButton?.classList.remove('hidden');
    
    if (userEmail) userEmail.textContent = user.email;
    if (userAvatar) userAvatar.textContent = user.email.charAt(0).toUpperCase();
  } else {
    userInfo?.classList.add('hidden');
    loginButton?.classList.remove('hidden');
    logoutButton?.classList.add('hidden');
    scanButton?.classList.add('hidden');
  }
};

const handleScan = async (): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error('Please login first');
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found');

    const injectionPromise = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Content script injection timed out')), 5000);
    });

    await Promise.race([injectionPromise, timeoutPromise]);

    let retries = 3;
    let response: ContentScriptResponse | null = null;
    
    while (retries > 0 && !response) {
      try {
        response = await chrome.tabs.sendMessage<any, ContentScriptResponse>(tab.id, { action: 'scanJob' });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (response?.success && response.data) {
      await logCustomEvent('job_scan_initiated', {
        url: tab.url || 'unknown',
        timestamp: new Date().toISOString(),
        contentLength: response.data.length
      });
    } else {
      throw new Error(response?.error || 'Failed to scan page');
    }
  } catch (error) {
    console.error('Scan failed:', error);
    await logCustomEvent('job_scan_error', {
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await GoogleAPILoader.getInstance().initialize();
    
    const loginButton = document.getElementById('loginButton');
    const scanButton = document.getElementById('scanButton');
    const settingsButton = document.getElementById('settingsButton');
    const logoutButton = document.getElementById('logoutButton');

    // Initialize auth
    initializeAuth();
    const userData = await StorageManager.getUserData();
    updateUIForAuthState(userData);

    // Set up auth state listener
    auth.onAuthStateChanged((user) => {
      updateUIForAuthState(user ? { email: user.email } : null);
    });

    // Set up event listeners
    loginButton?.addEventListener('click', async () => {
      try {
        await loginWithGoogle();
      } catch (error) {
        console.error('Login failed:', error);
      }
    });

    scanButton?.addEventListener('click', handleScan);
    settingsButton?.addEventListener('click', openSidePanel);
    logoutButton?.addEventListener('click', handleLogout);

    // Load header last
    await loadHeader();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
});