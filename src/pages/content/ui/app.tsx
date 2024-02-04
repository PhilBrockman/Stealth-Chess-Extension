import { useEffect, useRef } from 'react';
import { hidePieces, showPieces } from '../lib/hidePieces';
import useStorage from '@root/src/shared/hooks/useStorage';
import enabledBehaviorStorage, { HideBehavior } from '@root/src/shared/storages/enabledBehaviorStorage';
import hidePreferencesStorage from '@root/src/shared/storages/hidePreferencesStorage';

export default function App() {
  const isHidden = useStorage(enabledBehaviorStorage);
  const enabledOnPath = useStorage(hidePreferencesStorage);
  const observerRef = useRef<MutationObserver | null>(null);
  useEffect(() => {
    const currentPath = window.location.href.split('/').splice(3).join('/');
    const matchingKey = Object.keys(enabledOnPath).find(key => currentPath.includes(key));

    if (isHidden === HideBehavior.enabled && enabledOnPath[matchingKey]) {
      observerRef.current = hidePieces();
    } else {
      observerRef.current?.disconnect();
      showPieces();
    }
  }, [isHidden]);

  return null;
}
