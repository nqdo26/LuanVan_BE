require('dotenv').config();

const User = require('../models/user');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const saltRounds = 10;

const createUserService = async (email, password, fullName, avatar) => {
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return {
                EC: 1,
                EM: `Email ${email} has already been existed.`,
            };
        }

        const defaultAvatar = 'http://localhost:8080/public/images/default-avatar.png';
        const userAvatar = avatar || defaultAvatar;

        const hashPassword = await bcrypt.hash(password, saltRounds);

        let result = await User.create({
            email: email,
            password: hashPassword,
            fullName: fullName,
            avatar: userAvatar,
            isAdmin: false,
            favorites: [],
            tours: [],
        });

        return {
            EC: 0,
            EM: 'Create user success',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while creating user',
        };
    }
};

const deleteUserService = async (id) => {
    try {
        let result = await User.findByIdAndDelete(id);
        if (!result) {
            return {
                EC: 1,
                EM: 'User not found',
            };
        }
        return {
            EC: 0,
            EM: 'Delete success',
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred',
        };
    }
};

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return {
                EC: 1,
                EM: 'Email/Password invalid',
            };
        }
        if (user) {
            const isMathPassword = await bcrypt.compare(password, user.password);
            if (!isMathPassword) {
                return {
                    EC: 1,
                    EM: 'Email/Password invalid',
                };
            } else {
                const payload = {
                    id: user._id,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    fullName: user.fullName,
                    avatar: user.avatar,
                };

                const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRE,
                });
                return {
                    EC: 0,
                    access_token,
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        isAdmin: user.isAdmin,
                        avatar: user.avatar,
                        statistics: user.statistics,
                    },
                };
            }
        } else {
            return {
                EC: 2,
                EM: 'An error occurred',
            };
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

const getUsersService = async () => {
    try {
        let result = await User.find({}).select('-password');
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
};

const getUserByIdService = async (id) => {
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return {
                EC: 1,
                EM: 'User not found',
            };
        }

        return {
            EC: 0,
            EM: 'Get user success',
            data: user,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting user',
        };
    }
};

const updateUserService = async (id, updateData) => {
    try {
        const currentUser = await User.findById(id);
        if (!currentUser) {
            return {
                EC: 1,
                EM: 'User not found',
            };
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select(
            '-password',
        );

        return {
            EC: 0,
            EM: 'Update user success',
            data: updatedUser,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while updating user',
        };
    }
};

module.exports = {
    createUserService,
    loginService,
    getUsersService,
    deleteUserService,
    updateUserService,
    getUserByIdService,
};
