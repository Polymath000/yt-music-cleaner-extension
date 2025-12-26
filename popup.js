const sections = [
  "Music videos for you",
  "From the community",
  "Featured playlists for you",
  "Rock",
  "Forgotten favorites",
  "Mixed for you",
  "Albums for you",
  "New releases",
  "Fresh finds, old favorites",
  "Live performances",
  "Long listens",
  "Covers and remixes",
  "Charts",
  "Quick picks",
  "Year end bangers 💥",
  "Create a mix",
  "Your daily discover",
  "Trending songs for you",
  "Music channels you may like",
  "Trending in Shorts"
];

const container = document.getElementById('options-list');

// 1. Load saved settings and build checkboxes
chrome.storage.sync.get(['hiddenSections'], (result) => {
  const hidden = result.hiddenSections || [];

  sections.forEach(section => {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = section;
    checkbox.value = section;
    
    // If it's in storage, check the box
    if (hidden.includes(section)) {
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

// 2. Save settings when button is clicked
document.getElementById('save-btn').addEventListener('click', () => {
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const selected = [];

  checkboxes.forEach(box => {
    if (box.checked) {
      selected.push(box.value);
    }
  });

  chrome.storage.sync.set({ hiddenSections: selected }, () => {
    // Send message to content script to update immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateLayout" });
      }
    });
    window.close(); // Close popup after saving
  });
});