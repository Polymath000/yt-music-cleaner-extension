let allowedSections = [];

// Define the sections to KEEP (Default fallback)
const defaultAllowed = [
  "Listen again",
  "Keep listening",
  "Your shows",
  "Shows for you",
  "From your library"
];

// Main function to clean up the interface
function cleanPage() {
  const url = window.location.href;
  const isSearchPage = url.includes('/search');
  const isExplorePage = url.includes('/explore');

  // --- 1. HANDLE EXPLORE BUTTON (Global) ---
  // We always hide the Explore button in the sidebar/nav
  const exploreTab = document.querySelector('ytmusic-guide-entry-renderer a[href="/explore"]'); 
  if (exploreTab) {
    const parent = exploreTab.closest('ytmusic-guide-entry-renderer');
    if (parent) parent.style.display = 'none';
  }
  const explorePivot = document.querySelector('ytmusic-pivot-bar-item-renderer[tab-id="FEmusic_explore"]');
  if (explorePivot) explorePivot.style.display = 'none';

  // --- 2. SEARCH PAGE PROTECTION ---
  // If we are on the Search page, we must UNHIDE everything immediately
  if (isSearchPage) {
    const allShelves = document.querySelectorAll('ytmusic-carousel-shelf-renderer, ytmusic-immersive-carousel-shelf-renderer, ytmusic-shelf-renderer, ytmusic-grid-renderer, ytmusic-chip-cloud-renderer');
    allShelves.forEach(shelf => {
      shelf.style.display = ''; // Reset to default (Visible)
    });
    return; // STOP HERE. Do not hide anything else.
  }

  // --- 3. HOME PAGE FILTERING ---
  // If we are NOT on search, we filter the shelves
  const shelves = document.querySelectorAll('ytmusic-carousel-shelf-renderer, ytmusic-immersive-carousel-shelf-renderer, ytmusic-shelf-renderer, ytmusic-grid-renderer');

  shelves.forEach(shelf => {
    const titleElement = shelf.querySelector('.title, yt-formatted-string.title');
    
    // By default, we hide the shelf
    let shouldShow = false;

    if (titleElement) {
      const titleText = titleElement.textContent.trim();
      
      // Check against our allowed list
      if (allowedSections.includes(titleText)) {
        shouldShow = true;
      }
    }

    // Apply visibility
    if (shouldShow) {
      shelf.style.display = ''; 
    } else {
      shelf.style.display = 'none';
    }
  });
}

// Function to retrieve settings
function loadSettingsAndRun() {
  chrome.storage.sync.get(['allowedSections'], (result) => {
    // Use saved settings, or the default list if nothing is saved yet
    allowedSections = result.allowedSections || defaultAllowed;
    cleanPage();
  });
}

// --- OBSERVER SETUP ---
// This watches for ANY change on the page (scrolling, clicking links, loading)
const observer = new MutationObserver(() => {
  cleanPage();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial Run
loadSettingsAndRun();

// Update when you click "Save" in the popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateLayout") {
    loadSettingsAndRun();
  }
});