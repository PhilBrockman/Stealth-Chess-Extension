import 'webextension-polyfill';
import { z } from 'zod';

// Define a schema for your theme data
const bookmarkletDataSchema = z.object({
  bookmarklets: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      code: z.string(),
    }),
  ),
  version: z.string(),
});

console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'BOOKMARKLETS_UPDATED') {
    console.log('Bookmarklets updated event received from content script');
    console.log('message', { message });

    // Validate the received data
    const result = bookmarkletDataSchema.safeParse(message.data);
    if (result.success) {
      console.log('Bookmarklets:', result.data.bookmarklets);
      console.log('Version:', result.data.version);

      // Sync the bookmarks
      syncBookmarks(result.data.bookmarklets)
        .then(() => console.log('Bookmarks synced successfully'))
        .catch(error => console.error('Error syncing bookmarks:', error));
    } else {
      console.error('Validation error:', result.error.errors);
    }
  }
});

const SENTINEL = 'BOOKMARKLET_SYNC_ID:';
const featureFlagSyncEnabled = false; // Feature flag for enabling destructive sync actions

async function syncBookmarks(bookmarklets: Array<{ id: string; name: string; code: string }>) {
  const bookmarksBarId = '1'; // The ID of the bookmarks bar folder
  const existingBookmarks = await chrome.bookmarks.getChildren(bookmarksBarId);

  for (const existingBookmark of existingBookmarks) {
    if (existingBookmark.url?.startsWith('javascript:') && existingBookmark.url.includes(SENTINEL)) {
      const uuidMatch = existingBookmark.url.match(new RegExp(`${SENTINEL}([\\w-]+)`));
      if (uuidMatch) {
        const uuid = uuidMatch[1];
        const matchingBookmarklet = bookmarklets.find(b => b.id === uuid);

        if (matchingBookmarklet) {
          if (
            existingBookmark.title !== matchingBookmarklet.name ||
            existingBookmark.url !== matchingBookmarklet.code
          ) {
            if (featureFlagSyncEnabled) {
              await chrome.bookmarks.update(existingBookmark.id, {
                title: matchingBookmarklet.name,
                url: matchingBookmarklet.code,
              });
              console.log(`Updated bookmark: ${existingBookmark.title} -> ${matchingBookmarklet.name}`);
            } else {
              console.log(`Would have updated bookmark: ${existingBookmark.title} -> ${matchingBookmarklet.name}`);
            }
          }
        } else {
          if (featureFlagSyncEnabled) {
            await chrome.bookmarks.remove(existingBookmark.id);
            console.log(`Removed bookmark: ${existingBookmark.title}`);
          } else {
            console.log(`Would have removed bookmark: ${existingBookmark.title}`);
          }
        }
      }
    }
  }

  for (const bookmarklet of bookmarklets) {
    const existingBookmark = existingBookmarks.find(b => b.url?.includes(`${SENTINEL}${bookmarklet.id}`));
    if (!existingBookmark) {
      if (featureFlagSyncEnabled) {
        await chrome.bookmarks.create({
          parentId: bookmarksBarId,
          title: bookmarklet.name,
          url: `javascript:${SENTINEL}${bookmarklet.id};${bookmarklet.code}`,
        });
        console.log(`Created new bookmark: ${bookmarklet.name}`);
      } else {
        console.log(`Would have created new bookmark: ${bookmarklet.name}`);
      }
    }
  }

  console.log(`Sync completed. Destructive actions are currently ${featureFlagSyncEnabled ? 'enabled' : 'disabled'}.`);
}
