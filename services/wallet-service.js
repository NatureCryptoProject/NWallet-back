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

  async updateWallet(_id, walletName) {
    const NewWallet = await WalletModel.findByIdAndUpdate(
      { _id },
      { $set: { walletName: walletName } }
    );
    return NewWallet;
  }

  async sendTransaction(_id, transactionAdress, transactionAmount) {
    const fromWallet = await WalletModel.findById({ _id });
    const toWallet = await WalletModel.findOne({
      walletAdress: transactionAdress,
    });
    if (toWallet === null) {
      console.log("Wrong Adress, wallet does not exist");
      return;
    } else if (transactionAmount <= 0) {
      console.log("Wrong amount, must be more then 0");
      return;
    } else if (transactionAmount > fromWallet.amount) {
      console.log("Not enough NATURE");
      return;
    }
    const newFromWalletAmount = fromWallet.amount - transactionAmount;
    const newToWalletAmount = toWallet.amount + transactionAmount;
    await WalletModel.findByIdAndUpdate(
      { _id },
      {
        $set: {
          amount: newFromWalletAmount,
          transactions: [
            ...fromWallet.transactions,
            {
              transactionAmount: `-${transactionAmount}`,
              transactionAdress,
              date: Date.now(),
            },
          ],
        },
      }
    );

    await WalletModel.findOneAndUpdate(
      { walletAdress: transactionAdress },
      {
        $set: {
          amount: newToWalletAmount,
          transactions: [
            ...toWallet.transactions,
            {
              transactionAmount: transactionAmount,
              transactionAdress: fromWallet.walletAdress,
              date: Date.now(),
            },
          ],
        },
      }
    );
  }
}

module.exports = new WalletService();
