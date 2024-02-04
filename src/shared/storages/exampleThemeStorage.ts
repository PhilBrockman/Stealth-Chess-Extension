import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export enum HideBehavior {
  enabled = 'enabled',
  disabled = 'disabled',
}

type ThemeStorage = BaseStorage<HideBehavior> & {
  toggle: () => Promise<void>;
};

const storage = createStorage<HideBehavior>('theme-storage-key', HideBehavior.enabled, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const exampleThemeStorage: ThemeStorage = {
  ...storage,
  // TODO: extends your own methods
  toggle: async () => {
    await storage.set(currentTheme => {
      return currentTheme === HideBehavior.enabled ? HideBehavior.disabled : HideBehavior.enabled;
    });
  },
};

export default exampleThemeStorage;
