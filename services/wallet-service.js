const WalletModel = require("../models/wallet-model");
const UserModel = require("../models/user-model");
const { Nature, Crypto } = require("../modules/Nature/utils.js");
const CryptoJS = require("crypto-js");
const serverIP = process.env.serverIP;
// let nature = new Nature(serverIP, "27777");

class WalletService {
  nature = new Nature(serverIP, "27777");
  async addWallet(walletAdress, mnemonic, owner) {
    const amount = await this.nature.getBalance(walletAdress);
    const wallet = await WalletModel.create({
      walletAdress,
      mnemonic,
      owner,
      amount,
    });
    return wallet;
  }

  async getAllWallets(owner) {
    const AllWallets = await WalletModel.find({
      owner,
    });
    const actualizedWallets = await Promise.all(
      AllWallets.map(async (el) => {
        const amount = await this.nature.getBalance(el.walletAdress);
        const _id = el._id;
        const updatedWallet = await WalletModel.findByIdAndUpdate(
          { _id },
          { $set: { amount: amount } }
        );
        return updatedWallet;
      })
    );
    // console.log(actualizedWallets);

    return actualizedWallets;
  }

  async getWalletsTransactions(adress) {
    const transactions = await this.nature.getTransactions(adress, 0, 10);
    return transactions;
  }

  async updateWallet(_id, walletName) {
    const NewWallet = await WalletModel.findByIdAndUpdate(
      { _id },
      { $set: { walletName: walletName } }
    );
    return NewWallet;
  }

  async sendTransaction(
    senderPublicKey,
    transactionAdress,
    amount,
    message = null,
    payPass,
    owner
  ) {
    const { mnemonic } = await WalletModel.findOne({
      walletAdress: senderPublicKey,
    });

    const bytes = CryptoJS.AES.decrypt(mnemonic, payPass);
    const decrmnem = bytes.toString(CryptoJS.enc.Utf8);
    const senderPrivateKey = Crypto.generateKeypair(decrmnem).privateKey;
    const transaction = await this.nature.sendTransaction(
      senderPublicKey,
      senderPrivateKey,
      transactionAdress,
      amount,
      message
    );
    const AllWallets = await WalletModel.find({
      owner,
    });
    await Promise.all(
      AllWallets.map(async (el) => {
        const amount = await this.nature.getBalance(el.walletAdress);
        const _id = el._id;
        const updatedWallet = await WalletModel.findByIdAndUpdate(
          { _id },
          { $set: { amount: amount } }
        );
        return updatedWallet;
      })
    );
    // console.log(transaction.code);
    // if (transaction.code) {
    //   return transaction.code;
    // }

    return transaction;
  }

  async getFee() {
    const fee = await this.nature.fee();
    return fee;
  }
}

module.exports = new WalletService();
