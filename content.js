let processButton = null;
let lastSelection = null;
let spinner = null;

function createButton() {
  if (!processButton) {
    processButton = document.createElement('button');
    
    processButton.innerHTML = `
      <span style="vertical-align: middle; margin-right: 2px;">Improve with</span>
      <img src="data:image/png;base64,${logoBase64}" alt="Icon" style="width: 32px; height: 32px; vertical-align: middle;">
    `;
    processButton.style.position = 'absolute';
    processButton.style.zIndex = '1000';
    processButton.style.display = 'none';
    processButton.style.padding = '3px 6px';
    processButton.style.fontSize = '12px';
    processButton.style.fontWeight = 'bold';
    processButton.style.color = '#4a90e2';
    processButton.style.backgroundColor = 'white';
    processButton.style.border = '2px solid #4a90e2';
    processButton.style.borderRadius = '24px';
    processButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    processButton.style.cursor = 'pointer';
    processButton.style.transition = 'all 0.3s ease';
    processButton.style.display = 'flex';
    processButton.style.alignItems = 'center';
    processButton.style.justifyContent = 'center';

    // Add hover effect
    processButton.addEventListener('mouseover', () => {
      processButton.style.backgroundColor = '#f0f8ff';
      processButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });

    processButton.addEventListener('mouseout', () => {
      processButton.style.backgroundColor = 'white';
      processButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    });

    // Add click effect
    processButton.addEventListener('mousedown', () => {
      processButton.style.transform = 'scale(0.95)';
    });

    processButton.addEventListener('mouseup', () => {
      processButton.style.transform = 'scale(1)';
    });

    document.body.appendChild(processButton);

    processButton.addEventListener('click', () => {
      const selectedText = window.getSelection().toString().trim();
      chrome.runtime.sendMessage({action: "processText", text: selectedText});
      showSpinner();
    });
  }
  return processButton;
}

function createSpinner() {
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.style.display = 'none';
    spinner.style.position = 'absolute';
    spinner.style.zIndex = '1000';
    spinner.style.width = '32px';
    spinner.style.height = '32px';
    spinner.style.border = '4px solid #f3f3f3';
    spinner.style.borderTop = '4px solid #4a90e2';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(spinner);
  }
  return spinner;
}

function showSpinner() {
  const spinnerElement = createSpinner();
  const buttonRect = processButton.getBoundingClientRect();
  
  spinnerElement.style.left = `${buttonRect.left + window.scrollX}px`;
  spinnerElement.style.top = `${buttonRect.top + window.scrollY}px`;
  spinnerElement.style.display = 'block';
  
  processButton.style.display = 'none';
}

function hideSpinner() {
  if (spinner) {
    spinner.style.display = 'none';
  }
}

function showButton(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 0) {
    lastSelection = {
      text: selectedText,
      range: selection.getRangeAt(0)
    };
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    
    const button = createButton();
    
    button.style.left = `${rect.right + window.scrollX}px`;
    button.style.top = `${rect.bottom + window.scrollY + 5}px`;
    button.style.display = 'block';
    
    button.style.opacity = '0';
    button.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      button.style.opacity = '1';
    }, 50);
  } else {
    hideButton();
  }
}

function hideButton() {
  if (processButton) {
    processButton.style.display = 'none';
  }
}

function replaceSelectedText(newText) {
  if (lastSelection) {
    const range = lastSelection.range;
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
  }
}

