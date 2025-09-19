require("@nomicfoundation/hardhat-toolbox");

/**
 * Hardhat configuration for local development.
 * We expose a deterministic account so the Node server can sign transactions
 * during the demo without any secrets.
 */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      // First default Hardhat account (well-known for local dev only)
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      ]
    }
  }
};


