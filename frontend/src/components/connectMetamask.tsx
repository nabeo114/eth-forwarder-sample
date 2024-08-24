// src/App.tsx

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, Button, Typography, IconButton, Tooltip, Alert } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const ConnectMetamask: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const connectMetamask = async () => {
    setError(null);
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Metamaskへの接続をリクエスト
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // ethers.jsでプロバイダーを作成
        const provider = new ethers.BrowserProvider(window.ethereum);

        // サインインされたアカウントを取得
        const signer = await provider.getSigner();
        const accountAddress = await signer.getAddress();

        // アカウント情報をステートに保存
        setAddress(accountAddress);
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('Error connecting to Metamask:', errorMessage);
        setError(errorMessage);
      }
    } else {
      setError('Metamask is not installed. Please install Metamask to use this feature.');
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={connectMetamask} sx={{ mt: 2 }}>
        Connect Metamask
      </Button>
      {address && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">Account Address:</Typography>
            <Typography variant="body1" color="textSecondary">
              {address}
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
          </CardContent>
        </Card>
      )}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </>
  );
};

export default ConnectMetamask;
