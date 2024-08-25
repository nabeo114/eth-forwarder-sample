const { ethers } = require('hardhat');
const { writeFileSync } = require('fs');
const fs = require('fs');
const path = require('path');

// コントラクト情報を保存するディレクトリのパス
// ディレクトリが存在しない場合は作成する
const dataDirectory = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// コントラクトをデプロイする関数
async function deployContract(contractName, constructorArgs = []) {
  try {
    console.log(`Starting deployment of ${contractName}...`);

    const signer = await ethers.provider.getSigner();

    // コントラクトをデプロイ
    const contract = await ethers.deployContract(contractName, constructorArgs);
    console.log('Contract deployment transaction sent.');

    // デプロイ完了まで待機
    await contract.waitForDeployment();
    console.log('Contract deployed.');

    // トランザクションレシートを取得
    const txReceipt = await contract.deploymentTransaction().wait();
    console.log(`Contract address: ${txReceipt.contractAddress}`);
    console.log(`Transaction hash: ${txReceipt.hash}`);

    return { signer, contract, txReceipt };
  } catch (error) {
    throw new Error(`Failed to deploy ${contractName} contract: ${error.message}`);
  }
}

// メイン処理
async function main() {
  try {
    // Forwarderコントラクトをデプロイ
    const { signer: forwarderSigner, contract: forwarderContract, txReceipt: forwarderTxReceipt } = await deployContract('MyForwarder');

    const forwarderSignerAddress = forwarderSigner.address;
    const forwarderContractAddress = await forwarderContract.getAddress();
    const forwarderContractABI = forwarderContract.interface.formatJson();

    console.log(`Forwarder Signer address: ${forwarderSignerAddress}`);
    console.log(`Forwarder Contract address: ${forwarderContractAddress}`);
    console.log(`Forwarder Contract ABI: ${forwarderContractABI}`);

    // Recipientコントラクトをデプロイ
    const { signer: recipientSigner, contract: recipientContract, txReceipt: recipientTxReceipt } = await deployContract('MyRecipient', [forwarderContractAddress]);

    const recipientSignerAddress = recipientSigner.address;
    const recipientContractAddress = await recipientContract.getAddress();
    const recipientContractABI = recipientContract.interface.formatJson();

    console.log(`Recipient Signer address: ${recipientSignerAddress}`);
    console.log(`Recipient Contract address: ${recipientContractAddress}`);
    console.log(`Recipient Contract ABI: ${recipientContractABI}`);

    // デプロイされたアドレスをJSONファイルに保存
    const contractData = {
      forwarderSignerAddress : forwarderSignerAddress,
      forwarderContractAddress : forwarderContractAddress,
      forwarderContractABI : forwarderContractABI,
      recipientSignerAddress : recipientSignerAddress,
      recipientContractAddress : recipientContractAddress,
      recipientContractABI : recipientContractABI,
    };
    const filePath = path.join(dataDirectory, `contract.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(contractData, null, 2));
  } catch (error) {
    console.error('Error in main():', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error.message);
    process.exit(1);
  });
