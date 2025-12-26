// The ONLY sections allowed to exist
const allowedList = [
  "Listen again",
  "Keep listening",
  "Your shows",
  "Shows for you",
  "From your library"
];

const container = document.getElementById('options-list');

// 1. Load saved settings
chrome.storage.sync.get(['allowedSections'], (result) => {
  // Default: If nothing saved yet, check them all so the user sees something initially
  const allowed = result.allowedSections || allowedList;

  allowedList.forEach(section => {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = section;
    checkbox.value = section;
    
    // If it is in the allowed list, check the box
    if (allowed.includes(section)) {
      checkbox.checked = true;
    }

    const label = document.createElement('label');
    label.htmlFor = section;
    label.innerText = section;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
});

// 2. Save settings
document.getElementById('save-btn').addEventListener('click', () => {
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const selected = [];

  checkboxes.forEach(box => {
    if (box.checked) {
      selected.push(box.value);
    }
  });

  chrome.storage.sync.set({ allowedSections: selected }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateLayout" });
      }
    });
    window.close();
  });
});