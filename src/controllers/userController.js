const {
    createUserService,
    loginService,
    getAccountService,
    getUserByIdService,
    addToFavoritesService,
    removeFromFavoritesService,
    getUserFavoritesService,
    updateUserService,
} = require('../services/userService');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const createUser = async (req, res) => {
    const { fullName, email, password, avatar } = req.body;

    const data = await createUserService(email, password, fullName, avatar);

    return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);

    return res.status(200).json(data);
};

const getAccount = async (req, res) => {
    return res.status(200).json(req.user);
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getUserByIdService(id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { destinationId } = req.body;

        if (!destinationId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Destination ID is required',
            });
        }

        const data = await addToFavoritesService(userId, destinationId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { destinationId } = req.params;

        if (!destinationId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Destination ID is required',
            });
        }

        const data = await removeFromFavoritesService(userId, destinationId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await getUserFavoritesService(userId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const updateUserName = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName } = req.body;
        if (!fullName) {
            return res.status(400).json({ EC: 1, EM: 'Missing fullName' });
        }
        const result = await updateUserService(userId, { fullName });
        if (result.EC === 1) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ EC: 2, EM: 'Server error' });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ EC: 1, EM: 'Missing oldPassword or newPassword' });
        }
        const user = await require('../models/user').findById(userId);
        if (!user) {
            return res.status(404).json({ EC: 1, EM: 'User not found' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ EC: 1, EM: 'Old password is incorrect' });
        }
        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashPassword;
        await user.save();
        return res.status(200).json({ EC: 0, EM: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ EC: 2, EM: 'Server error' });
    }
};

// Đổi avatar user
const updateUserAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        let avatarUrl = null;

        if (req.file && req.file.path) {
            avatarUrl = req.file.path;
        } else if (req.file && req.file.url) {
            avatarUrl = req.file.url;
        }
        if (!avatarUrl) {
            return res.status(400).json({ EC: 1, EM: 'No avatar image uploaded', file: req.file });
        }
        const result = await updateUserService(userId, { avatar: avatarUrl });

        return res.status(200).json({ ...result, file: req.file });
    } catch (error) {
        return res.status(500).json({ EC: 2, EM: 'Server error' });
    }
};

module.exports = {
    createUser,
    handleLogin,
    getAccount,
    getUserById,
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    updateUserName,
    updateUserPassword,
    updateUserAvatar,
};
