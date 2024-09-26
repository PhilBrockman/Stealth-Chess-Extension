import { toggleTheme } from '@src/toggleTheme';

console.log('content script loaded');

// Listen for the custom event
window.addEventListener('bookmogrifyBookmarkletsUpdated', event => {
  // Send a message to the background script with the event data
  console.log('bookmogrifyBookmarkletsUpdated event received');
  chrome.runtime.sendMessage({
    type: 'BOOKMARKLETS_UPDATED',
    data: event.detail, // Access the detail property for the data
  });
});

// Optionally, you can also call toggleTheme or other functions here
void toggleTheme();
