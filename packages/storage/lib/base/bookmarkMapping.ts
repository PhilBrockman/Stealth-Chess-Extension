export interface BookmarkMapping {
  internalId: string;
  uuid: string;
}

export interface BookmarkMappingStorage {
  getMapping(uuid: string): Promise<string | undefined>;
  setMapping(internalId: string, uuid: string): Promise<void>;
  removeMapping(uuid: string): Promise<void>;
}
