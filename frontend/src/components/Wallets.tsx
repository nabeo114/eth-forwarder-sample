import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Card, CardContent, Button, Typography, Divider, Alert } from '@mui/material';
import { useNetwork } from '../contexts/NetworkContext';
import { useContracts } from '../contexts/ContractContext';
import { useWallets } from '../contexts/WalletContext';

const Wallets: React.FC = () => {
  const { provider } = useNetwork();
  const { recipient } = useContracts();
  const { relayer, user1, user2, loadWallets, error: walletsError } = useWallets();
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);
  const [relayerNativeBalance, setRelayerNativeBalance] = useState<string | null>(null);
  const [relayerTokenBalance, setRelayerTokenBalance] = useState<string | null>(null);
  const [user1Address, setUser1Address] = useState<string | null>(null);
  const [user1NativeBalance, setUser1NativeBalance] = useState<string | null>(null);
  const [user1TokenBalance, setUser1TokenBalance] = useState<string | null>(null);
  const [user2Address, setUser2Address] = useState<string | null>(null);
  const [user2NativeBalance, setUser2NativeBalance] = useState<string | null>(null);
  const [user2TokenBalance, setUser2TokenBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ウォレットの詳細情報を取得
  const fetchWalletDetails = async () => {
    setError(null);
    try {
      if (relayer) {
        const address = relayer.address;
        setRelayerAddress(address);

        if (provider) {
          // Relayerのネイティブトークンの残高を取得
          const nativeBalance = await provider.eth.getBalance(address);
          setRelayerNativeBalance(Web3.utils.fromWei(nativeBalance, 'ether'));
        }

        if (recipient) {
          // RelayerのERC20トークン残高を取得
          const tokenBalance = await recipient.methods.balanceOf(address).call();
          setRelayerTokenBalance(Web3.utils.fromWei(tokenBalance, 'ether'));
        }
      }
      if (user1) {
        const address = user1.address;
        setUser1Address(address);

        if (provider) {
          // User1のネイティブトークンの残高を取得
          const nativeBalance = await provider.eth.getBalance(address);
          setUser1NativeBalance(Web3.utils.fromWei(nativeBalance, 'ether'));
        }

        if (recipient) {
          // User1のERC20トークン残高を取得
          const tokenBalance = await recipient.methods.balanceOf(address).call();
          setUser1TokenBalance(Web3.utils.fromWei(tokenBalance, 'ether'));
        }
      }
      if (user2) {
        const address = user2.address;
        setUser2Address(address);

        if (provider) {
          // User2のネイティブトークンの残高を取得
          const nativeBalance = await provider.eth.getBalance(address);
          setUser2NativeBalance(Web3.utils.fromWei(nativeBalance, 'ether'));
        }

        if (recipient) {
          // User2のERC20トークン残高を取得
          const tokenBalance = await recipient.methods.balanceOf(address).call();
          setUser2TokenBalance(Web3.utils.fromWei(tokenBalance, 'ether'));
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching wallets details:', errorMessage);
      setError(errorMessage);
    }
  }

  // ウォレットのロード処理
  const handleLoadWallets = async () => {
    setError(null);
    setLoading(true);
    try {
      await loadWallets(provider);
      await fetchWalletDetails();
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error loading wallets:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントの初回レンダー時および依存する値が更新されたときにウォレットの詳細を取得
  useEffect(() => {
    if (relayer && user1 && user2 && provider) {
      fetchWalletDetails();
    }
  }, [relayer, user1, user2, provider]);

  // 初回レンダリング時にTransferイベントを監視開始
  useEffect(() => {
    if (!recipient || !relayer || !user1 || !user2) return;

    // Transferイベントを監視
    const monitorTransferEvents = async () => {
      try {
        // 環境変数が設定されているか確認
        const infuraApiKey = process.env.INFURA_API_KEY;
        if (!infuraApiKey) {
          throw new Error('INFURA_API_KEY is not defined in environment variables');
        }

        // InfuraのURLからプロバイダーを生成
        const socketProviderUrl = `wss://polygon-amoy.infura.io/ws/v3/${infuraApiKey}`;
        const socketProvider = new Web3(new Web3.providers.WebsocketProvider(socketProviderUrl));

        const filter = {
          address: recipient.options.address,
          topics: [Web3.utils.sha3("Transfer(address,address,uint256)")].filter(topic => topic !== undefined) as string[]
        };

        // イベントの監視
        const logSubscription = await socketProvider.eth.subscribe('logs', filter);
        logSubscription.on('data', async (data: any) => {
          console.log("Transfer event detected:", data);

          // ウォレットの詳細を再取得
          await fetchWalletDetails();
        });
        logSubscription.on('error', async (error: any) => console.log(error));

        // コンポーネントがアンマウントされた際に WebSocket をクリーンアップ
        return () => {
          socketProvider.eth.clearSubscriptions();
          if (socketProvider.currentProvider && typeof socketProvider.currentProvider.disconnect === 'function') {
            socketProvider.currentProvider.disconnect();
          }
        };
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('Error monitoring Transfer events:', errorMessage);
      }
    };

    monitorTransferEvents();

  }, [recipient, relayer, user1, user2]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleLoadWallets} sx={{ mt: 2 }} disabled={loading}>
        {loading ? 'Loading...' : 'Load Wallets'}
      </Button>
      {(walletsError || error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {walletsError || error}
        </Alert>
      )}
      {(relayerAddress || user1Address || user2Address) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {relayerAddress && (
              <>
                <Typography variant="h6">
                  Relayer Address: <Typography component="span" variant="body1" color="textSecondary">
                    {relayerAddress}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  Relayer Native Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {relayerNativeBalance}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  Relayer Token Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {relayerTokenBalance}
                  </Typography>
                </Typography>
              </>
            )}
            {user1Address && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  User1 Address: <Typography component="span" variant="body1" color="textSecondary">
                    {user1Address}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  User1 Native Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {user1NativeBalance}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  User1 Token Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {user1TokenBalance}
                  </Typography>
                </Typography>
              </>
            )}
            {user2Address && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  User2 Address: <Typography component="span" variant="body1" color="textSecondary">
                    {user2Address}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  User2 Native Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {user2NativeBalance}
                  </Typography>
                </Typography>
                <Typography variant="h6">
                  User2 Token Balance: <Typography component="span" variant="body1" color="textSecondary">
                    {user2TokenBalance}
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

export default Wallets;
