const {
    createUserService,
    loginService,
    getAccountService,
    getUserByIdService,
    addToFavoritesService,
    removeFromFavoritesService,
    getUserFavoritesService,
} = require('../services/userService');

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

module.exports = {
    createUser,
    handleLogin,
    getAccount,
    getUserById,
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
};
