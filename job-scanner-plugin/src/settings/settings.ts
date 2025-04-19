import { auth } from '../lib/firebase-config';
import { StorageManager } from '../utils/storage';
import { logCustomEvent } from '../services/custom-analytics';
import { loginWithGoogle, logoutUser } from '../services/firebase-service';
import { UserSettings } from '../types';

class SettingsManager {
  private elements: {
    geminiApiKey: HTMLInputElement;
    modelSelection: HTMLSelectElement;
    resumeUpload: HTMLInputElement;
    currentResume: HTMLDivElement;
    resumeName: HTMLSpanElement;
    userEmail: HTMLSpanElement;
    scanCount: HTMLSpanElement;
    atsCount: HTMLSpanElement;
    genCount: HTMLSpanElement;
    authContainer: HTMLElement;
    settingsContainer: HTMLElement;
    loginButton: HTMLElement;
  };
  private currentSection: string = 'api';

  constructor() {
    this.elements = {
      geminiApiKey: document.getElementById('geminiApiKey') as HTMLInputElement,
      modelSelection: document.getElementById('modelSelection') as HTMLSelectElement,
      resumeUpload: document.getElementById('resumeUpload') as HTMLInputElement,
      currentResume: document.getElementById('currentResume') as HTMLDivElement,
      resumeName: document.getElementById('resumeName') as HTMLSpanElement,
      userEmail: document.getElementById('userEmail') as HTMLSpanElement,
      scanCount: document.getElementById('scanCount') as HTMLSpanElement,
      atsCount: document.getElementById('atsCount') as HTMLSpanElement,
      genCount: document.getElementById('genCount') as HTMLSpanElement,
      authContainer: document.getElementById('authContainer')!,
      settingsContainer: document.getElementById('settingsContainer')!,
      loginButton: document.getElementById('loginButton')!
    };

    this.initializeAuth();
    this.initializeEventListeners();
    this.loadSettings();
    this.loadUserData();
    this.initializeHeaderControls();
  }

  private initializeAuth() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.elements.authContainer.classList.add('hidden');
        this.elements.settingsContainer.classList.remove('hidden');
        this.loadSettings();
      } else {
        this.elements.authContainer.classList.remove('hidden');
        this.elements.settingsContainer.classList.add('hidden');
      }
    });
  }

  private initializeEventListeners() {
    // Add click handlers for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const section = target.dataset.section;
        if (section) {
          this.switchSection(section);
        }
      });
    });

    // Add save handlers for form inputs
    document.getElementById('geminiApiKey')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      this.saveApiKey(input.value);
    });

    document.getElementById('modelSelection')?.addEventListener('change', (e) => {
      const select = e.target as HTMLSelectElement;
      this.saveModelSelection(select.value);
    });

    document.getElementById('resumeUpload')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files?.length) {
        this.handleResumeUpload(input.files[0]);
      }
    });

    document.getElementById('removeResume')?.addEventListener('click', () => this.removeResume());

    this.elements.loginButton.addEventListener('click', async () => {
      try {
        await loginWithGoogle();
      } catch (error) {
        console.error('Login failed:', error);
      }
    });
  }

  private initializeHeaderControls(): void {
    const logoutButton = document.getElementById('logoutButton');
    logoutButton?.addEventListener('click', async () => {
      try {
        await logoutUser();
        await StorageManager.clearUserData();
        await logCustomEvent('settings_logout');
        window.close(); // Close the side panel
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }

  private switchSection(sectionId: string) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to clicked nav item
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.add('hidden');
    });

    // Show selected section
    document.getElementById(`${sectionId}-section`)?.classList.remove('hidden');

    this.currentSection = sectionId;
  }

  private async loadSettings() {
    const settings = await StorageManager.getSettings();
    if (settings) {
      this.elements.geminiApiKey.value = settings.geminiApiKey || '';
      this.elements.modelSelection.value = settings.modelSelection || 'gemini-pro';
      if (settings.resumeData) {
        this.elements.currentResume.classList.remove('hidden');
        this.elements.resumeName.textContent = 'Resume uploaded';
      }
    }

    // Load user stats with proper type checking
    const stats = await StorageManager.getStats();
    if (stats) {
      const scanCount = document.getElementById('scanCount');
      const atsCount = document.getElementById('atsCount');
      
      if (scanCount) scanCount.textContent = stats.scans.toString();
      if (atsCount) atsCount.textContent = stats.atsChecks.toString();
    }
  }

  private async loadUserData() {
    const userData = await StorageManager.getUserData();
    if (userData) {
      this.elements.userEmail.textContent = userData.email || 'Logged in user';
      // Load usage statistics from Firestore
      // This would be implemented in a separate service
    }
  }

  private async saveApiKey(apiKey: string) {
    try {
      await StorageManager.saveSettings({ geminiApiKey: apiKey });
      await logCustomEvent('settings_api_key_updated');
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  private async saveModelSelection(model: string) {
    try {
      await StorageManager.saveSettings({ modelSelection: model });
      await logCustomEvent('settings_model_updated', { model });
    } catch (error) {
      console.error('Failed to save model selection:', error);
    }
  }

  private async handleResumeUpload(file: File) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      await StorageManager.saveResume(arrayBuffer);
      this.elements.currentResume.classList.remove('hidden');
      this.elements.resumeName.textContent = file.name;
      await logCustomEvent('settings_resume_uploaded');
    } catch (error) {
      console.error('Failed to upload resume:', error);
      alert('Failed to upload resume. Please try again.');
    }
  }

  private async removeResume() {
    try {
      await StorageManager.saveSettings({ resumeData: undefined });
      this.elements.currentResume.classList.add('hidden');
      this.elements.resumeName.textContent = 'None';
      this.elements.resumeUpload.value = '';
      await logCustomEvent('resume_removed');
    } catch (error) {
      console.error('Failed to remove resume:', error);
      alert('Failed to remove resume. Please try again.');
    }
  }
}

// Initialize settings when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SettingsManager();
});