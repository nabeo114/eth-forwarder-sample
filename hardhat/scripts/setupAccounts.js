const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// アカウント情報を保存するディレクトリのパス
// ディレクトリが存在しない場合は作成する
const dataDirectory = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// アカウント情報ファイルのパス
const accountFilePath = path.join(dataDirectory, 'accounts.json');

// アカウントを作成する非同期関数
async function createAccount(password, privateKey = null) {
  if (!password) {
    throw new Error('Password is required to create an account');
  }

  try {
    // 新しいウォレットを生成
    const wallet = privateKey
      ? new ethers.Wallet(privateKey)
      : ethers.Wallet.createRandom();

    // Keystore JSONを生成
    const keystore = await wallet.encrypt(password);

    return {
      address: wallet.address,
      keystore,
    };
  } catch (error) {
    throw new Error(`Failed to generate wallet: ${error.message}`);
  }
};

// メイン処理
async function main() {
  try {
    // ファイルをチェックして、アカウントが既に存在するかを確認
    if (fs.existsSync(accountFilePath)) {
      throw new Error('Accounts already exist in the file');
    }

    const privateKey = process.env.ACCOUNT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('ACCOUNT_PRIVATE_KEY must be set in the environment variables');
    }

    const keystorePassword = process.env.KEYSTORE_PASSWORD;
    if (!keystorePassword) {
      throw new Error('KEYSTORE_PASSWORD must be set in the environment variables');
    }

    // Relayerのアカウントを作成
    const { address: relayerAddress, keystore: relayerKeystore } = await createAccount(keystorePassword, privateKey);

    // User1のアカウントを作成
    const { address: user1Address, keystore: user1Keystore } = await createAccount(keystorePassword);

    // User2のアカウントを作成
    const { address: user2Address, keystore: user2Keystore } = await createAccount(keystorePassword);

    // 作成したアカウントをJSONファイルに保存
    const accountData = {
      relayer: { address: relayerAddress, keystore: relayerKeystore },
      user1: { address: user1Address, keystore: user1Keystore },
      user2: { address: user2Address, keystore: user2Keystore },
    };
    await fs.promises.writeFile(accountFilePath, JSON.stringify(accountData, null, 2));
    console.log('Accounts have been successfully created and saved to', accountFilePath);
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
