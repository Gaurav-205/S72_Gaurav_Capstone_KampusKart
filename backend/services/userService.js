const userRepository = require('../repositories/userRepository');
const { ServiceError } = require('./serviceError');
const { isAdminEmail } = require('../utils/adminUtils');

const buildUserResponse = (user) => {
  const userObject = user.toObject();
  userObject.id = userObject._id;
  userObject.isAdmin = isAdminEmail(userObject.email);
  return userObject;
};

const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId).select('-password');
  if (!user) {
    throw new ServiceError('User not found', 404);
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
  };
};

const getAdminUsers = async () => {
  const users = await userRepository
    .findAll()
    .select('-password -resetPasswordOTP -resetPasswordExpires')
    .sort({ createdAt: -1 });

  return users.map(buildUserResponse);
};

const updateAdminUser = async (userId, updates) => {
  const allowedUpdates = [
    'name',
    'phone',
    'major',
    'yearOfStudy',
    'gender',
    'program',
    'dateOfBirth',
  ];
  const updateKeys = Object.keys(updates || {});
  const invalidKeys = updateKeys.filter((key) => !allowedUpdates.includes(key));

  if (invalidKeys.length > 0) {
    throw new ServiceError('Invalid updates', 400);
  }

  const updateData = {};
  updateKeys.forEach((update) => {
    const value = updates[update];

    if (update === 'dateOfBirth') {
      if (value === '' || value === null || value === undefined) {
        updateData[update] = null;
      } else {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
          throw new ServiceError('Invalid date of birth format.', 400);
        }
        updateData[update] = parsedDate;
      }
      return;
    }

    updateData[update] = value;
  });

  const updatedUser = await userRepository
    .updateById(userId, { $set: updateData }, { new: true, runValidators: true })
    .select('-password -resetPasswordOTP -resetPasswordExpires');

  if (!updatedUser) {
    throw new ServiceError('User not found', 404);
  }

  return buildUserResponse(updatedUser);
};

const deleteAdminUser = async (userId, currentUserId) => {
  if (String(userId) === String(currentUserId)) {
    throw new ServiceError('You cannot delete your own account.', 400);
  }

  const deletedUser = await userRepository.deleteById(userId);
  if (!deletedUser) {
    throw new ServiceError('User not found', 404);
  }

  return { message: 'User deleted successfully' };
};

const updateUserProfile = async (userId, updates) => {
  const allowedUpdates = ['name', 'phone'];
  const updateKeys = Object.keys(updates || {});
  const isValidOperation = updateKeys.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new ServiceError('Invalid updates', 400);
  }

  const updateData = {};
  updateKeys.forEach((update) => {
    updateData[update] = updates[update];
  });

  const updatedUser = await userRepository
    .updateById(userId, { $set: updateData }, { new: true, runValidators: true })
    .select('-password');

  if (!updatedUser) {
    throw new ServiceError('User not found', 404);
  }

  return {
    user: {
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
    },
  };
};

module.exports = {
  getUserProfile,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  updateUserProfile,
};
