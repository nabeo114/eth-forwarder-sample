import React, { createContext, useContext, useState } from 'react';
import Web3 from 'web3';
import contracts from '../../../hardhat/data/contracts.json';

interface ContractContextType {
  forwarder: any | null;
  recipient: any | null;
  loadContracts: (provider: Web3 | null) => Promise<void>;
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
  const [forwarder, setForwarder] = useState<any | null>(null);
  const [recipient, setRecipient] = useState<any| null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async (provider: Web3 | null) => {
    setError(null);
    try {
      if (!provider) {
        throw new Error('Provider is required to connect contracts');
      }

      if (contracts.forwarder && contracts.recipient) {
        // Forwarderコントラクトのインスタンスを作成
        const forwarderContract = new provider.eth.Contract(
          JSON.parse(contracts.forwarder.contractABI),
          contracts.forwarder.contractAddress
        );
        setForwarder(forwarderContract);

        // Recipientコントラクトのインスタンスを作成
        const recipientContract = new provider.eth.Contract(
          JSON.parse(contracts.recipient.contractABI),
          contracts.recipient.contractAddress
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
