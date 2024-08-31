import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { useMetamask } from './MetamaskContext';
import contracts from '../../../hardhat/data/contracts.json';

interface ContractContextType {
  forwarder: ethers.Contract | null;
  recipient: ethers.Contract | null;
  loadContracts: () => Promise<void>;
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
  const { signer } = useMetamask();
  const [forwarder, setForwarder] = useState<ethers.Contract | null>(null);
  const [recipient, setRecipient] = useState<ethers.Contract | null>(null);

  const loadContracts = async () => {
    try {
      // Forwarderコントラクトのインスタンスを作成
      const forwarderContract = new ethers.Contract(
        contracts.forwarder.contractAddress,
        JSON.parse(contracts.forwarder.contractABI),
        signer
      );
      setForwarder(forwarderContract);

      // Recipientコントラクトのインスタンスを作成
      const recipientContract = new ethers.Contract(
        contracts.recipient.contractAddress,
        JSON.parse(contracts.recipient.contractABI),
        signer
      );
      setRecipient(recipientContract);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    }
  };

  return (
    <ContractContext.Provider value={{ forwarder, recipient, loadContracts }}>
      {children}
    </ContractContext.Provider>
  );
};
