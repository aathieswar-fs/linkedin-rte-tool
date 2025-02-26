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

  // console.log("Selected text:", selectedText.split('\n'));

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

function isBold(codePoint) {
  return (codePoint >= 0x1D400 && codePoint <= 0x1D419) ||
    (codePoint >= 0x1D41A && codePoint <= 0x1D433);
}

function isItalic(codePoint) {
  return (
    (codePoint >= 0x1D434 && codePoint <= 0x1D44D) ||
    (codePoint >= 0x1D44E && codePoint <= 0x1D467) ||
    codePoint === 0x1D43B ||
    codePoint === 0x210E
  );
}

function isUnderlined(text) {
  return text.includes('\u0332') || text.includes('\u035F');
}

function makeBold(text) {
  let hasBold = false;

  // Check if text is already bold
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (isBold(codePoint)) {
      hasBold = true;
    } else if (isItalic(codePoint) || isUnderlined(char)) {
      alert("Cannot apply bold: Text is already styled.");
      return text;
    }
  }

  // If already bold, remove bold
  if (hasBold) {
    return [...text].map(char => {
      const codePoint = char.codePointAt(0);

      if (codePoint >= 0x1D400 && codePoint <= 0x1D419) {
        return String.fromCodePoint(codePoint - (0x1D400 - 0x41));
      }

      if (codePoint >= 0x1D41A && codePoint <= 0x1D433) {
        return String.fromCodePoint(codePoint - (0x1D41A - 0x61));
      }

      return char;
    }).join('');
  }

  // Otherwise, apply bold
  return [...text].map(char => {
    const codePoint = char.codePointAt(0);

    if (codePoint >= 0x41 && codePoint <= 0x5A) {
      return String.fromCodePoint(codePoint + (0x1D400 - 0x41));
    }

    if (codePoint >= 0x61 && codePoint <= 0x7A) {
      return String.fromCodePoint(codePoint + (0x1D41A - 0x61));
    }

    return char;
  }).join('');
}

function makeItalic(text) {
  let hasItalic = false;

  // Check if text is already italic
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (isItalic(codePoint)) {
      hasItalic = true;
    } else if (isBold(codePoint) || isUnderlined(char)) {
      alert("Cannot apply italics: Text is already styled.");
      return text;
    }
  }

  // If already italic, remove italics
  if (hasItalic) {
    return [...text].map(char => {
      const codePoint = char.codePointAt(0);

      if (codePoint === 0x210E) {
        return 'h';
      }

      if (codePoint === 0x1D43B) {
        return 'H';
      }

      if (codePoint >= 0x1D434 && codePoint <= 0x1D44D) {
        return String.fromCodePoint(codePoint - (0x1D434 - 0x41));
      }

      if (codePoint >= 0x1D44E && codePoint <= 0x1D467) {
        return String.fromCodePoint(codePoint - (0x1D44E - 0x61));
      }

      return char;
    }).join('');
  }

  // Otherwise, apply italics
  return [...text].map(char => {
    const codePoint = char.codePointAt(0);

    if (codePoint === 0x0048) {
      return String.fromCodePoint(0x1D43B);
    }

    if (codePoint === 0x0068) {
      return String.fromCodePoint(0x210E);
    }

    if (codePoint >= 0x41 && codePoint <= 0x5A) {
      return String.fromCodePoint(codePoint + (0x1D434 - 0x41));
    }

    if (codePoint >= 0x61 && codePoint <= 0x7A) {
      return String.fromCodePoint(codePoint + (0x1D44E - 0x61));
    }

    return char;
  }).join('');
}

function makeUnderline(text) {
  let hasUnderline = isUnderlined(text);

  // If already underlined, remove underline
  if (hasUnderline) {
    return text.replace(/([\u0332\u035F])/g, '');
  }

  // Check for other styles
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (isBold(codePoint) || isItalic(codePoint)) {
      alert("Cannot apply underline: Text is already styled.");
      return text;
    }
  }

  // Otherwise, apply underline
  return text.split('').map(char => {
    if (char == ' ' || char === '\t' || char === '\n') {
      return char;
    }
    return char + '\u035F';
  }).join('');
}


function addToolbox() {
  const modal = document.querySelector('.share-box-v2__modal');
  if (modal) {
    const postArea = modal.querySelector('#share-to-linkedin-modal__header');
    if (postArea) {
      if (!document.getElementById('linkedin-formatter-toolbox')) {
        const toolbox = createToolbox();
        postArea.parentNode.appendChild(toolbox, postArea);
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