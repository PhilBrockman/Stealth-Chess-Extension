import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BOOKMARKLETS_UPDATED') {
    console.log('Bookmarklets updated event received from content script');
    console.log('message', { message });
    // Access the data sent
    console.log('Bookmarklets:', message.data.bookmarklets);
    console.log('Version:', message.data.version);
  }
});
