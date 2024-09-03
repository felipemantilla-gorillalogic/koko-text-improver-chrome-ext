// Function to handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Text Selector with Koko extension installed');

  // Create a context menu option
  // chrome.contextMenus.create({
  //   id: "openClaudeOptions",
  //   title: "Configure Claude API Key",
  //   contexts: ["all"]
  // });
});

// Handle clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openClaudeOptions") {
    chrome.runtime.openOptionsPage();
  }
});

async function sendToClaude(text) {
  // Get Claude's API key from storage
  const { claudeApiKey } = await chrome.storage.sync.get('claudeApiKey');

  if (!claudeApiKey) {
    throw new Error('Claude API key not configured. Please set it in the options page.');
  }

  const prompt = `
Enhance this text in its original language. Goals:

1. Improve clarity and readability
2. Increase conciseness without losing key information
3. Strengthen overall impact and effectiveness
4. Correct grammatical or spelling errors
5. Maintain original tone and intent
6. Only adjust the original text, without adding explanations or related content

Original text:
${text}
Instructions:

- Provide only the improved version of the text
- Do not include explanations, comments, or extensions
- Do not use quotation marks in your response
- Preserve the original language of the text
`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      messages: [
        { role: "user", content: prompt }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Error in Claude API: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Listener for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processText") {
    sendToClaude(request.text)
      .then(response => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "showClaudeResponse",
          response: response
        });
      })
      .catch(error => {
        console.error('Error processing with Claude:', error);
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "showError",
          error: error.message
        });
      });
    return true; // Indicates that the response will be sent asynchronously
  }
});