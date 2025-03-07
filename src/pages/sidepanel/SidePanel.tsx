import React from 'react';
import '@pages/sidepanel/SidePanel.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const SidePanel = () => {
  // const theme = useStorage(exampleThemeStorage);

  return null;
  // <div
  //   className="App"
  //   style={{
  //     backgroundColor: theme === 'light' ? '#fff' : '#000',
  //   }}>
  //   <header className="App-header" style={{ color: theme === 'light' ? '#000' : '#fff' }}>
  //     <img src={logo} className="App-logo" alt="logo" />
  //     <p>
  //       Edit <code>src/pages/sidepanel/SidePanel.tsx</code> and save to reload.
  //     </p>
  //     <a
  //       className="App-link"
  //       href="https://reactjs.org"
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       style={{ color: theme === 'light' && '#0281dc', marginBottom: '10px' }}>
  //       Learn React!
  //     </a>
  //     <button
  //       style={{
  //         backgroundColor: theme === 'light' ? '#fff' : '#000',
  //         color: theme === 'light' ? '#000' : '#fff',
  //       }}
  //       onClick={exampleThemeStorage.toggle}>
  //       Toggle theme
  //     </button>
  //   </header>
  // </div>
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
