import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AbiCoder } from 'ethers';
import { Card, CardContent, Button, Typography, Divider, Alert } from '@mui/material';
import { useMetamask } from '../contexts/MetamaskContext';
import { useContracts } from '../contexts/ContractContext';
import { useWallets } from '../contexts/WalletContext';
import contracts from '../../../hardhat/data/contracts.json';

const LoadWallets: React.FC = () => {
  const { provider, signer } = useMetamask();
  const { recipient } = useContracts();
  const { relayer, user1, user2, loadWallets } = useWallets();
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);
  const [relayerNativeBalance, setRelayerNativeBalance] = useState<string | null>(null);
  const [relayerTokenBalance, setRelayerTokenBalance] = useState<string | null>(null);
  const [user1Address, setUser1Address] = useState<string | null>(null);
  const [user1NativeBalance, setUser1NativeBalance] = useState<string | null>(null);
  const [user1TokenBalance, setUser1TokenBalance] = useState<string | null>(null);
  const [user2Address, setUser2Address] = useState<string | null>(null);
  const [user2NativeBalance, setUser2NativeBalance] = useState<string | null>(null);
  const [user2TokenBalance, setUser2TokenBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletDetails = async () => {
    setError(null);
    try {
      if (relayer) {
        const address = await relayer.getAddress();
        setRelayerAddress(address);

        if (provider) {
          // ネイティブトークンの残高を取得
          const nativeBalance = await provider.getBalance(address);
          setRelayerNativeBalance(nativeBalance.toString());
        }
      }
      if (user1) {
        const address = await user1.getAddress();
        setUser1Address(address);

        if (provider) {
          // ネイティブトークンの残高を取得
          const nativeBalance = await provider.getBalance(address);
          setUser1NativeBalance(nativeBalance.toString());
        }
      }
      if (user2) {
        const address = await user2.getAddress();
        setUser2Address(address);

        if (provider) {
          // ネイティブトークンの残高を取得
          const nativeBalance = await provider.getBalance(address);
          setUser2NativeBalance(nativeBalance.toString());
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
      await fetchTokenBalance();
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error loading wallets:', errorMessage);
      setError(errorMessage);
    }
  };

  const fetchTokenBalance = async () => {
    setError(null);
    try {
      if (recipient && relayerAddress && user1Address && user2Address) {
        // RelayerのERC20トークン残高を取得
        const relayerTokenBalance = await recipient.balanceOf(relayerAddress);
        setRelayerTokenBalance(ethers.formatEther(relayerTokenBalance)); // トークン残高をEther形式で保存
        
        // User1のERC20トークン残高を取得
        const user1TokenBalance = await recipient.balanceOf(user1Address);
        setUser1TokenBalance(ethers.formatEther(user1TokenBalance)); // トークン残高をEther形式で保存
        
        // User2のERC20トークン残高を取得
        const user2TokenBalance = await recipient.balanceOf(user2Address);
        setUser2TokenBalance(ethers.formatEther(user2TokenBalance)); // トークン残高をEther形式で保存
      } else {
        console.error('Wallets or recipient contract not loaded.');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching token balance:', errorMessage);
      setError(errorMessage);
    }
  }

  const handleMintTokens = async () => {
    setError(null);
    try {
      if (recipient && user1Address && user2Address) {  
        // User1にトークンをミント
        const tx2 = await recipient.mint(user1Address, ethers.parseEther("1000"));
        await tx2.wait();
        console.log(`Minted 1000 tokens to ${user1Address}`);
  
        // User2にトークンをミント
        const tx3 = await recipient.mint(user2Address, ethers.parseEther("1000"));
        await tx3.wait();
        console.log(`Minted 1000 tokens to ${user2Address}`);

        fetchTokenBalance();
      } else {
        console.error('Wallets or recipient contract not loaded.');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error minting tokens:', errorMessage);
      setError(errorMessage);
    }
  };

  const handletransferTokens = async () => {
    setError(null);
    try {
      if ( provider && relayer && user1 && user1Address && user2Address ) {
        const user1WithProvider = user1.connect(provider);

        // Forwarderコントラクトのインスタンスを作成
        const forwarderContract = new ethers.Contract(
          contracts.forwarder.contractAddress,
          JSON.parse(contracts.forwarder.contractABI),
          user1WithProvider
        );
        
        // Recipientコントラクトのインスタンスを作成
        const recipientContract = new ethers.Contract(
          contracts.recipient.contractAddress,
          JSON.parse(contracts.recipient.contractABI),
          user1WithProvider
        );

        // 送信データを準備
        const data = recipientContract.interface.encodeFunctionData("transfer", [
          user2Address,
          ethers.parseEther("100"),
        ]);
        console.log('dddddd');
        // メタトランザクション用のリクエストを作成
        const value = {
          from: user1Address,
          to: recipientContract.target,
          value: BigInt(0),
          gas: BigInt(50000), // 必要に応じて調整
          nonce: await forwarderContract.nonces(user1Address),
          deadline: (Math.floor(Date.now() / 1000) + 3600),
          data: data,
        };
        console.log('eeeeee');
        // リクエストに署名
/*
        const sign = await user1.signMessage(
          ethers.getBytes(ethers.keccak256(new AbiCoder().encode(
            [
              "address",
              "address",
              "uint256",
              "uint256",
              "uint48",
              "bytes",
            ],
            [value.from, value.to, value.value, value.gas, value.deadline, value.data]
          )))
        );
*/
        let eip712domain = await forwarderContract.eip712Domain();
        let domain = {
            chainId: eip712domain.chainId,
            name: eip712domain.name,
            verifyingContract: eip712domain.verifyingContract,
            version: eip712domain.version,
        };
        let types = {
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
        let sign = await user1.signTypedData(domain, types, value);
        console.log('ffffff');
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

        console.log('gggggg');
        console.log('Request:', request);

        // Forwarderコントラクトのインスタンスを作成
        const newforwarderContract = new ethers.Contract(
          contracts.forwarder.contractAddress,
          JSON.parse(contracts.forwarder.contractABI),
          relayer
        );

        // メタトランザクションを forwarder 経由で送信
        const result = await newforwarderContract.verify(request);
        console.log('Result:', result);
        const feeData = await provider.getFeeData();
        console.log('feeData:', feeData);
        const tx = await newforwarderContract.execute(request)
/*
        const tx = await newforwarderContract.execute(request, {
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          maxFeePerGas: feeData.maxFeePerGas,
          gasLimit: 25000000  // 適切な値に設定
        });
*/
        await tx.wait();

        console.log('cccccc');

        console.log(`Transferred 100 tokens from ${user1Address} to ${user2Address} via meta-transaction`);
        
        // トークン残高を更新
        fetchTokenBalance();
      } else {
        console.error("Required contracts or addresses are not available.");
        setError("Required contracts or addresses are not available.");
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error transferring tokens:', errorMessage);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    console.log("useEffect:", { relayer, user1, user2, provider, signer });
    if (relayer && user1 && user2 ) {
      fetchWalletDetails();
      fetchTokenBalance();
    }
  }, [relayer, user1, user2]);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleLoadWallets} sx={{ mt: 2 }}>
        Load Wallets
      </Button>
      <Button variant="contained" color="secondary" onClick={handleMintTokens} sx={{ mt: 2, ml: 2 }}>
        Mint 1000 tokens to Users
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {((relayerAddress && relayerNativeBalance) || (user1Address && user1NativeBalance) || (user2Address && user2NativeBalance)) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {(relayerAddress && relayerNativeBalance) && (
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
            {(user1Address && user1NativeBalance) && (
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
            {(user2Address && user2NativeBalance) && (
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
      {(user1 && user1TokenBalance) && (
        <>
          <Button variant="contained" color="primary" onClick={handletransferTokens} sx={{ mt: 2 }}>
            Transfer 100 tokens from User1 to User2 via Meta-Transaction
          </Button>
        </>
      )}
    </>
  )

}

export default LoadWallets;
