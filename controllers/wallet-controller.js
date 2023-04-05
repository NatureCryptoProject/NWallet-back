const walletService = require("../services/wallet-service");
const { Crypto } = require("../modules/Nature/utils.js");
const AES = require("crypto-js/aes");

class WalletController {
  async addWallet(req, res, next) {
    try {
      const { id: owner } = req.user;
      const { mnemonic } = req.body;
      const { payPsw } = req.cookies;

      const encMnem = AES.encrypt(mnemonic, payPsw).toString();

      const NewwalletAdress = Crypto.generateKeypair(mnemonic).publicKey;
      const newWallet = await walletService.addWallet(
        NewwalletAdress,
        encMnem,
        owner
      );

      return res.json(newWallet);
    } catch (error) {
      next(error);
    }
  }

  async getAllWallets(req, res, next) {
    try {
      const { id: owner } = req.user;
      const AllWallets = await walletService.getAllWallets(owner);
      return res.json(AllWallets);
    } catch (error) {
      next(error);
    }
  }

  async getWalletsTransactions(req, res, next) {
    try {
      const { adress } = req.body;
      const transactions = await walletService.getWalletsTransactions(adress);
      return res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async updateWallet(req, res, next) {
    try {
      // const { id: owner } = req.user;
      const { _id, walletName } = req.body;
      const updatedWallet = await walletService.updateWallet(_id, walletName);
      return res.json(updatedWallet);
    } catch (error) {
      next(error);
    }
  }

  async sendTransaction(req, res, next) {
    try {
      const { senderPublicKey, transactionAdress, transactionAmount, message } =
        req.body;
      const payPass = req.cookies.payPsw;
      const { id: owner } = req.user;
      const transaction = await walletService.sendTransaction(
        senderPublicKey,
        transactionAdress,
        transactionAmount,
        message,
        payPass,
        owner
      );
      return res.json(transaction);
    } catch (error) {
      next(error);
    }
  }
  async getFee(req, res, next) {
    try {
      // const { _id, transactionAdress, transactionAmount } = req.body;
      const fee = await walletService.getFee();
      return res.json(fee);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
