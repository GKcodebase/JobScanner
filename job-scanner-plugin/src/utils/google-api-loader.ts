
export class GoogleAPILoader {
  private static instance: GoogleAPILoader;
  private initialized = false;

  static getInstance(): GoogleAPILoader {
    if (!GoogleAPILoader.instance) {
      GoogleAPILoader.instance = new GoogleAPILoader();
    }
    return GoogleAPILoader.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  async getAuthToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!token) {
            reject(new Error('No token received'));
            return;
          }
          resolve(token as string);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async revokeAuthToken(token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}