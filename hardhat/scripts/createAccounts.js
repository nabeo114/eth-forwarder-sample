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
const accountFilePath = path.join(__dirname, '..', 'data', 'accounts.json');

// アカウントを作成する非同期関数
async function createAccount(password) {
  if (!password) {
    throw new Error('Password is required to create an account');
  }

  try {
    // 新しいウォレットを生成
    const wallet = ethers.Wallet.createRandom();

    // Keystore JSONファイルを生成
    const keystore = await wallet.encrypt(password);

    return {
      address: wallet.address,
      password, // セキュリティ上、パスワードは保存しないか暗号化するべき
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

    const user1Password = process.env.USER1_PASSWORD;
    const user2Password = process.env.USER2_PASSWORD;
    if (!user1Password || !user2Password) {
      throw new Error('USER1_PASSWORD and USER2_PASSWORD must be set in the environment variables');
    }

    // User1のアカウントを作成
    const { address: user1Address, keystore: user1Keystore } = await createAccount(user1Password);

    // User2のアカウントを作成
    const { address: user2Address, keystore: user2Keystore } = await createAccount(user2Password);

    // 作成したアカウントをJSONファイルに保存
    const accountData = {
      user1: { address: user1Address, password: user1Password, keystore: user1Keystore },
      user2: { address: user2Address, password: user2Password, keystore: user2Keystore },
    };
    fs.writeFileSync(accountFilePath, JSON.stringify(accountData, null, 2));
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
