import { ContentScriptResponse } from '../types';

let contentScriptInitialized = false;

function initializeContentScript() {
  if (contentScriptInitialized) return;
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanJob') {
      try {
        const pageContent = document.body.innerText;
        const response: ContentScriptResponse = {
          success: true,
          data: pageContent
        };
        sendResponse(response);
      } catch (error) {
        const response: ContentScriptResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
        sendResponse(response);
      }
    }
    return true; // Keep the message channel open for async response
  });

  contentScriptInitialized = true;
}

initializeContentScript();