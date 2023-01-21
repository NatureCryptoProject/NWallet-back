const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  wallets: [
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
      },
      transactions: [
        {
          transactionAdress: {
            type: String,
          },
          transactionsAmount: {
            type: Number,
          },
        },
        { timestamps: true },
      ],
    },
  ],
});

module.exports = model("User", UserSchema);
