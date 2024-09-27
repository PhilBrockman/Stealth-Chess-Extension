import 'webextension-polyfill';
import { z } from 'zod';
import { bookmarkMappingStorage } from '@extension/storage';

// Define a schema for your theme data
export const bookmarkSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bookmogrified: z.string(),
});
type Bookmarklet = z.infer<typeof bookmarkSchema>;

export enum MessageType {
  SET_ALL_BOOKMARKLETS = 'SET_ALL_BOOKMARKLETS',
  CREATE_BOOKMARK = 'CREATE_BOOKMARK',
  SYNC_SINGLE_BOOKMARK = 'SYNC_SINGLE_BOOKMARK',
}

const updateBookmarklet = z.object({
  type: z.literal(MessageType.SET_ALL_BOOKMARKLETS),
  version: z.literal('1').default('1'),
  data: bookmarkSchema.array(),
});
const createBookmarklet = z.object({
  type: z.literal(MessageType.CREATE_BOOKMARK),
  version: z.literal('1').default('1'),
  data: bookmarkSchema.omit({ id: true }),
});
const syncSingleBookmarklet = z.object({
  type: z.literal(MessageType.SYNC_SINGLE_BOOKMARK),
  version: z.literal('1').default('1'),
  data: bookmarkSchema,
});

const messageSchema = z.discriminatedUnion('type', [updateBookmarklet, createBookmarklet, syncSingleBookmarklet]);
export const parseMessage = (message: unknown) => messageSchema.parse(message);

chrome.runtime.onMessage.addListener(message => {
  console.log('Received message:', message);
  try {
    const parsedMessage = parseMessage(message);
    if (parsedMessage.type === MessageType.SET_ALL_BOOKMARKLETS) {
      throw new Error('Not implemented');
      // syncBookmarks(parsedMessage.data)
      // .then(() => console.log('Bookmarks synced successfully'))
      // .catch(error => console.error('Error syncing bookmarks:', error));
    } else if (parsedMessage.type === MessageType.SYNC_SINGLE_BOOKMARK) {
      console.log('Syncing single bookmarklet', parsedMessage.data);
      handleSyncBookmarklet(parsedMessage.data);
    } else {
      console.error('Unknown message type:', parsedMessage.type);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    console.error('Received message:', message);
  }
});

async function handleSyncBookmarklet(bookmarklet: Bookmarklet) {
  const bookmarksBarId = '1';
  const hasMappedPreivously = await bookmarkMappingStorage.getMapping(bookmarklet.id);
  if (hasMappedPreivously) {
    console.log('Updating bookmarklet', hasMappedPreivously);
    console.log('Updating bookmarklet', bookmarklet.bookmogrified);
    await chrome.bookmarks.update(hasMappedPreivously, {
      title: bookmarklet.name,
      url: bookmarklet.bookmogrified,
    });
  } else {
    console.log('Creating new bookmarklet', bookmarklet);
    const newBookmark = await chrome.bookmarks.create({
      parentId: bookmarksBarId,
      title: bookmarklet.name,
      url: bookmarklet.bookmogrified,
    });
    await bookmarkMappingStorage.setMapping(newBookmark.id, bookmarklet.id);
  }
}
