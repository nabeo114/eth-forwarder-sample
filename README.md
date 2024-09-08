# Eth Forwarder Sample

`eth-forwarder-sample` demonstrates ERC-2771 (Meta-Transactions) using Forwarder and Recipient smart contracts. It is inspired by the [MetaTxDemo project](https://github.com/tnakagawa/metatxdemo/tree/main), which provides additional examples of meta-transactions.

## Overview

This project serves as a sample for learning Ethereum meta-transactions. It deploys two smart contracts, Forwarder and Recipient, that conform to the ERC-2771 standard.

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/nabeo114/eth-forwarder-sample.git
    cd eth-forwarder-sample
    ```

2. **Install dependencies:**

- **Hardhat:**
  
    ```bash
    cd hardhat
    npm install
    ```

- **Frontend:**

    ```bash
    cd ../frontend
    npm install
    ```

1. **Configure the `.env` file:** 

    Create a `.env` file in the `hardhat` directory with the following variables:

    ```env
    INFURA_API_KEY=your_infura_api_key_here
    ACCOUNT_PRIVATE_KEY=your_private_key_here
    KEYSTORE_PASSWORD=your_keystore_password_here
    ```

    **Note:**
    - The `ACCOUNT_PRIVATE_KEY` will be used to deploy the Forwarder and Recipient contracts and also act as the relayer for meta-transactions.
    - Contracts are deployed on the **Polygon Amoy testnet**. Ensure the `ACCOUNT_PRIVATE_KEY` is funded with MATIC tokens using the [Polygon Faucet](https://faucet.polygon.technology/).
    - **INFURA_API_KEY**: Obtain this from [Infura](https://app.infura.io/) after creating an account.
    - **KEYSTORE_PASSWORD**: Used to encrypt the keystore; you can set this to any desired string.


## Usage

1. **Create accounts and deploy the smart contracts:**

    ```bash
    cd hardhat
    npm run account
    npm run deploy
    ```

2. **Set up the frontend:**

    ```bash
    cd ../frontend
    npm start
    ```

## Demo Features

- **Relayer and User Accounts:** The demo creates one relayer account (using the `ACCOUNT_PRIVATE_KEY` in the `.env` file) and two user accounts.
- **ERC20 Token Minting:** ERC20 tokens can be minted to user accounts.
- **Token Transfers:** Transfers between user accounts are performed by the relayer account.

