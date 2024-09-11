let processButton = null;
let lastSelection = null;
let spinner = null;
let isLoading = false;

function saveSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    lastSelection = selection.getRangeAt(0).cloneRange();
  }
}

function restoreSelection() {
  if (lastSelection) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(lastSelection);
  }
}



function createButton() {
  console.log("Iniciando createButton");
  if (!window.processButton) {
    console.log("Creando nuevo processButton");
    window.processButton = document.createElement('div');

    window.processButton.innerHTML = `
      <div id="processButtonContent">
        <div id="improveText" title="Improve Text">
           <img src="data:image/png;base64,${logoBase64}" alt="Improve" class="icon" title="Improve Text">
        </div>
        <span class="separator">|</span>
        <div class="translate-option" id="translateENtoES" title="Translate English to Spanish">
          <span class="translate-label">EN</span>
          <span class="translate-arrow">→</span>
          <span class="translate-label">ES</span>
        </div>
        <span class="separator">|</span>
        <div class="translate-option" id="translateEStoEN"  title="Translate Spanish to English">
          <span class="translate-label">ES</span>
          <span class="translate-arrow">→</span>
          <span class="translate-label">EN</span>
        </div>
      </div>
    `;
    window.processButton.style.position = 'absolute';
    window.processButton.style.zIndex = '1000';
    window.processButton.style.padding = '6px 10px';
    window.processButton.style.backgroundColor = 'white';
    window.processButton.style.borderRadius = '20px';
    window.processButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    window.processButton.style.cursor = 'pointer';
    window.processButton.style.transition = 'all 0.3s ease';
    window.processButton.style.display = 'flex';
    window.processButton.style.alignItems = 'center';
    window.processButton.style.justifyContent = 'center';
    window.processButton.style.whiteSpace = 'nowrap';

    const style = document.createElement('style');
    style.textContent = `
      #processButtonContent {
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
      }
      #processButtonContent .icon {
        width: 30px;
        height: 30px;
        margin: 0 5px;
        cursor: pointer;
        transition: transform 0.2s ease;
        vertical-align: middle;
      }
      #processButtonContent .icon:hover {
        transform: scale(1.1);
        background-color: #f0f8ff;
        border-radius: 50%;
      }
      #processButtonContent .separator {
        color: #4a90e2;
        margin: 0 5px;
        font-weight: bold;
        vertical-align: middle;
      }
      #processButtonContent .translate-option {
        display: flex;
        align-items: center;
        background-color: #f0f8ff;
        border-radius: 12px;
        padding: 4px 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      #processButtonContent .translate-option:hover {
        background-color: #e1f0ff;
        transform: scale(1.05);
      }
      #processButtonContent .translate-label {
        font-weight: bold;
        font-size: 11px;
        color: #4a90e2;
      }
      #processButtonContent .translate-arrow {
        color: #4a90e2;
        margin: 0 2px;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);

    window.processButton.id = 'processButton';
    document.body.appendChild(window.processButton);

    // Funciones de manejo de eventos
    function handleAction(action, event) {
      event.preventDefault();
      event.stopPropagation();
      
      const selectedText = lastSelection ? lastSelection.toString().trim() : '';  
      
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action, text: selectedText });
      } else {
        console.error("chrome.runtime.sendMessage no está disponible");
      }
      
      if (typeof showSpinner === 'function') {
        showSpinner();
      } else {
        console.warn("La función showSpinner no está definida");
      }
      
      // Restaurar la selección después de un breve retraso
      setTimeout(restoreSelection, 0);
    }

    function saveSelection() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        lastSelection = selection.getRangeAt(0).cloneRange();
      }
    }

    function restoreSelection() {
      if (lastSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(lastSelection);
      }
    }

    // Añadir event listeners
    const improveTextBtn = window.processButton.querySelector('#improveText');
    const translateENtoESBtn = window.processButton.querySelector('#translateENtoES');
    const translateEStoENBtn = window.processButton.querySelector('#translateEStoEN');

    if (improveTextBtn) {
      improveTextBtn.addEventListener('mousedown', saveSelection);
      improveTextBtn.addEventListener('click', (event) => handleAction('improveText', event));
    } 

    if (translateENtoESBtn) {
      translateENtoESBtn.addEventListener('mousedown', saveSelection);
      translateENtoESBtn.addEventListener('click', (event) => handleAction('translateENtoES', event));
    } else {
      console.error("translateENtoESBtn no encontrado");
    }

    if (translateEStoENBtn) {
      translateEStoENBtn.addEventListener('mousedown', saveSelection);
      translateEStoENBtn.addEventListener('click', (event) => handleAction('translateEStoEN', event));  
    } 
  } 
  
  return window.processButton;
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
  isLoading = true;
  const spinnerElement = createSpinner();
  const buttonRect = window.processButton.getBoundingClientRect();

  spinnerElement.style.left = `${buttonRect.left + window.scrollX}px`;
  spinnerElement.style.top = `${buttonRect.top + window.scrollY}px`;
  spinnerElement.style.display = 'block';

  window.processButton.style.display = 'none';
}

function hideSpinner() {
  if (spinner) {
    isLoading = false;
    spinner.style.display = 'none';
  }
}

function getSelectedText() {
  let selectedText = '';

  // Check if there's a selection in standard text fields
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  }
  // For older versions of Internet Explorer
  else if (document.selection && document.selection.type !== 'Control') {
    selectedText = document.selection.createRange().text;
  }

  // Check for selected text in input fields and textareas
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    if (start !== end) {
      selectedText = activeElement.value.substring(start, end);
    }
  }

  return selectedText.trim();
}

function hideButton() {
  setTimeout(() => {
    if (window.processButton) {
      window.processButton.style.display = 'none';
    }
  }, 100);
}

function showButton(event) {
  const selectedText = getSelectedText();

  console.log("selectedText", selectedText);

  if (selectedText && selectedText.length > 0 && !isLoading) {
    saveSelection();
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

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

  if(isLoading) {
    hideButton();
  }
}


function showResponse(response) {
  hideSpinner();

  // Parse the response if it's a string
  const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

  // Copy the improved text to clipboard instead of replacing the selected text
  console.log('parsedResponse', parsedResponse);
  if (!parsedResponse.hasError) {
    navigator.clipboard.writeText(parsedResponse.response)
      .then(() => console.log('Result text copied to clipboard'))
      .catch(err => console.error('Error copying text: ', err));
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
  title.textContent = parsedResponse.hasError ? 'Error Occurred' : 'Text Processed Successfully!';
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
    improvedTextArea.value = parsedResponse.response;
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

    const clipboardNotice = document.createElement('p');
    clipboardNotice.textContent = 'The improved text has been automatically copied to your clipboard.';
    clipboardNotice.style.color = '#4CAF50';
    clipboardNotice.style.fontSize = '12px';
    clipboardNotice.style.marginBottom = '10px';
    clipboardNotice.style.textAlign = 'center';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Again';
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
        copyButton.textContent = 'Copy Again';
        copyButton.style.backgroundColor = '#4a90e2';
      }, 2000);
    });

    contentContainer.appendChild(justificationBox);
    contentContainer.appendChild(improvedTextArea);
    contentContainer.appendChild(clipboardNotice);
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

// Add this new event listener
document.addEventListener('mousedown', (event) => {
  // Check if the click is outside the button
  if (window.processButton && !window.processButton.contains(event.target)) {
    hideButton();
  }
});

createButton();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showClaudeResponse") {
    showResponse(request.response);
  } else if (request.action === "showError") {
    hideSpinner();
    alert(`Error: ${request.error}`);
  }
});