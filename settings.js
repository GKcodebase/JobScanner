document.getElementById("saveSettings").addEventListener("click", () => {
  const geminiApiKey = document.getElementById("geminiApiKeyInput").value;
  const geminiModel = document.getElementById("geminiModelInput").value;
  const resume = document.getElementById("resumeUpload").files[0];

  console.log("Gemini API Key:", geminiApiKey);
  console.log("Gemini Model:", geminiModel);
  console.log("Resume:", resume);

  saveSettings(geminiApiKey, geminiModel, resume);
});

function saveSettings(geminiApiKey, geminiModel, resume) {
  console.log("Saving settings - Gemini API Key:", geminiApiKey);
  console.log("Saving settings - Gemini Model:", geminiModel);
  console.log("Saving settings - Resume:", resume);

  chrome.runtime.sendMessage({
    action: "saveSettings",
    geminiApiKey: geminiApiKey,
    geminiModel: geminiModel,
    resume: resume,
  });
}