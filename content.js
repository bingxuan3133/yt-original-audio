console.log("✅ content.js loaded");

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

// ------------------- Poll for Audio Track menu item -------------------
async function waitForAudioTrackMenuItem(timeout = 3000) {
  const interval = 50;
  let elapsed = 0;

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const item = Array.from(document.querySelectorAll(".ytp-menuitem"))
        .find(el => el.innerText.toLowerCase().includes("audio track"));

      if (item) {
        clearInterval(timer);
        resolve(item);
      } else if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject(new Error("Audio track menu item not found"));
      }
    }, interval);
  });
}

// ------------------- Main function: Switch to original track -------------------
async function switchAudioToOriginal() {
  try {
    // 1️⃣ Wait for video player and settings button
    await waitFor(".html5-video-player");
    const settingsButton = await waitFor(".ytp-settings-button");
    settingsButton.click(); // open settings menu

    // 2️⃣ Wait for Audio Track menu item and open submenu
    const audioMenuItem = await waitForAudioTrackMenuItem();
    audioMenuItem.click();

    // 3️⃣ Wait for track items to render
    const originalTrack = await new Promise((resolve, reject) => {
      const interval = 50;
      let elapsed = 0;

      const timer = setInterval(() => {
        const tracks = Array.from(document.querySelectorAll(".ytp-menuitem[role='menuitemradio']"));
        const original = tracks.find(t =>
          t.querySelector(".ytp-menuitem-label")?.innerText.toLowerCase().includes("original")
        );
        if (original) {
          clearInterval(timer);
          resolve(original);
        } else if ((elapsed += interval) >= 3000) {
          clearInterval(timer);
          reject("Original track not found");
        }
      }, interval);
    });

    // 4️⃣ Click if not already active
    if (originalTrack.getAttribute("aria-checked") !== "true") {
      originalTrack.click();
      console.log("Switched audio track to original:", originalTrack.querySelector(".ytp-menuitem-label").innerText);
    } else {
      console.log("Original track is already active");
    }

    // close menu
    settingsButton.click();

  } catch (e) {
    console.warn("Error switching audio track:", e);
  }
}

// ------------------- Auto-run on page load -------------------
window.addEventListener("load", () => {
  setTimeout(switchAudioToOriginal, 500);
});

// ------------------- SPA navigation handling -------------------
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(switchAudioToOriginal, 500);
  }
}).observe(document, { subtree: true, childList: true });
