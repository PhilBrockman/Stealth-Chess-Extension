import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import enabledBehaviorStorage from '@root/src/shared/storages/enabledBehaviorStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const Popup = () => {
  const isHidden = useStorage(enabledBehaviorStorage);
  return (
    <>
      <button onClick={() => enabledBehaviorStorage.toggle()}>{isHidden === 'enabled' ? 'Hide' : 'Show'} Pieces</button>
    </>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
