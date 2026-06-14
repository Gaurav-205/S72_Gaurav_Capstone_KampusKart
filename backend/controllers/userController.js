const userService = require('../services/userService');
const { handleServiceError } = require('./controllerUtils');

const getProfile = async (req, res) => {
  try {
    const result = await userService.getUserProfile(req.user._id);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error fetching profile');
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await userService.updateUserProfile(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error updating profile');
  }
};

const getAdminUsers = async (_req, res) => {
  try {
    const result = await userService.getAdminUsers();
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error fetching users');
  }
};

const updateAdminUser = async (req, res) => {
  try {
    const result = await userService.updateAdminUser(req.params.userId, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error updating user');
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const result = await userService.deleteAdminUser(req.params.userId, req.user._id);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error deleting user');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
};
