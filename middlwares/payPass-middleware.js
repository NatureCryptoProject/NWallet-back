const ApiError = require("../exceptions/api-error");
const WalletModel = require("../models/wallet-model");
const CryptoJS = require("crypto-js");
const wordsArr = require("../mnemonic.json");

module.exports = async function (req, res, next) {
  try {
    const payPass = req.cookies.payPsw;
    const { _id } = req.body;
    const fromWallet = await WalletModel.findById(_id);
    console.log(typeof fromWallet.mnemonic);
    console.log(typeof payPass);

    if (!payPass || !fromWallet.mnemonic) {
      return next(ApiError.UnautorizedError());
    }

    const bytes = CryptoJS.AES.decrypt(fromWallet.mnemonic, payPass);
    bytes.toString(CryptoJS.enc.Utf8);
    next();
  } catch (error) {
    return next(ApiError.UnautorizedError());
  }
};
