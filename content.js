let allowedSections = [];

// Default list of sections to KEEP
const defaultAllowed = [
  "Listen again",
  "Keep listening",
  "Your shows",
  "Shows for you",
  "From your library"
];

function cleanPage() {
  const url = window.location.href;
  const pathname = window.location.pathname;

  // 1. GLOBAL: Remove Explore Button (Always)
  const exploreTab = document.querySelector('ytmusic-guide-entry-renderer a[href="/explore"]'); 
  if (exploreTab) {
    const parent = exploreTab.closest('ytmusic-guide-entry-renderer');
    if (parent) parent.style.display = 'none';
  }
  const explorePivot = document.querySelector('ytmusic-pivot-bar-item-renderer[tab-id="FEmusic_explore"]');
  if (explorePivot) explorePivot.style.display = 'none';


  // 2. INTELLIGENT HOME PAGE DETECTION
  // We consider it "Home" ONLY if:
  // A) The path is exactly "/" (root)
  // B) OR the URL contains the specific Home ID "FEmusic_home"
  const isRoot = pathname === '/';
  const isHomeId = url.includes('FEmusic_home');
  
  // We explicitly confirm it is NOT a Search, Playlist, or Watch page
  // (This prevents false positives)
  const isHomePage = (isRoot || isHomeId) 
                     && !url.includes('/search')
                     && !url.includes('/playlist')
                     && !url.includes('/watch')
                     && !url.includes('/channel');


  // 3. IF NOT HOME: SHOW EVERYTHING (Fix for Playlists/Search)
  if (!isHomePage) {
    const hiddenElements = document.querySelectorAll('[data-yt-extension-hidden="true"]');
    
    // Unhide everything we previously hid
    hiddenElements.forEach(el => {
      el.style.display = '';
      el.removeAttribute('data-yt-extension-hidden');
    });
    return; // Stop here
  }


  // 4. HOME PAGE LOGIC (Filter the content)
  const shelves = document.querySelectorAll('ytmusic-carousel-shelf-renderer, ytmusic-immersive-carousel-shelf-renderer, ytmusic-shelf-renderer, ytmusic-grid-renderer');

  shelves.forEach(shelf => {
    const titleElement = shelf.querySelector('.title, yt-formatted-string.title');
    let shouldShow = false;

    if (titleElement) {
      const titleText = titleElement.textContent.trim();
      
      // If the title matches your allowed list, we show it
      if (allowedSections.includes(titleText)) {
        shouldShow = true;
      }
    }

    if (shouldShow) {
      shelf.style.display = ''; 
      shelf.removeAttribute('data-yt-extension-hidden');
    } else {
      shelf.style.display = 'none';
      // Mark it so we can easily unhide it later if we leave the home page
      shelf.setAttribute('data-yt-extension-hidden', 'true');
    }
  });
}

function loadSettingsAndRun() {
  chrome.storage.sync.get(['allowedSections'], (result) => {
    allowedSections = result.allowedSections || defaultAllowed;
    cleanPage();
  });
}

const observer = new MutationObserver(() => {
  cleanPage();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

loadSettingsAndRun();

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateLayout") {
    loadSettingsAndRun();
  }
});