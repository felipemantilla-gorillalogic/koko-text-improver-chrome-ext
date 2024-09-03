// Save the API key when the "Save" button is clicked
document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set({ claudeApiKey: apiKey }, () => {
    const status = document.getElementById('status');
    status.textContent = 'API key saved successfully!';
    status.style.color = '#4caf50';
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  });
});

// Load the saved API key when the options page is opened
chrome.storage.sync.get('claudeApiKey', (data) => {
  if (data.claudeApiKey) {
    document.getElementById('apiKey').value = data.claudeApiKey;
  }
});