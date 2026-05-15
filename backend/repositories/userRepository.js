const User = require('../models/User');

const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id);
const create = (data) => User.create(data);
const updateById = (id, update, options) => User.findByIdAndUpdate(id, update, options);

const deleteById = (id) => User.findByIdAndDelete(id);

module.exports = {
  findByEmail,
  findById,
  create,
  updateById,
  deleteById
};
