const profileService = require('../services/profileService');
const { handleServiceError } = require('./controllerUtils');

const getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user._id);
    res.json(user);
  } catch (error) {
    handleServiceError(res, error, 'Server Error');
  }
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await profileService.updateProfile({
      userId: req.user._id,
      data: req.body,
      file: req.file
    });
    res.json(updatedUser);
  } catch (error) {
    handleServiceError(res, error, 'Failed to update profile');
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const result = await profileService.deleteAccount(req.user._id, password);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Failed to delete account');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
