import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { NetworkProvider } from './contexts/NetworkContext';
import { ContractProvider } from './contexts/ContractContext';
import { WalletProvider } from './contexts/WalletContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <NetworkProvider>
      <ContractProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </ContractProvider>
    </NetworkProvider>
  );
}
