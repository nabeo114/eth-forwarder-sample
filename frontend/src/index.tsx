import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { MetamaskProvider } from './contexts/MetamaskContext';
import { ContractProvider } from './contexts/ContractContext';
import { WalletProvider } from './contexts/WalletContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <MetamaskProvider>
      <ContractProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </ContractProvider>
    </MetamaskProvider>
  );
}
