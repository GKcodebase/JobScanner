console.log("Popup script started");

window.addEventListener("load", () => {
  chrome.runtime.sendMessage({ action: "popupStarted" });
});
console.log("Popup script started");

// Scan Button
document.getElementById("scanButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "scan" });
  console.log("Sent 'scan' message to background script");
});

// Analyze Match Button
document.getElementById("analyzeMatchButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "analyzeMatch" });
  console.log("Sent 'analyzeMatch' message to background script");
});

// Generate Button
document.getElementById("generateButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "generate" });
  console.log("Sent 'generate' message to background script");
});

// ATS Score Button
document.getElementById("atsScoreButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "checkATSScore" });
  console.log("Sent 'checkATSScore' message to background script");
});

// Settings Link
document.getElementById("settingsLink").addEventListener("click", () => {
  window.location.href = "settings.html";
  console.log("Redirecting to settings.html");
});

// Login/Logout Button
document.getElementById("loginLogoutButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "loginLogout" });
  console.log("Sent 'loginLogout' message to background script");
});