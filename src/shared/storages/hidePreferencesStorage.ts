import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

// Define a type for the storage structure that holds the hiding behavior for each route
type RouteHidePreferences = {
  [key: string]: boolean;
};

// Extend the BaseStorage to include methods for managing route preferences
type HidePreferencesStorage = BaseStorage<RouteHidePreferences> & {
  setRouteHideBehavior: (route: string, behavior: boolean) => Promise<void>;
  toggleRouteHideBehavior: (route: string) => Promise<void>;
};

// Create a default state for the routes
const defaultRoutePreferences: RouteHidePreferences = {
  'play/computer': true,
  'game/daily': true,
  'puzzles/rated': false,
  'analysis/game/live': true,
};

// Create the storage for route preferences
const storage = createStorage<RouteHidePreferences>('default-route-preferences-key', defaultRoutePreferences, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

// Implement the extended storage with methods for specific route management
const hidePreferencesStorage: HidePreferencesStorage = {
  ...storage,
  setRouteHideBehavior: async (route, behavior) => {
    await storage.set(currentPreferences => ({
      ...currentPreferences,
      [route]: behavior,
    }));
  },
  toggleRouteHideBehavior: async route => {
    await storage.set(currentPreferences => ({
      ...currentPreferences,
      [route]: !currentPreferences[route],
    }));
  },
};

export default hidePreferencesStorage;
