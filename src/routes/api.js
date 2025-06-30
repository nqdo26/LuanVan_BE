const express = require('express');
const path = require('path');
const { createUser, handleLogin, getAccount } = require('../controllers/userController');

const auth = require('../../middleware/auth');
const delay = require('../../middleware/delay');
const { createAdmin, getUsers, deleteUser, updateUserAdmin } = require('../controllers/adminController');
const { createTag, updateTag, deleteTag, getTags } = require('../controllers/tagController');
const { createCityType, getCityTypes, updateCityType, deleteCityType } = require('../controllers/cityTypeController');
const { uploadByFolder } = require('../../middleware/multer');
const { createCity } = require('../controllers/cityController');

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

//Tag management
routerAPI.post('/tag', auth, createTag);
routerAPI.put('/tags/:id', auth, updateTag);
routerAPI.get('/tags', auth, getTags);
routerAPI.delete('/tags/:id', auth, deleteTag);

//City Type management
routerAPI.post('/cityType', auth, createCityType);
routerAPI.get('/cityTypes', auth, getCityTypes);
routerAPI.put('/cityTypes/:id', auth, updateCityType);
routerAPI.delete('/cityTypes/:id', auth, deleteCityType);

routerAPI.post('/city', auth, uploadByFolder('cityImages').array('images', 4), createCity);

module.exports = routerAPI;
