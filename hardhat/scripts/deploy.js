const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// コントラクト情報を保存するディレクトリのパス
// ディレクトリが存在しない場合は作成する
const dataDirectory = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// コントラクト情報ファイルのパス
const contractFilePath = path.join(__dirname, '..', 'data', 'contracts.json');

// コントラクトをデプロイする関数
async function deployContract(contractName, constructorArgs = []) {
  try {
    console.log(`[INFO] Starting deployment of ${contractName}...`);

    const signer = await ethers.provider.getSigner();

    // コントラクトをデプロイ
    const contract = await ethers.deployContract(contractName, constructorArgs);
    console.log(`[INFO] Contract deployment transaction sent for ${contractName}.`);

    // デプロイ完了まで待機
    await contract.waitForDeployment();
    console.log(`[INFO] Contract ${contractName} deployed.`);

    // トランザクションレシートを取得
    const txReceipt = await contract.deploymentTransaction().wait();
    console.log(`[INFO] ${contractName} contract address: ${txReceipt.contractAddress}`);
    console.log(`[INFO] ${contractName} transaction hash: ${txReceipt.hash}`);

    return { signer, contract, txReceipt };
  } catch (error) {
    throw new Error(`Failed to deploy ${contractName} contract: ${error.message}`);
  }
}

// メイン処理
async function main() {
  try {
    // ファイルをチェックして、コントラクトが既に存在するかを確認
    if (fs.existsSync(contractFilePath)) {
      throw new Error('Contracts already exist in the file');
    }

    // Forwarderコントラクトをデプロイ
    const { signer: forwarderSigner, contract: forwarderContract } = await deployContract('MyForwarder');
    const forwarderSignerAddress = forwarderSigner.address;
    const forwarderContractAddress = await forwarderContract.getAddress();
    const forwarderContractABI = forwarderContract.interface.formatJson();
    console.log(`[INFO] Forwarder Contract address: ${forwarderContractAddress}`);

    // Recipientコントラクトをデプロイ
    const { signer: recipientSigner, contract: recipientContract } = await deployContract('MyRecipient', [forwarderContractAddress]);
    const recipientSignerAddress = recipientSigner.address;
    const recipientContractAddress = await recipientContract.getAddress();
    const recipientContractABI = recipientContract.interface.formatJson();
    console.log(`[INFO] Recipient Contract address: ${recipientContractAddress}`);

    // デプロイされたアドレスをJSONファイルに保存
    const contractData = {
      forwarder: { signerAddress: forwarderSignerAddress, contractAddress: forwarderContractAddress, contractABI: forwarderContractABI },
      recipient: { signerAddress: recipientSignerAddress, contractAddress: recipientContractAddress, contractABI: recipientContractABI },
    };
    await fs.promises.writeFile(contractFilePath, JSON.stringify(contractData, null, 2));
    console.log(`[INFO] Contract data saved to ${contractFilePath}`);
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
