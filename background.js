console.log("Service worker is running.");

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.tab) {
    console.log(`Message from content script in tab ${sender.tab.id}:`, message);
  } else {
    console.log("Message from extension:", message);
  }
});

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`Message from popup:`, message);
  console.log("Sender object:", sender);
});

// Listener to log when the extension is installed or updated
chrome.runtime.onStartup.addListener(() => {
  console.log("Job Scanner Plugin started.");
});