const WalletModel = require("../models/wallet-model");

class WalletService {
  async addWallet(
    walletName,
    walletAdress,
    walletPassword,
    mnemonic,
    amount,
    transactions,
    owner
  ) {
    const wallet = await WalletModel.create({
      walletName,
      walletAdress,
      walletPassword,
      mnemonic,
      amount,
      transactions,
      owner,
    });
    return wallet;
  }

  async getAllWallets(owner) {
    const AllWallets = await WalletModel.find({
      owner,
    });
    return AllWallets;
  }

  async updateWallet() {}
}

module.exports = new WalletService();
