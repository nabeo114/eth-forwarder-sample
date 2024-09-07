import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import accounts from '../../../hardhat/data/accounts.json';

interface WalletContextType {
  relayer: ethers.Signer | null;
  user1: ethers.Signer | null;
  user2: ethers.Signer | null;
  loadWallets: (provider: ethers.Provider | null) => Promise<void>;
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
  const [relayer, setRelayer] = useState<ethers.Signer | null>(null);
  const [user1, setUser1] = useState<ethers.Signer | null>(null);
  const [user2, setUser2] = useState<ethers.Signer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = async (provider: ethers.Provider | null) => {
    setError(null);
    try {
      if (!provider) {
        throw new Error('Provider is required to connect wallets');
      }

      // 環境変数が設定されているか確認
      const keystorePassword = process.env.KEYSTORE_PASSWORD;
      if (!keystorePassword) {
        throw new Error('KEYSTORE_PASSWORD is not defined in environment variables');
      }

      if (accounts.relayer && accounts.user1 && accounts.user2) {
        // Relayerウォレットのインスタンスを作成し、networkに接続
        const relayerWallet = await ethers.Wallet.fromEncryptedJson(
          accounts.relayer.keystore,
          keystorePassword
        );
        const relayerConnected = relayerWallet.connect(provider);
        setRelayer(relayerConnected);

        // User1ウォレットのインスタンスを作成し、networkに接続
        const user1Wallet = await ethers.Wallet.fromEncryptedJson(
          accounts.user1.keystore,
          keystorePassword
        );
        const user1Connected = user1Wallet.connect(provider);
        setUser1(user1Connected);

        // User2ウォレットのインスタンスを作成し、networkに接続
        const user2Wallet = await ethers.Wallet.fromEncryptedJson(
          accounts.user2.keystore,
          keystorePassword
        );
        const user2Connected = user2Wallet.connect(provider);
        setUser2(user2Connected);
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
