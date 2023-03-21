const sha3_256 = require("js-sha3").sha3_256;
module.exports = class UserDto {
  name;
  id;
  constructor(model) {
    this.name = model.userName;
    this.id = model._id;
    this.password = sha3_256(model.password);
  }
};
