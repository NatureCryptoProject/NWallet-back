module.exports = class UserDto {
  name;
  id;
  constructor(model) {
    this.name = model.userName;
    this.id = model._id;
  }
};
