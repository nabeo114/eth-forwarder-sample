import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import accounts from '../../../hardhat/data/accounts.json';

interface WalletContextType {
  relayer: ethers.Signer | null;
  user1: ethers.Signer | null;
  user2: ethers.Signer | null;
  loadWallets: (relayer: ethers.Signer | null) => Promise<void>;
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

  const loadWallets = async (signer: ethers.Signer | null) => {
    try {
      if (signer) {
        setRelayer(signer);
      } else {
        console.error('Signer is not available');
      }

      if (accounts.user1 && accounts.user2) {
        // User1ウォレットのインスタンスを作成
        const user1Wallet = await ethers.Wallet.fromEncryptedJson(
          accounts.user1.keystore,
          accounts.user1.password
        );
        setUser1(user1Wallet);

        // User2ウォレットのインスタンスを作成
        const user2Wallet = await ethers.Wallet.fromEncryptedJson(
          accounts.user2.keystore,
          accounts.user2.password
        );
        setUser2(user2Wallet);
      } else {
        console.error('Wallets data is missing');
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  };

  return (
    <WalletContext.Provider value={{ relayer, user1, user2, loadWallets }}>
      {children}
    </WalletContext.Provider>
  );
};
