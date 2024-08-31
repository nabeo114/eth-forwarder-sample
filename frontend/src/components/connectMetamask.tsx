// src/App.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Typography, IconButton, Divider, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useMetamask } from '../contexts/MetamaskContext';

const ConnectMetamask: React.FC = () => {
  const { provider, signer, network, connectMetamask } = useMetamask();
  const [balance, setBalance] = useState<string | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [networkChainId, setNetworkChainId] = useState<string | null>(null);

  const handleCopyAddress = () => {
    if (accountAddress) {
      navigator.clipboard.writeText(accountAddress);
    }
  };

  const fetchAccountDetails = async () => {
    try {
      if (signer) {
        const address = await signer.getAddress();
        setAccountAddress(address);

        if (provider) {
          const balance = await provider.getBalance(address);
          setBalance(balance.toString());
        }
      }

      if (network) {
        setNetworkName(network.name);
        setNetworkChainId(network.chainId.toString());
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  const handleConnectMetamask = async () => {
    try {
      await connectMetamask();
      await fetchAccountDetails();
    } catch (error) {
      console.error('Failed to connect Metamask:', error);
    }
  };

  useEffect(() => {
    console.log(provider);
    if (provider && signer && network) {
      fetchAccountDetails();
    }
  }, [provider, signer, network]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleConnectMetamask} sx={{ mt: 2 }}>
        Connect Metamask
      </Button>
      {(accountAddress || balance) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {accountAddress && (
              <>
                <Typography variant="h6">Account Address:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {accountAddress}
                  <Tooltip title="Copy to clipboard" placement="top">
                    <IconButton
                      aria-label="copy wallet address"
                      onClick={handleCopyAddress}
                      edge="end"
                      sx={{ ml: 1 }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </>
            )}
            <Divider sx={{ my: 2 }} />
            {balance && (
              <>
                <Typography variant="h6">Balance:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {balance} wei
                </Typography>
              </>
            )}
            <Divider sx={{ my: 2 }} />
            {(networkName && networkChainId) && (
              <>
                <Typography variant="h6">Network Name:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {networkName}
                </Typography>
                <Typography variant="h6">Chain ID:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {networkChainId}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ConnectMetamask;
