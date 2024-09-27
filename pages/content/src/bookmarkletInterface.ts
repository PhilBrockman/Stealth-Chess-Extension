// Custom type for UUID
type UUID = string;

export interface Bookmarklet {
  id: UUID;
  name: string;
  code: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookmarkletAPI {
  getAll(): Promise<Bookmarklet[]>;
  create(bookmarklet: Omit<Bookmarklet, 'id'>): Promise<Bookmarklet>;
  update(id: UUID, bookmarklet: Partial<Omit<Bookmarklet, 'id'>>): Promise<Bookmarklet>;
  delete(id: UUID): Promise<void>;
  sync(): Promise<void>;
}

export interface StorageAdapter<T = unknown> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
