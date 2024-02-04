import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const Popup = () => {
  const isHidden = useStorage(exampleThemeStorage);
  return (
    <>
      <button onClick={() => exampleThemeStorage.toggle()}>{isHidden === 'enabled' ? 'Hide' : 'Show'} Pieces</button>
    </>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
