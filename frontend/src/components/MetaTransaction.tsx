import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, Button, TextField, Tooltip, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNetwork } from '../contexts/NetworkContext';
import { useContracts } from '../contexts/ContractContext';
import { useWallets } from '../contexts/WalletContext';

// ミントまたはトークン転送時にどのユーザを対象にするかの選択肢
const USERS = {
  USER1: 'user1',
  USER2: 'user2',
};

const MetaTransaction: React.FC = () => {
  const { provider } = useNetwork();
  const { forwarder, recipient } = useContracts();
  const { relayer, user1, user2 } = useWallets();
  const [mintUser, setMintUser] = useState<string>(USERS.USER1); // デフォルトを 'User1' に設定
  const [mintAmount, setMintAmount] = useState<number>(100); // デフォルトを100に設定
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [transferUser, setTransferUser] = useState<string>(USERS.USER1); // デフォルトを 'User1' に設定
  const [transferAmount, setTransferAmount] = useState<number>(50); // デフォルトを50に設定
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const handleMintUserChange = (e: SelectChangeEvent<string>) => {
    const selectedUser = e.target.value as string;
    setMintUser(selectedUser);
  };

  const handleTransferUserChange = (e: SelectChangeEvent<string>) => {
    const selectedUser = e.target.value as string;
    setTransferUser(selectedUser);
  };

  // ミントの処理を開始する関数
  const handleMintTokens = async () => {
    setMintError(null);
    setMintLoading(true);
    try {
      // 必要なウォレットやコントラクトのチェック
      if (!recipient || !relayer || !user1 || !user2) {
        setMintError('Recipient, Relayer, User1 and User2 are required to mint tokens');
        return;
      }

      const recipientWithRelayer = recipient.connect(relayer);
      
      // ミントするユーザのアドレスを取得
      let mintAddress;
      if (mintUser === USERS.USER1) {
        mintAddress = await user1.getAddress();
      } else {
        mintAddress = await user2.getAddress();
      }

      // トークンをミント
      const tx = await recipientWithRelayer.mint(mintAddress, ethers.parseUnits(mintAmount.toString()));
      console.log('Transaction sent, waiting for confirmation...');
      await tx.wait();
      console.log('Transaction confirmed');
      console.log(`Minted ${mintAmount} tokens to ${mintAddress}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error minting tokens:', errorMessage);
      setMintError(errorMessage);
    } finally {
      setMintLoading(false);
    }
  };

  const handleTransferTokens = async () => {
    setTransferError(null);
    setTransferLoading(true);
    try {
      if (!provider || !forwarder || !recipient || !relayer || !user1 || !user2) {
        setTransferError('Provider, Forwarder, Recipient, Relayer, User1 and User1 are required to transfer tokens');
        return;
      }

      const forwarderWithRelayer = forwarder.connect(relayer);
      const recipientWithRelayer = recipient.connect(relayer);
      const eip712domain = await forwarderWithRelayer.eip712Domain();
      const domain = {
          chainId: eip712domain.chainId,
          name: eip712domain.name,
          verifyingContract: eip712domain.verifyingContract,
          version: eip712domain.version,
      };
      const types = {
        ForwardRequest: [
            { type: "address", name: "from" },
            { type: "address", name: "to" },
            { type: "uint256", name: "value" },
            { type: "uint256", name: "gas" },
            { type: "uint256", name: "nonce" },
            { type: "uint48", name: "deadline" },
            { type: "bytes", name: "data" },
        ],
      };

      let signer;
      let fromAddress;
      let toAddress;
      if (transferUser === USERS.USER1) {
        signer = user1;
        fromAddress = await user1.getAddress();
        toAddress = await user2.getAddress();
      } else {
        signer = user2;
        fromAddress = await user2.getAddress();
        toAddress = await user1.getAddress();
      }

      // 送信データを準備
      const data = recipientWithRelayer.interface.encodeFunctionData("transfer", [
        toAddress,
        ethers.parseEther(transferAmount.toString()),
      ]);
      // メタトランザクション用のリクエストを作成
      const value = {
        from: fromAddress,
        to: recipientWithRelayer.target,
        value: BigInt(0),
        gas: BigInt(50000), // 必要に応じて調整
        nonce: await forwarderWithRelayer.nonces(fromAddress),
        deadline: (Math.floor(Date.now() / 1000) + 3600),
        data: data,
      };

      // リクエストに署名
      const sign = await signer.signTypedData(domain, types, value);
      // メタトランザクション用のリクエストを作成
      const request = {
        from: value.from,
        to: value.to,
        value: value.value,
        gas: value.gas,
        deadline: value.deadline,
        data: value.data,
        signature: sign,
      };

      // メタトランザクションを forwarder 経由で送信
      const result = await forwarderWithRelayer.verify(request);
      if (result) {
        const tx = await forwarderWithRelayer.execute(request)
        console.log('Transaction sent, waiting for confirmation...');
        await tx.wait();
        console.log('Transaction confirmed');
        console.log(`Transferred ${transferAmount} tokens from ${fromAddress} to ${toAddress} via meta-transaction`);
      } else {
        console.error('');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error transferring tokens:', errorMessage);
      setTransferError(errorMessage);
    } finally {
      setTransferLoading(false);
    }
  };

  useEffect(() => {
    if (mintAmount <= 0) setMintError("Mint amount must be greater than zero");
  }, [mintAmount]);
  
  useEffect(() => {
    if (transferAmount <= 0) setTransferError("Transfer amount must be greater than zero");
  }, [transferAmount]);

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="user-label">User</InputLabel>
            <Select
              labelId="user-label"
              value={mintUser}
              onChange={handleMintUserChange}
              label="User"
            >
              <MenuItem value={USERS.USER1}>Mint to User1</MenuItem>
              <MenuItem value={USERS.USER2}>Mint to User2</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Please enter the amount of tokens you want to mint." placement="top" arrow>
            <TextField
              label="Mint Amount"
              value={mintAmount}
              onChange={(e) => setMintAmount(Number(e.target.value))}
              fullWidth
              sx={{ mt: 3 }}
              type="number"
            />
          </Tooltip>
          <Button variant="contained" color="primary" onClick={handleMintTokens} sx={{ mt: 2}} disabled={mintLoading || isNaN(mintAmount) || mintAmount <= 0}>
            {mintLoading ? <CircularProgress size={24} /> : 'Mint tokens'}
          </Button>
          {mintError && <Alert severity="error" sx={{ mt: 2 }}>{mintError}</Alert>}
        </CardContent>
      </Card>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="user-label">User</InputLabel>
            <Select
              labelId="user-label"
              value={transferUser}
              onChange={handleTransferUserChange}
              label="User"
            >
              <MenuItem value={USERS.USER1}>Transfer from User1 to User2</MenuItem>
              <MenuItem value={USERS.USER2}>Transfer from User2 to User1</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Please enter the amount of tokens you want to transfer." placement="top" arrow>
            <TextField
              label="Transfer Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
              fullWidth
              sx={{ mt: 3 }}
              type="number"
            />
          </Tooltip>
          <Button variant="contained" color="primary" onClick={handleTransferTokens} sx={{ mt: 2}} disabled={transferLoading || isNaN(transferAmount) || transferAmount <= 0}>
            {transferLoading ? <CircularProgress size={24} /> : 'Transfer tokens (MetaTransaction)'}
          </Button>
          {transferError && <Alert severity="error" sx={{ mt: 2 }}>{transferError}</Alert>}
        </CardContent>
      </Card>
    </>
  )
}

export default MetaTransaction;
