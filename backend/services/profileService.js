const userRepository = require('../repositories/userRepository');
const { ServiceError } = require('./serviceError');
const mediaService = require('./mediaService');
const { isAdminEmail } = require('../utils/adminUtils');

const getProfile = async (userId) => {
  const user = await userRepository
    .findById(userId)
    .select('-password -resetPasswordOTP -resetPasswordExpires');

  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  const userObject = user.toObject();
  userObject.isAdmin = isAdminEmail(user.email);
  return userObject;
};

const updateProfile = async ({ userId, data, file }) => {
  const profileFields = {};

  if (data.name !== undefined) profileFields.name = data.name;
  if (data.phone !== undefined) profileFields.phone = data.phone;
  if (data.major !== undefined) profileFields.major = data.major;
  if (data.yearOfStudy !== undefined) profileFields.yearOfStudy = data.yearOfStudy;
  if (data.gender !== undefined) profileFields.gender = data.gender;
  if (data.program !== undefined) profileFields.program = data.program;

  if (data.dateOfBirth !== undefined) {
    if (data.dateOfBirth === '' || data.dateOfBirth === null) {
      profileFields.dateOfBirth = null;
    } else {
      const parsedDate = new Date(data.dateOfBirth);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new ServiceError('Invalid date of birth format.', 400);
      }
      profileFields.dateOfBirth = parsedDate;
    }
  }

  let user = await userRepository.findById(userId);
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  if (file) {
    if (user.profilePicture && user.profilePicture.public_id) {
      try {
        await mediaService.deleteByPublicId(user.profilePicture.public_id);
      } catch (error) {
        // Continue even if delete fails
      }
    }

    const uploadResult = await mediaService.uploadSingleImage(file, {
      folder: 'profile_pictures'
    });

    user.profilePicture = uploadResult;
  }

  Object.assign(user, profileFields);
  await user.save();

  const updatedUser = await userRepository
    .findById(userId)
    .select('-password -resetPasswordOTP -resetPasswordExpires');

  const userObject = updatedUser.toObject();
  userObject.isAdmin = isAdminEmail(updatedUser.email);
  return userObject;
};

const deleteAccount = async (userId, password) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  // Verify password if it's not a Google user
  if (!user.googleId) {
    if (!password) {
      throw new ServiceError('Password is required to delete account', 400);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ServiceError('Incorrect password', 401);
    }
  }

  // Delete profile picture from Cloudinary/storage if exists
  if (user.profilePicture && user.profilePicture.public_id) {
    try {
      await mediaService.deleteByPublicId(user.profilePicture.public_id);
    } catch (error) {
      // Continue even if delete fails
    }
  }

  await userRepository.deleteById(userId);
  return { message: 'Account deleted successfully' };
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
