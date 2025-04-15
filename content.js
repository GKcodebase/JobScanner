console.log("Content script starting...");

chrome.runtime.sendMessage({
  action: "contentScriptStarted",
  message: "Content script has started.",
}, (response) => {
  console.log("Response from background:", response);
});
console.log("Content script started.");