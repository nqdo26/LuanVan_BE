const { createUserService, loginService, getAccountService, getUserByIdService } = require('../services/userService');

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

module.exports = {
    createUser,
    handleLogin,
    getAccount,
    getUserById,
};
