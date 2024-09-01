import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Typography, Divider, Alert } from '@mui/material';
import { useMetamask } from '../contexts/MetamaskContext';
import { useWallets } from '../contexts/WalletContext';

const LoadWallets: React.FC = () => {
  const { provider, signer } = useMetamask();
  const { relayer, user1, user2, loadWallets } = useWallets();
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);
  const [relayerBalance, setRelayerBalance] = useState<string | null>(null);
  const [user1Address, setUser1Address] = useState<string | null>(null);
  const [user1Balance, setUser1Balance] = useState<string | null>(null);
  const [user2Address, setUser2Address] = useState<string | null>(null);
  const [user2Balance, setUser2Balance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletDetails = async () => {
    setError(null);
    try {
      if (relayer) {
        const address = await relayer.getAddress();
        setRelayerAddress(address);

        if (provider) {
          const balance = await provider.getBalance(address);
          setRelayerBalance(balance.toString());
        }
      }
      if (user1) {
        const address = await user1.getAddress();
        setUser1Address(address);

        if (provider) {
          const balance = await provider.getBalance(address);
          setUser1Balance(balance.toString());
        }
      }
      if (user2) {
        const address = await user2.getAddress();
        setUser2Address(address);

        if (provider) {
          const balance = await provider.getBalance(address);
          setUser2Balance(balance.toString());
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching wallets details:', errorMessage);
      setError(errorMessage);
    }
  }

  const handleLoadWallets = async () => {
    setError(null);
    try {
      await loadWallets(signer);
      await fetchWalletDetails();
      console.log("handleLoadWallets:", { relayer, user1, user2 });
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error loading wallets:', errorMessage);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    console.log("useEffect:", { relayer, user1, user2, provider, signer });
    if (relayer && user1 && user2 ) {
      fetchWalletDetails();
    }
  }, [relayer, user1, user2]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleLoadWallets} sx={{ mt: 2 }}>
        Load Wallets
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {((relayerAddress && relayerBalance) || (user1Address && user1Balance) || (user2Address && user2Balance)) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {(relayerAddress && relayerBalance) && (
              <>
                <Typography variant="h6">
                  Relayer Address: <Typography component="span" variant="body1" color="textSecondary">
                    {relayerAddress}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  Relayer Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {relayerBalance}
                  </Typography>
                </Typography>
              </>
            )}
            {(user1Address && user1Balance) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  User1 Address: <Typography component="span" variant="body1" color="textSecondary">
                    {user1Address}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  User1 Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {user1Balance}
                  </Typography>
                </Typography>
              </>
            )}
            {(user2Address && user2Balance) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  User2 Address: <Typography component="span" variant="body1" color="textSecondary">
                    {user2Address}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  User2 Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {user2Balance}
                  </Typography>
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )

}

export default LoadWallets;
