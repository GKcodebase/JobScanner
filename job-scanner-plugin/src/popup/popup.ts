import { GeminiAPI } from '../api/gemini';
import { auth } from '../lib/firebase-config';
import { loginWithGoogle, logoutUser, initializeAuth } from '../services/firebase-service';
import { logCustomEvent } from '../services/custom-analytics';
import { ContentScriptResponse } from '../types';
import { GoogleAPILoader } from '../utils/google-api-loader';
import { StorageManager } from '../utils/storage';

// Add connection error handling
let port = chrome.runtime.connect({ name: 'popup' });

port.onDisconnect.addListener(() => {
  console.error('Connection failed - attempting reconnect');
  port = chrome.runtime.connect({ name: 'popup' });
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await GoogleAPILoader.getInstance().initialize();
    const userInfo = document.querySelector('.user-info') as HTMLDivElement;
    const userEmail = document.getElementById('userEmail') as HTMLSpanElement;
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const scanButton = document.getElementById('scanButton');

    // Initialize auth listener
    initializeAuth();

    // Check stored user data
    const userData = await StorageManager.getUserData();
    if (userData) {
      userInfo.classList.remove('hidden');
      loginButton?.classList.add('hidden');
      scanButton?.classList.remove('hidden');
      userEmail.textContent = userData.email || 'Logged in user';
    } else {
      userInfo.classList.add('hidden');
      loginButton?.classList.remove('hidden');
      scanButton?.classList.add('hidden');
    }

    loginButton?.addEventListener('click', async () => {
      try {
        await loginWithGoogle();
      } catch (error) {
        console.error('Login failed:', error);
      }
    });

    logoutButton?.addEventListener('click', async () => {
      try {
        await logoutUser();
        userInfo.classList.add('hidden');
        loginButton?.classList.remove('hidden');
        scanButton?.classList.add('hidden');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });

    scanButton?.addEventListener('click', handleScan);
  } catch (error) {
    console.error('Failed to initialize Google API:', error);
  }
});

async function handleScan() {
  try {
    if (!auth.currentUser) {
      throw new Error('Please login first');
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found');

    // Add timeout for content script injection
    const injectionPromise = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Content script injection timed out')), 5000);
    });

    await Promise.race([injectionPromise, timeoutPromise]);

    // Add retry logic for message sending
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
}