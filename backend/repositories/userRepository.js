const User = require('../models/User');

const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id);
const create = (data) => User.create(data);
const updateById = (id, update, options) => User.findByIdAndUpdate(id, update, options);
const findByVerificationToken = (token) => User.findOne({ 
  emailVerificationToken: token, 
  emailVerificationExpires: { $gt: Date.now() } 
});

module.exports = {
  findByEmail,
  findById,
  create,
  updateById,
  findByVerificationToken
};
