import { UserSettings } from '../types';

export class StorageManager {
  static async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    await chrome.storage.local.set({ settings });
  }

  static async getSettings(): Promise<UserSettings | null> {
    const data = await chrome.storage.local.get('settings');
    return data.settings || null;
  }

  static async saveResume(pdfData: ArrayBuffer): Promise<void> {
    await chrome.storage.local.set({ 
      resume: Array.from(new Uint8Array(pdfData))
    });
  }

  static async getResume(): Promise<ArrayBuffer | null> {
    const data = await chrome.storage.local.get('resume');
    return data.resume ? new Uint8Array(data.resume).buffer : null;
  }

  static async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }

  static async setUserData(data: { uid: string; email: string | null }): Promise<void> {
    await chrome.storage.local.set({ userData: data });
  }

  static async getUserData(): Promise<{ uid: string; email: string | null } | null> {
    const result = await chrome.storage.local.get('userData');
    return result.userData || null;
  }

  static async clearUserData(): Promise<void> {
    await chrome.storage.local.remove('userData');
  }
}