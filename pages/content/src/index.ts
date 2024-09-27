import { toggleTheme } from '@src/toggleTheme';

console.log('content script loaded');

// Listen for the custom event
window.addEventListener('bookmogrifyBookmarkletsUpdated', event => {
  // Send a message to the background script with the event data
  console.log('bookmogrifyBookmarkletsUpdated event received');
  chrome.runtime.sendMessage({
    type: 'SET_ALL_BOOKMARKLETS',
    data: event.detail, // Access the detail property for the data
  });
});

window.addEventListener('newBookmorgifiedBookmarklet', event => {
  // Send a message to the background script with the event data
  console.log('creating! ee');
  chrome.runtime.sendMessage({
    type: 'CREATE_BOOKMARK',
    data: event.detail, // Access the detail property for the data
  });
});

// Optionally, you can also call toggleTheme or other functions here
void toggleTheme();
