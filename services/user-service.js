const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const tokenService = require("./token-service");
const UserDto = require("../dto/user-dto");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registration(userName, password) {
    const candidate = await UserModel.findOne({ userName });
    if (candidate) {
      throw ApiError.BadRequest(`User with name ${userName} is already exists`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const user = await UserModel.create({ userName, password: hashPassword });
    const userDto = new UserDto(user); // name, id
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(userName, password) {
    const user = await UserModel.findOne({ userName });
    if (!user) {
      throw ApiError.BadRequest(`User with name ${userName} does not exist`);
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest(`Wrong password`);
    }
    const userDto = new UserDto(user); // name, id
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnautorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiError.UnautorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user); // name, id
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async getUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
