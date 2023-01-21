const walletService = require("../services/wallet-service");

class WalletController {
  async addWallet(req, res, next) {
    try {
      const { id: owner } = req.user;
      const {
        walletName,
        walletAdress,
        walletPassword,
        mnemonic,
        amount,
        transactions,
      } = req.body;

      const newWallet = await walletService.addWallet(
        walletName,
        walletAdress,
        walletPassword,
        mnemonic,
        amount,
        transactions,
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

  async updateWallet(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
