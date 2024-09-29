import React, { createContext, useContext, useState } from 'react';
import Web3 from 'web3';
import accounts from '../../../hardhat/data/accounts.json';
import type { Web3Account } from 'web3-eth-accounts';

interface WalletContextType {
  relayer: Web3Account | null;
  user1: Web3Account | null;
  user2: Web3Account | null;
  loadWallets: (provider: any | null) => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallets = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallets must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [relayer, setRelayer] = useState<Web3Account | null>(null);
  const [user1, setUser1] = useState<Web3Account | null>(null);
  const [user2, setUser2] = useState<Web3Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = async (provider: any | null) => {
    setError(null);
    try {
      if (!provider) {
        throw new Error('Provider is required to connect wallets');
      }

      // Web3インスタンスを作成
      const web3 = new Web3(provider);

      // 環境変数が設定されているか確認
      const keystorePassword = process.env.KEYSTORE_PASSWORD;
      if (!keystorePassword) {
        throw new Error('KEYSTORE_PASSWORD is not defined in environment variables');
      }

      if (accounts.relayer && accounts.user1 && accounts.user2) {
        // Relayerウォレットのインスタンスを作成し、networkに接続
        const relayerWallet = await web3.eth.accounts.decrypt(accounts.relayer.keystore, keystorePassword);
        const relayerAccount = web3.eth.accounts.privateKeyToAccount(relayerWallet.privateKey);
        web3.eth.accounts.wallet.add(relayerAccount);
        setRelayer(relayerAccount);

        // User1ウォレットのインスタンスを作成し、networkに接続
        const user1Wallet = await web3.eth.accounts.decrypt(accounts.user1.keystore, keystorePassword);
        const user1Account = web3.eth.accounts.privateKeyToAccount(user1Wallet.privateKey);
        web3.eth.accounts.wallet.add(user1Account);
        setUser1(user1Account);

        // User2ウォレットのインスタンスを作成し、networkに接続
        const user2Wallet = await web3.eth.accounts.decrypt(accounts.user2.keystore, keystorePassword);
        const user2Account = web3.eth.accounts.privateKeyToAccount(user2Wallet.privateKey);
        web3.eth.accounts.wallet.add(user2Account);
        setUser2(user2Account);
      } else {
        throw new Error('Wallets data is missing');
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <WalletContext.Provider value={{ relayer, user1, user2, loadWallets, error }}>
      {children}
    </WalletContext.Provider>
  );
};
