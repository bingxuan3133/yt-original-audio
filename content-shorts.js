console.log("✅ content-shorts.js loaded");

// ------------------- Helper: Poll for element -------------------
function waitFor(selector, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject(new Error("Element not found: " + selector));
      }
    }, interval);
  });
}

// ------------------- Poll for Audio menu item in Shorts -------------------
async function waitForAudioMenuItem(timeout = 3000) {
  const interval = 50;
  let elapsed = 0;

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const items = Array.from(document.querySelectorAll('yt-list-item-view-model'));
      const audioItem = items.find(el => {
        const label = el.querySelector('.yt-list-item-view-model__title');
        return label && label.innerText.toLowerCase().includes("audio track");
      });

      if (audioItem) {
        clearInterval(timer);
        resolve(audioItem);
      } else if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject(new Error("Audio menu item not found"));
      }
    }, interval);
  });
}


// ------------------- Poll for Original track in Shorts -------------------
async function waitForOriginalTrack(timeout = 3000) {
  const interval = 50;
  let elapsed = 0;

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const tracks = Array.from(document.querySelectorAll('yt-list-item-view-model'));
      const original = tracks.find(track => {
        const title = track.querySelector('.yt-list-item-view-model__title');
        return title && title.innerText.toLowerCase().includes("original");
      });

      if (original) {
        clearInterval(timer);
        resolve(original);
      } else if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject(new Error("Original track not found"));
      }
    }, interval);
  });
}

// ------------------- Main function: Switch to Original Track -------------------
async function switchToOriginalShort() {
  try {
    // 1️⃣ Wait for the three-dots menu button
    const menuButton = await waitFor('ytd-menu-renderer yt-icon-button');
    menuButton.click();

    // 2️⃣ Wait for Audio menu item inside dropdown and click it
    const audioItem = await waitForAudioMenuItem();
    audioItem.click();

    // 3️⃣ Wait for Original track and click if not active
    const originalTrack = await waitForOriginalTrack();
    const radioInput = originalTrack.querySelector('input[type="radio"]');

    if (!radioInput.checked) {
      originalTrack.click();
      console.log("Switched to Original track ✅");
    } else {
      console.log("Original track already active");
    }

    // close menu
    menuButton.click();

  } catch (err) {
    console.warn("Error switching Shorts audio track:", err);
  }
}

// ------------------- Auto-run on page load -------------------
window.addEventListener("load", () => {
  setTimeout(switchToOriginalShort, 500);
});

// ------------------- SPA navigation handling -------------------
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(switchToOriginalShort, 500);
  }
}).observe(document, { subtree: true, childList: true });
