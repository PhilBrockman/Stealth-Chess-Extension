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
  console.log('creating! ee', { detail: event.detail });
  chrome.runtime.sendMessage({
    type: 'SYNC_SINGLE_BOOKMARK',
    data: event.detail.data, // Access the detail property for the data
  });
});

// Optionally, you can also call toggleTheme or other functions here
void toggleTheme();

window.addEventListener('checkBookmarkletMapped', event => {
  console.log('Checking if bookmarklet is mapped', event.detail);
  chrome.runtime.sendMessage(
    {
      type: 'IS_BOOKMARKLET_MAPPED',
      data: { id: event.detail.bookmarkletId },
    },
    response => {
      console.log('Bookmarklet mapped status:', response.isMapped);
      // Here you can handle the response, e.g., dispatch a new event with the result
      window.dispatchEvent(new CustomEvent('bookmarkletMappedResult', { detail: response }));
    },
  );
});
