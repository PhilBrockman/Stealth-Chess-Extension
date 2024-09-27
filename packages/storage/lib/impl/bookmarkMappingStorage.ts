import type { BookmarkMapping, BookmarkMappingStorage } from '../base/bookmarkMapping';
import { createStorage } from '../base/base';
import { StorageEnum } from '../base/enums';

const storage = createStorage<BookmarkMapping[]>('bookmark-mapping', [], {
  storageEnum: StorageEnum.Local,
});

export const bookmarkMappingStorage = {
  async getMapping(uuid) {
    const mappings = await storage.get();
    const mapping = mappings.find(m => m.uuid === uuid);
    return mapping ? mapping.internalId : undefined;
  },
  async setMapping(internalId, uuid) {
    const mappings = await storage.get();
    const existingMappingIndex = mappings.findIndex(m => m.uuid === uuid);
    if (existingMappingIndex > -1) {
      mappings[existingMappingIndex].internalId = internalId;
    } else {
      mappings.push({ internalId, uuid });
    }
    await storage.set(mappings);
  },
  async removeMapping(uuid) {
    const mappings = await storage.get();
    const updatedMappings = mappings.filter(m => m.uuid !== uuid);
    await storage.set(updatedMappings);
  },
} satisfies BookmarkMappingStorage;
