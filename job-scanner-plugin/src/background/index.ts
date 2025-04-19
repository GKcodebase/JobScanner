import { GeminiAPI } from '../api/gemini';
import { logError } from '../services/firebase-service';

const geminiAPI = new GeminiAPI(process.env.GEMINI_API_KEY || '');

let ports: chrome.runtime.Port[] = [];

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    ports.push(port);
    
    port.onDisconnect.addListener(() => {
      ports = ports.filter(p => p !== port);
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch(request.action) {
      case 'scanJob':
        handleJobScan(request.data).then(sendResponse);
        break;
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
    return true; // Keep the message channel open for async response
  } catch (err) {
    const error = err as Error;
    logError(error, { request, sender });
    sendResponse({ error: error.message });
    return true;
  }
});

async function handleJobScan(data: any) {
  try {
    const jobDetails = await geminiAPI.extractJobDetails(data);
    // Remove analytics event logging from background script
    return jobDetails;
  } catch (err) {
    const error = err as Error;
    logError(error, { action: 'handleJobScan', data });
  }
}