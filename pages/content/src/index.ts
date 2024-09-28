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

window.addEventListener('createBookmarkletMapping', event => {
  // Send a message to the background script with the event data
  console.log('creating! ee', { detail: event.detail });
  chrome.runtime.sendMessage(
    {
      type: 'SYNC_SINGLE_BOOKMARK',
      data: event.detail.data, // Access the detail property for the data
    },
    response => {
      window.dispatchEvent(new CustomEvent('bookmarkletMappingCreated', { detail: response }));
    },
  );
});

window.addEventListener('deleteBookmorgifiedBookmarklet', event => {
  console.log('deleting! ee', { detail: event.detail });
  chrome.runtime.sendMessage({
    type: 'DELETE_SINGLE_BOOKMARK',
    data: event.detail.data, // Access the detail property for the data
  });
});

window.addEventListener('checkBookmarkletMapped', event => {
  console.log(' > > Checking if bookmarklet is mapped', event.detail);
  chrome.runtime.sendMessage(
    {
      type: 'IS_BOOKMARKLET_MAPPED',
      data: event.detail.data,
    },
    response => {
      console.log('Bookmarklet mapped status:', response.isMapped);
      // Here you can handle the response, e.g., dispatch a new event with the result
      window.dispatchEvent(new CustomEvent('bookmarkletMappedResult', { detail: response }));
    },
  );
});

window.addEventListener('checkExtensionConnection', () => {
  console.log('Checking extension connection');
  chrome.runtime.sendMessage(
    {
      type: 'CHECK_CONNECTION',
    },
    response => {
      console.log('Extension connection status:', response.isConnected);
      window.dispatchEvent(new CustomEvent('extensionConnectionStatus', { detail: response }));
    },
  );
});

window.addEventListener('requestExtensionConnection', () => {
  console.log('Requesting extension connection');
  chrome.runtime.sendMessage(
    {
      type: 'REQUEST_CONNECTION',
    },
    response => {
      console.log('Extension connection request result:', response.isConnected);
      window.dispatchEvent(new CustomEvent('extensionConnectionResult', { detail: response }));
    },
  );
});

window.addEventListener('deleteBookmarkletMapping', event => {
  console.log('Deleting bookmarklet mapping', event.detail);
  chrome.runtime.sendMessage(
    {
      type: 'DELETE_SINGLE_BOOKMARK',
      data: event.detail.data,
    },
    response => {
      console.log('Bookmarklet mapping deletion result:', response);
      window.dispatchEvent(new CustomEvent('bookmarkletMappingDeleted', { detail: response }));
    },
  );
});
