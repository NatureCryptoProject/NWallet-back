const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const { body, oneOf, check } = require("express-validator");
const authMiddlware = require("../middlwares/auth-middleware");

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
router.get("/users", authMiddlware, userController.getUsers);

module.exports = router;
