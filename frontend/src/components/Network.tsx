import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Typography, Alert } from '@mui/material';
import { useNetwork } from '../contexts/NetworkContext';

const Network: React.FC = () => {
  const { network, connectNetwork, error: networkError } = useNetwork();
  const [networkChainId, setNetworkChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkDetails = async () => {
    setError(null);
    try {
      setNetworkChainId((await network!.getId()).toString());
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching network details:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleConnectNetwork = async () => {
    setError(null);
    setLoading(true);
    try {
      await connectNetwork();
      if (network) {
        await fetchNetworkDetails();
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error connecting Network:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (network) {
      fetchNetworkDetails();
    }
  }, [network]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleConnectNetwork} sx={{ mt: 2 }} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Network'}
      </Button>
      {(networkError || error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {networkError || error}
        </Alert>
      )}
      {(networkChainId) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {networkChainId && (
              <Typography variant="h6">
                Chain ID: <Typography component="span" variant="body1" color="textSecondary">
                  {networkChainId}
                </Typography>
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Network;
