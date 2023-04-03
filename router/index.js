const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const WalletController = require("../controllers/wallet-controller");
const { body, oneOf, check } = require("express-validator");
const authMiddlware = require("../middlwares/auth-middleware");
const payPassmiddleware = require("../middlwares/payPass-middleware");
const walletController = require("../controllers/wallet-controller");

const router = new Router();

const validation = [
  oneOf([
    check("userName")
      .isLength({ min: 3 })
      .withMessage("Nickname must be longer than 3 characters"),

    check("userName").isEmail().withMessage("nickname not valid"),
  ]),
  check("password")
    .isLength({ min: 6 })
    .withMessage("password is to short (min 6 characters)"),
];

router.post("/registration", validation, userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/refresh", userController.refresh);

router.post("/wallets", authMiddlware, WalletController.addWallet);
router.get("/wallets", authMiddlware, WalletController.getAllWallets);
router.post(
  "/wallets/transactions",
  authMiddlware,
  walletController.getWalletsTransactions
);
router.patch("/wallets", authMiddlware, WalletController.updateWallet);
router.patch(
  "/wallets/send-transaction",
  // payPassmiddleware,
  authMiddlware,
  WalletController.sendTransaction
);
router.get(
  "/wallets/get-fee",
  // authMiddlware,
  WalletController.getFee
);

module.exports = router;