function showResponse(response) {
  hideSpinner();
  
  // Parse the response if it's a string
  const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
  
  // Only replace the selected text if there's no error
  if (!parsedResponse.hasError) {
    replaceSelectedText(parsedResponse.improvedText);
  }

  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.bottom = '20px';
  div.style.right = '20px';
  div.style.width = '320px';
  div.style.padding = '20px';
  div.style.backgroundColor = '#ffffff';
  div.style.color = '#333333';
  div.style.borderRadius = '12px';
  div.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
  div.style.zIndex = '1001';
  div.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  div.style.fontSize = '14px';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.opacity = '0';
  div.style.transition = 'all 0.3s ease-in-out';
  div.style.transform = 'translateY(20px)';
  div.style.boxSizing = 'border-box';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '15px';

  const titleContainer = document.createElement('div');
  titleContainer.style.display = 'flex';
  titleContainer.style.alignItems = 'center';

  const icon = document.createElement('span');
  icon.innerHTML = parsedResponse.hasError ? '⚠️' : '✅';
  icon.style.fontSize = '20px';
  icon.style.marginRight = '10px';
  icon.style.color = parsedResponse.hasError ? '#FFA500' : '#4CAF50';

  const title = document.createElement('span');
  title.textContent = parsedResponse.hasError ? 'Error Occurred' : 'Text Improved Successfully!';
  title.style.fontWeight = 'bold';
  title.style.color = parsedResponse.hasError ? '#FFA500' : '#4a90e2';
  title.style.fontSize = '16px';

  titleContainer.appendChild(icon);
  titleContainer.appendChild(title);

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = '#999999';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.lineHeight = '1';
  closeButton.style.transition = 'color 0.3s ease';
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.color = '#333333';
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.color = '#999999';
  });
  closeButton.addEventListener('click', () => {
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    setTimeout(() => div.remove(), 300);
  });

  header.appendChild(titleContainer);
  header.appendChild(closeButton);

  const contentContainer = document.createElement('div');
  contentContainer.style.marginBottom = '15px';
  contentContainer.style.width = '100%';
  contentContainer.style.boxSizing = 'border-box';

  if (parsedResponse.hasError) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = parsedResponse.error;
    errorMessage.style.color = '#FFA500';
    contentContainer.appendChild(errorMessage);
  } else {
    const justificationBox = document.createElement('div');
    justificationBox.textContent = parsedResponse.justification;
    justificationBox.style.width = '100%';
    justificationBox.style.backgroundColor = '#f0f0f0';
    justificationBox.style.border = '1px solid #e0e0e0';
    justificationBox.style.borderRadius = '6px';
    justificationBox.style.padding = '10px';
    justificationBox.style.marginBottom = '15px';
    justificationBox.style.fontSize = '14px';
    justificationBox.style.lineHeight = '1.4';
    justificationBox.style.color = '#666666';
    justificationBox.style.boxSizing = 'border-box';

    const improvedTextArea = document.createElement('textarea');
    improvedTextArea.value = parsedResponse.improvedText;
    improvedTextArea.style.width = '100%';
    improvedTextArea.style.height = '80px';
    improvedTextArea.style.marginBottom = '15px';
    improvedTextArea.style.padding = '10px';
    improvedTextArea.style.border = '1px solid #e0e0e0';
    improvedTextArea.style.borderRadius = '6px';
    improvedTextArea.style.resize = 'vertical';
    improvedTextArea.style.fontSize = '14px';
    improvedTextArea.style.lineHeight = '1.4';
    improvedTextArea.style.color = '#333333';
    improvedTextArea.style.boxSizing = 'border-box';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Improved Text';
    copyButton.style.width = '100%';
    copyButton.style.backgroundColor = '#4a90e2';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.padding = '10px 15px';
    copyButton.style.borderRadius = '6px';
    copyButton.style.cursor = 'pointer';
    copyButton.style.fontSize = '14px';
    copyButton.style.fontWeight = 'bold';
    copyButton.style.transition = 'background-color 0.3s ease';
    copyButton.style.boxSizing = 'border-box';
    
    copyButton.addEventListener('mouseover', () => {
      copyButton.style.backgroundColor = '#357abd';
    });
    copyButton.addEventListener('mouseout', () => {
      copyButton.style.backgroundColor = '#4a90e2';
    });
    copyButton.addEventListener('click', () => {
      improvedTextArea.select();
      document.execCommand('copy');
      copyButton.textContent = 'Copied!';
      copyButton.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        copyButton.textContent = 'Copy Improved Text';
        copyButton.style.backgroundColor = '#4a90e2';
      }, 2000);
    });

    contentContainer.appendChild(justificationBox);
    contentContainer.appendChild(improvedTextArea);
    contentContainer.appendChild(copyButton);
  }

  div.appendChild(header);
  div.appendChild(contentContainer);
  document.body.appendChild(div);

  // Trigger reflow to ensure the transition works
  div.offsetHeight;
  div.style.opacity = '1';
  div.style.transform = 'translateY(0)';

  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    setTimeout(() => div.remove(), 300);
  }, 20000);  // 20 seconds to give more time for reading and copying
}
document.addEventListener('mouseup', showButton);
document.addEventListener('selectionchange', showButton);

createButton();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showClaudeResponse") {
    showResponse(request.response);
  } else if (request.action === "showError") {
    hideSpinner();
    alert(`Error: ${request.error}`);
  }
});