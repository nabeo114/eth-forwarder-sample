import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import contracts from '../../../hardhat/data/contracts.json';

interface ContractContextType {
  forwarder: ethers.Contract | null;
  recipient: ethers.Contract | null;
  loadContracts: (provider: ethers.Provider | null) => Promise<void>;
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [forwarder, setForwarder] = useState<ethers.Contract | null>(null);
  const [recipient, setRecipient] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async (provider: ethers.Provider | null) => {
    setError(null);
    try {
      if (!provider) {
        throw new Error('Provider is required to connect contracts');
      }

      if (contracts.forwarder && contracts.recipient) {
        // Forwarderコントラクトのインスタンスを作成
        const forwarderContract = new ethers.Contract(
          contracts.forwarder.contractAddress,
          JSON.parse(contracts.forwarder.contractABI),
          provider
        );
        setForwarder(forwarderContract);

        // Recipientコントラクトのインスタンスを作成
        const recipientContract = new ethers.Contract(
          contracts.recipient.contractAddress,
          JSON.parse(contracts.recipient.contractABI),
          provider
        );
        setRecipient(recipientContract);
      } else {
        throw new Error('Contracts data is missing');
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <ContractContext.Provider value={{ forwarder, recipient, loadContracts, error }}>
      {children}
    </ContractContext.Provider>
  );
};
