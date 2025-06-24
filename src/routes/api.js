const express = require('express');
const path = require('path');
const { createUser, handleLogin, getAccount } = require('../controllers/userController');

const auth = require('../../middleware/auth');
const delay = require('../../middleware/delay');
const { createAdmin, getUsers, deleteUser, updateUserAdmin } = require('../controllers/adminController');

const routerAPI = express.Router();

routerAPI.use(express.static(path.join(__dirname, 'public')));

routerAPI.get('/', (req, res) => {
    return res.status(200).json('Hello world api');
});

//Auth
routerAPI.post('/register', createUser);
routerAPI.post('/createAdmin', createAdmin);
routerAPI.post('/login', handleLogin);
routerAPI.get('/account', auth, getAccount);
routerAPI.get('/users', auth, getUsers);
routerAPI.delete('/users/:id', auth, deleteUser);
routerAPI.patch('/users/:id/admin', auth, updateUserAdmin);

module.exports = routerAPI;
