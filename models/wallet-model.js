const { Schema, model } = require("mongoose");

const WalletSchema = new Schema(
  {
    walletName: {
      type: String,
      default: "Untitled wallet",
    },
    walletAdress: {
      type: String,
    },
    walletPassword: {
      type: String,
    },
    mnemonic: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        transactionAdress: {
          type: String,
        },
        transactionAmount: {
          type: Number,
        },
        date: {
          type: String,
        },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = model("Wallet", WalletSchema);
