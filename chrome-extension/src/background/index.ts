import 'webextension-polyfill';
import { z } from 'zod';
import { bookmarkMappingStorage } from '@extension/storage';

// Define a schema for your theme data
export const bookmarkSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
});
type Bookmarklet = z.infer<typeof bookmarkSchema>;

export enum MessageType {
  SET_ALL_BOOKMARKLETS = 'SET_ALL_BOOKMARKLETS',
  CREATE_BOOKMARK = 'CREATE_BOOKMARK',
  SYNC_SINGLE_BOOKMARK = 'SYNC_SINGLE_BOOKMARK',
}

const updateBookmarklet = z.object({
  type: z.literal(MessageType.SET_ALL_BOOKMARKLETS),
  version: z.literal('1'),
  data: bookmarkSchema.array(),
});
const createBookmarklet = z.object({
  type: z.literal(MessageType.CREATE_BOOKMARK),
  version: z.literal('1'),
  data: bookmarkSchema.omit({ id: true }),
});
const syncSingleBookmarklet = z.object({
  type: z.literal(MessageType.SYNC_SINGLE_BOOKMARK),
  version: z.literal('1'),
  data: bookmarkSchema,
});

const messageSchema = z.discriminatedUnion('type', [updateBookmarklet, createBookmarklet, syncSingleBookmarklet]);
export const parseMessage = (message: unknown) => messageSchema.parse(message);

chrome.runtime.onMessage.addListener(message => {
  const parsedMessage = parseMessage(message);
  if (parsedMessage.type === MessageType.SET_ALL_BOOKMARKLETS) {
    syncBookmarks(parsedMessage.data)
      .then(() => console.log('Bookmarks synced successfully'))
      .catch(error => console.error('Error syncing bookmarks:', error));
  } else if (parsedMessage.type === MessageType.SYNC_SINGLE_BOOKMARK) {
    handleSyncBookmarklet(parsedMessage.data);
  } else {
    console.error('Unknown message type:', parsedMessage.type);
  }
});

const SENTINEL = 'BOOKMARKLET_SYNC_ID:';
const featureFlagSyncEnabled = false; // Feature flag for enabling destructive sync actions

async function syncBookmarks(bookmarklets: Array<{ id: string; name: string; code: string }>) {
  const bookmarksBarId = '1';
  const existingBookmarks = await chrome.bookmarks.getChildren(bookmarksBarId);

  for (const bookmarklet of bookmarklets) {
    const internalId = await bookmarkMappingStorage.getMapping(bookmarklet.id);
    if (internalId) {
      // Update existing bookmark
      await chrome.bookmarks.update(internalId, {
        title: bookmarklet.name,
        url: `javascript:${SENTINEL}${bookmarklet.id};${bookmarklet.code}`,
      });
    } else {
      // Create new bookmark
      const newBookmark = await chrome.bookmarks.create({
        parentId: bookmarksBarId,
        title: bookmarklet.name,
        url: `javascript:${SENTINEL}${bookmarklet.id};${bookmarklet.code}`,
      });
      await bookmarkMappingStorage.setMapping(newBookmark.id, bookmarklet.id);
    }
  }

  // Remove bookmarks that no longer exist in bookmarklets
  for (const existingBookmark of existingBookmarks) {
    const uuidMatch = existingBookmark.url?.match(new RegExp(`${SENTINEL}([\\w-]+)`));
    if (uuidMatch) {
      const uuid = uuidMatch[1];
      if (!bookmarklets.some(b => b.id === uuid)) {
        await chrome.bookmarks.remove(existingBookmark.id);
        await bookmarkMappingStorage.removeMapping(uuid);
      }
    }
  }

  console.log(`Sync completed. Destructive actions are currently ${featureFlagSyncEnabled ? 'enabled' : 'disabled'}.`);
}

async function handleSyncBookmarklet(bookmarklet: Bookmarklet) {
  const bookmarksBarId = '1';
  const hasMappedPreivously = await bookmarkMappingStorage.getMapping(bookmarklet.id);
  if (hasMappedPreivously) {
    console.log('Updating bookmarklet', hasMappedPreivously);
    await chrome.bookmarks.update(hasMappedPreivously, {
      title: bookmarklet.name,
      url: `javascript:${SENTINEL}${bookmarklet.id};${bookmarklet.code}`,
    });
  } else {
    console.log('Creating new bookmarklet', bookmarklet);
    const newBookmark = await chrome.bookmarks.create({
      parentId: bookmarksBarId,
      title: bookmarklet.name,
      url: `javascript:${SENTINEL}${bookmarklet.id};${bookmarklet.code}`,
    });
    await bookmarkMappingStorage.setMapping(newBookmark.id, bookmarklet.id);
  }
}
