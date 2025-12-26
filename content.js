let sectionsToHide = [];

// 1. Function to process the page
function hideSections() {
  // Find all section headers (yt-formatted-string inside specific renderer classes)
  // Usually, sections are in 'ytmusic-carousel-shelf-renderer' or 'ytmusic-immersive-carousel-shelf-renderer'
  const shelves = document.querySelectorAll('ytmusic-carousel-shelf-renderer, ytmusic-immersive-carousel-shelf-renderer, ytmusic-shelf-renderer');

  shelves.forEach(shelf => {
    // Find the title element within the shelf
    const titleElement = shelf.querySelector('.title, yt-formatted-string.title');
    
    if (titleElement) {
      const titleText = titleElement.textContent.trim();
      
      // Check if this title matches our list
      // We use 'includes' for loose matching in case of slight variations
      const shouldHide = sectionsToHide.some(blocked => titleText === blocked);

      if (shouldHide) {
        shelf.style.display = 'none';
      } else {
        // Ensure it is visible if un-checked later
        shelf.style.display = ''; 
      }
    }
  });
}

// 2. Load settings from storage
function loadSettingsAndRun() {
  chrome.storage.sync.get(['hiddenSections'], (result) => {
    sectionsToHide = result.hiddenSections || [];
    hideSections();
  });
}

// 3. Setup MutationObserver
// YouTube Music adds content dynamically as you scroll. We need to watch for that.
const observer = new MutationObserver(() => {
  if (sectionsToHide.length > 0) {
    hideSections();
  }
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial Run
loadSettingsAndRun();

// Listen for messages from the popup (when you click 'Apply')
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateLayout") {
    loadSettingsAndRun();
  }
});