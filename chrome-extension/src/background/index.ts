import 'webextension-polyfill';
import { z } from 'zod';

// Define a schema for your theme data
const bookmarkletDataSchema = z.object({
  bookmarklets: z.array(z.string()),
  version: z.string(),
});

console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BOOKMARKLETS_UPDATED') {
    console.log('Bookmarklets updated event received from content script');
    console.log('message', { message });

    // Validate the received data
    const result = bookmarkletDataSchema.safeParse(message.data);
    if (result.success) {
      console.log('Bookmarklets:', result.data.bookmarklets);
      console.log('Version:', result.data.version);
    } else {
      console.error('Validation error:', result.error.errors);
    }
  }
});
