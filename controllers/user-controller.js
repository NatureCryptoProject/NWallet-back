const userService = require("../services/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");
const sha3_256 = require("js-sha3").sha3_256;

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()));
      }
      const { userName, password } = req.body;
      const userData = await userService.registration(userName, password);
      const hashPayPsw = sha3_256(password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });

      res.cookie("payPsw", hashPayPsw, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });

      userData["payPsw"] = hashPayPsw;
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { userName, password } = req.body;
      const userData = await userService.login(userName, password);
      const hashPayPsw = sha3_256(password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });
      res.cookie("payPsw", hashPayPsw, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });

      userData["payPsw"] = hashPayPsw;
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      res.clearCookie("payPsw");
      return res.json(token);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken, payPsw } = req.cookies;

      const userData = await userService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });
      res.cookie("payPsw", payPsw, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });

      userData["payPsw"] = payPsw;
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async getWallets(req, res, next) {
    try {
      const users = await userService.getWallets();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
