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

        const nameWords = (fullName || 'User').trim().split(' ');
        const lastName = nameWords[nameWords.length - 1]; 
        const firstChar = lastName.charAt(0).toUpperCase(); 

        // Random màu nền
        const colors = [
            'FF6B6B',
            '4ECDC4',
            '45B7D1',
            'FFA07A',
            '98D8C8',
            'F7DC6F',
            'BB8FCE',
            '85C1E9',
            'F8C471',
            'F1948A',
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const defaultAvatar = `https://ui-avatars.com/api/?name=${firstChar}&background=${randomColor}&color=fff&size=100`;
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
        return null;
    }
};

const getUsersService = async () => {
    try {
        let result = await User.find({}).select('-password');
        return result;
    } catch (error) {
        return null;
    }
};

const getUserByIdService = async (id) => {
    try {
        const user = await User.findById(id)
            .select('-password')
            .populate([
                {
                    path: 'favortites',
                    select: 'title slug album location tags type statistics',
                    populate: {
                        path: 'tags',
                        select: 'title slug',
                    },
                },
                {
                    path: 'tours',
                    select: 'name slug description totalDays budget isPublic createdAt',
                    populate: [
                        { path: 'city', select: 'name slug' },
                        { path: 'tags', select: 'title slug' },
                    ],
                },
            ]);

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
        // Check duplicate fullName
        if (updateData.fullName) {
            const existed = await User.findOne({ fullName: updateData.fullName, _id: { $ne: id } });
            if (existed) {
                return {
                    EC: 1,
                    EM: 'Tên này đã được người dùng khác sử dụng. Vui lòng chọn tên khác.',
                };
            }
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
        return {
            EC: 2,
            EM: 'An error occurred while updating user',
        };
    }
};

const addToFavoritesService = async (userId, destinationId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return {
                EC: 1,
                EM: 'User not found',
            };
        }

        // Check if destination is already in favorites
        if (user.favortites.includes(destinationId)) {
            return {
                EC: 1,
                EM: 'Địa điểm đã có trong danh sách yêu thích',
            };
        }

        user.favortites.push(destinationId);
        await user.save();

        return {
            EC: 0,
            EM: 'Added to favorites successfully',
            data: user.favortites,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'An error occurred while adding to favorites',
        };
    }
};

const removeFromFavoritesService = async (userId, destinationId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return {
                EC: 1,
                EM: 'User not found',
            };
        }

        // Check if destination is in favorites
        const favoriteIndex = user.favortites.indexOf(destinationId);
        if (favoriteIndex === -1) {
            return {
                EC: 1,
                EM: 'Destination not found in favorites',
            };
        }

        user.favortites.splice(favoriteIndex, 1);
        await user.save();

        return {
            EC: 0,
            EM: 'Removed from favorites successfully',
            data: user.favortites,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'An error occurred while removing from favorites',
        };
    }
};

const getUserFavoritesService = async (userId) => {
    try {
        const user = await User.findById(userId).populate({
            path: 'favortites',
            select: 'title slug album location tags type openHour statistics comments',
            populate: [
                {
                    path: 'location.city',
                    select: 'name slug',
                },
                {
                    path: 'tags',
                    select: 'title slug',
                },
            ],
        });

        if (!user) {
            return {
                EC: 1,
                EM: 'User not found',
            };
        }

        return {
            EC: 0,
            EM: 'Get user favorites success',
            data: user.favortites || [],
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'An error occurred while getting user favorites',
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
    addToFavoritesService,
    removeFromFavoritesService,
    getUserFavoritesService,
};
