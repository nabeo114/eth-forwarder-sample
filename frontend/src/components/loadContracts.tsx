import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Typography, Alert } from '@mui/material';
import { useContracts } from '../contexts/ContractContext';

const LoadContracts: React.FC = () => {
  const { forwarder, recipient, loadContracts } = useContracts();
  const [forwarderAddress, setForwarderAddress] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchContractDetails = async () => {
    setError(null);
    try {
      if (forwarder) {
        setForwarderAddress(await forwarder.getAddress());
      }
      if (recipient) {
        setRecipientAddress(await recipient.getAddress());
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching contract details:', errorMessage);
      setError(errorMessage);
    }
  }

  const handleLoadContracts = async () => {
    setError(null);
    try {
      await loadContracts();
      await fetchContractDetails();
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error loading contracts:', errorMessage);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (forwarder && recipient) {
      fetchContractDetails();
    }
  }, [forwarder, recipient]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleLoadContracts} sx={{ mt: 2 }}>
        Load Contracts
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {(forwarder || recipient) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {forwarder && (
              <Typography variant="h6">
                Forwarder Contract Address: <Typography component="span" variant="body1" color="textSecondary">
                  {forwarderAddress}
                </Typography>
              </Typography>
            )}
            {recipient && (
              <Typography variant="h6">
                Recipient Contract Address: <Typography component="span" variant="body1" color="textSecondary">
                  {recipientAddress}
                </Typography>
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default LoadContracts;