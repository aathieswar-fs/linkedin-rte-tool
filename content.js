function createToolbox() {
  const toolbox = document.createElement('div');
  toolbox.className = 'linkedin-formatter-toolbox';
  toolbox.id = 'linkedin-formatter-toolbox';

  const tools = [
    { name: 'Bold', icon: '𝐁', action: makeBold },
    { name: 'Italic', icon: '𝑰', action: makeItalic },
    { name: 'Underline', icon: '̲U̲', action: makeUnderline },
  ];

  tools.forEach(tool => {
    const button = document.createElement('button');
    button.textContent = tool.icon;
    button.title = tool.name;
    button.className = `format-button ${tool.name.toLowerCase()}`;
    button.onclick = () => applyFormatting(tool.action, button);
    toolbox.appendChild(button);
  });

  // Add some CSS to make the toolbox a flex container
  toolbox.style.cssText = `
    display: flex;
    align-items: center;
    padding: 5px;
  `;

  return toolbox;
}

function applyFormatting(formatFunction, button) {
  const postArea = document.querySelector('.share-box-v2__modal .ql-editor');
  if (!postArea) {
    console.error("Post area not found");
    return;
  }

  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    console.error("No text selected");
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  console.log("Selected text:", selectedText);

  if (selectedText) {
    const newText = formatFunction(selectedText);
    const span = document.createElement('span');
    span.textContent = newText;
    range.deleteContents();
    range.insertNode(span);

    // Restore the selection
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.error("No text selected for formatting");
  }
}

function getStyledUnicode(style, text, uppercase, lowercase) {
  return text.split('').map(char => {
    if (char === ' ' || char === '\t' || char === '\n') {
      return char;
    }

    if (style === 'italics' && char === 'h') {
      return String.fromCodePoint(0x1D629);
    }

    const code = char.charCodeAt(0);
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      let offset = (code >= 65 && code <= 90) ? uppercase : lowercase;
      return String.fromCodePoint(code + offset);
    }
    return char;
  }).join('');
}

function makeBold(text) {
  return getStyledUnicode('bold', text, 0x1D400 - 0x41, 0x1D41A - 0x61);
}

function makeItalic(text) {
  return getStyledUnicode('italics', text, 0x1D434 - 0x41, 0x1D44E - 0x61);
}

function makeUnderline(text) {
  // return text.split('').map(char => {
  //   if (char === ' ' || char === '\t' || char === '\n') {
  //     return char;
  //   }
  //   return char + '\u0332';
  // }).join('');
  return text.split('').map((char, index) => {
    if (char == ' ' || char === '\t' || char === '\n') {
      return char;
    }
    if (text.length == 1) {
      return char + '\u0332';
    }
    return char + '\u035F';
  }).join('');
}

function addToolbox() {
  const modal = document.querySelector('.share-box-v2__modal');
  if (modal) {
    const postArea = modal.querySelector('.ql-container');
    if (postArea) {
      if (!document.getElementById('linkedin-formatter-toolbox')) {
        const toolbox = createToolbox();
        postArea.parentNode.insertBefore(toolbox, postArea);
        // addPostAreaListener();
      } else {
        console.log("Toolbox already exists");
      }
    } else {
      console.log("Post area not found in modal");
    }
  } else {
    console.log("Modal not found");
  }
}

function removeToolbox() {
  const toolbox = document.getElementById('linkedin-formatter-toolbox');
  if (toolbox) {
    toolbox.remove();
  }
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const modal = document.querySelector('.share-box-v2__modal');
      if (modal) {
        // Check if the modal is visible
        if (window.getComputedStyle(modal).display !== 'none') {
          addToolbox();
        } else {
          removeToolbox();
        }
      }
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

let debounceTimer;
const optimizedAddToolbox = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(addToolbox, 100);
};