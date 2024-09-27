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
  SYNC_SINGLE_BOOKMARK = 'SYNC_SINGLE_BOOKMARK',
  IS_BOOKMARKLET_MAPPED = 'IS_BOOKMARKLET_MAPPED',
}

const updateBookmarklet = z.object({
  type: z.literal(MessageType.SET_ALL_BOOKMARKLETS),
  version: z.literal('1').default('1'),
  // data: bookmarkSchema.array(),
});
const syncSingleBookmarklet = z.object({
  type: z.literal(MessageType.SYNC_SINGLE_BOOKMARK),
  version: z.literal('1').default('1'),
  data: bookmarkSchema,
});
const isBookmarkletMapped = z.object({
  type: z.literal(MessageType.IS_BOOKMARKLET_MAPPED),
  version: z.literal('1').default('1'),
  data: bookmarkSchema.pick({ id: true }),
});
const messageSchema = z.discriminatedUnion('type', [updateBookmarklet, syncSingleBookmarklet, isBookmarkletMapped]);
export const parseMessage = (message: unknown) => messageSchema.parse(message);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  try {
    const parsedMessage = parseMessage(message);
    if (parsedMessage.type === MessageType.SET_ALL_BOOKMARKLETS) {
      throw new Error('Not implemented');
    } else if (parsedMessage.type === MessageType.SYNC_SINGLE_BOOKMARK) {
      console.log('Syncing single bookmarklet', parsedMessage.data);
      handleSyncBookmarklet(parsedMessage.data, sendResponse);
      return true; // Async response
    } else if (parsedMessage.type === MessageType.IS_BOOKMARKLET_MAPPED) {
      console.log('Checking if bookmarklet is mapped', parsedMessage.data);
      handleIsBookmarkletMapped(parsedMessage.data.id, sendResponse);
      return true; // Async response
    } else {
      console.error('Unknown message type:', parsedMessage.type);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    console.error('Received message:', message);
  }
  return false; // Synchronous response (or no response needed)
});

async function handleSyncBookmarklet(
  bookmarklet: Bookmarklet,
  sendResponse: (response: { isMapped: boolean; chromeBookmarkId?: string }) => void,
) {
  const bookmarksBarId = '1';
  const hasMappedPreivously = await bookmarkMappingStorage.getMapping(bookmarklet.id);
  if (hasMappedPreivously) {
    console.log('Updating bookmarklet', hasMappedPreivously);
    console.log('Updating bookmarklet', bookmarklet.bookmogrified);
    await chrome.bookmarks.update(hasMappedPreivously, {
      title: bookmarklet.name,
      url: bookmarklet.bookmogrified,
    });
    sendResponse({ isMapped: true, chromeBookmarkId: hasMappedPreivously });
  } else {
    console.log('Creating new bookmarklet', bookmarklet);
    const newBookmark = await chrome.bookmarks.create({
      parentId: bookmarksBarId,
      title: bookmarklet.name,
      url: bookmarklet.bookmogrified,
    });
    await bookmarkMappingStorage.setMapping(newBookmark.id, bookmarklet.id);
    sendResponse({ isMapped: false });
  }
}

async function handleIsBookmarkletMapped(
  bookmarkletId: string,
  sendResponse: (response: { isMapped: boolean; chromeBookmarkId?: string }) => void,
) {
  const hasMappedPreivously = await bookmarkMappingStorage.getMapping(bookmarkletId);
  console.log('hasMappedPreivously', hasMappedPreivously);
  sendResponse({ isMapped: !!hasMappedPreivously, chromeBookmarkId: hasMappedPreivously });
}
