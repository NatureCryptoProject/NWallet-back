const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/token-service");

module.exports = function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnautorizedError());
    }
    const acessToken = authorizationHeader.split(" ")[1];
    if (!acessToken) {
      return next(ApiError.UnautorizedError());
    }
    const userData = tokenService.validateAcessToken(acessToken);
    if (!userData) {
      return next(ApiError.UnautorizedError());
    }

    req.user = userData;
    next();
  } catch (error) {
    return next(ApiError.UnautorizedError());
  }
};
