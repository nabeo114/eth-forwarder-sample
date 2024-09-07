import React from 'react';
import { Container, Box, Card, CardContent, Typography } from '@mui/material';
import ConnectNetwork from './connectNetwork';
import LoadContracts from './loadContracts';
import LoadWallets from './loadWallets';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Network</Typography>
            <ConnectNetwork />
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Contracts</Typography>
            <LoadContracts />
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Wallets</Typography>
            <LoadWallets />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default App;
