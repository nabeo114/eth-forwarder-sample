import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

interface NetworkContextType {
  provider: ethers.JsonRpcProvider | null;
  network: ethers.Network | null;
  connectNetwork: () => Promise<void>;
  error: string | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectNetwork = async () => {
    try {
      // 環境変数が設定されているか確認
      const infuraApiKey = process.env.INFURA_API_KEY;
      if (!infuraApiKey) {
        throw new Error('INFURA_API_KEY is not defined in environment variables');
      }

      // InfuraのURLからプロバイダーを生成
      const providerUrl = `https://polygon-amoy.infura.io/v3/${infuraApiKey}`;
      const provider = new ethers.JsonRpcProvider(providerUrl);
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setNetwork(network);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <NetworkContext.Provider value={{ provider, network, connectNetwork, error }}>
      {children}
    </NetworkContext.Provider>
  );
};
