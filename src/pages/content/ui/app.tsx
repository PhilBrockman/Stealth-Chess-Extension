import { useEffect , useRef } from 'react';
import { hidePieces, showPieces } from '../lib/hidePieces';
import useStorage from '@root/src/shared/hooks/useStorage';
import exampleThemeStorage, { HideBehavior } from '@root/src/shared/storages/exampleThemeStorage';

export default function App() {
  const isHidden = useStorage(exampleThemeStorage);
  const observerRef = useRef<MutationObserver | null>(null);
  useEffect(() => {
    if (isHidden === HideBehavior.enabled) {
      observerRef.current = hidePieces();
    } else {
      observerRef.current?.disconnect();
      showPieces();
    }
  }, [isHidden]);

  return null;
}
