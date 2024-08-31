import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { MetamaskProvider } from './contexts/MetamaskContext';
import { ContractProvider } from './contexts/ContractContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <MetamaskProvider>
      <ContractProvider>
        <App />
      </ContractProvider>
    </MetamaskProvider>
  );
}
