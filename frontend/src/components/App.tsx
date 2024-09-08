import React from 'react';
import { Container, Box, Card, CardContent, Typography } from '@mui/material';
import Network from './Network';
import Contracts from './Contracts';
import Wallets from './Wallets';
import MetaTransaction from './MetaTransaction';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Network</Typography>
            <Network />
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Contracts</Typography>
            <Contracts />
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Wallets</Typography>
            <Wallets />
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">MetaTransaction</Typography>
            <MetaTransaction />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default App;
