# Eth Forwarder Sample

`eth-forwarder-sample` is a sample project demonstrating ERC-2771 (Meta-Transactions). This project uses Forwarder and Recipient smart contracts to showcase meta-transactions. It is inspired by the [MetaTxDemo project](https://github.com/tnakagawa/metatxdemo/tree/main), which provides additional context and examples for meta-transactions.

## Overview

This project serves as a sample for learning the basics of Ethereum meta-transactions. It deploys two smart contracts, Forwarder and Recipient, using the ERC-2771 standard.

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

    Create a `.env` file in the `hardhat` directory and set the required environment variables. For example:

    ```env
    INFURA_API_KEY=your_infura_api_key_here
    ACCOUNT_PRIVATE_KEY=your_private_key_here
    KEYSTORE_PASSWORD=your_keystore_password_here
    ```

    **Note:**
    - The `ACCOUNT_PRIVATE_KEY` specified in the `.env` file will be used to deploy the Forwarder and Recipient smart contracts.
    - The same `ACCOUNT_PRIVATE_KEY` will act as the relayer for meta-transactions.

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

- **Relayer and User Accounts:** The demo will create one relayer account (using the `ACCOUNT_PRIVATE_KEY` from the `.env` file) and two additional user accounts.
- **ERC20 Token Minting:** You can mint ERC20 tokens to the user accounts.
- **Token Transfers:** Transfers between user accounts will be executed by the relayer account specified in the `.env` file.
