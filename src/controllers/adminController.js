const User = require('../models/user');

const upload = require('../../middleware/multer');
const jwt = require('jsonwebtoken');
const path = require('path');

const { createAdminService, updateUserAdminService } = require('../services/adminService');
const { getUsersService, deleteUserService } = require('../services/userService');

const createAdmin = async (req, res) => {
    const { fullName, email, password, avatar } = req.body;

    const data = await createAdminService(email, password, fullName, avatar);

    return res.status(200).json(data);
};

const getUsers = async (req, res) => {
    const data = await getUsersService();
    return res.status(200).json(data);
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    const data = await deleteUserService(id);

    return res.status(200).json(data);
};

const updateUserAdmin = async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const data = await updateUserAdminService(id, isAdmin);
    return res.status(200).json(data);
};

module.exports = {
    createAdmin,
    getUsers,
    deleteUser,
    updateUserAdmin,
};
