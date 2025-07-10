const express = require('express');
const path = require('path');
const { createUser, handleLogin, getAccount } = require('../controllers/userController');

const auth = require('../../middleware/auth');
const delay = require('../../middleware/delay');
const { createAdmin, getUsers, deleteUser, updateUserAdmin } = require('../controllers/adminController');
const { createTag, updateTag, deleteTag, getTags } = require('../controllers/tagController');
const { createCityType, getCityTypes, updateCityType, deleteCityType } = require('../controllers/cityTypeController');
const {
    createDestinationType,
    getDestinationTypes,
    updateDestinationType,
    deleteDestinationType,
} = require('../controllers/destinationTypeController');
const { uploadByFolder } = require('../../middleware/multer');
const {
    createCity,
    getCities,
    getCityById,
    getCityBySlug,
    getCityByIdAndUpdate,
    updateCity,
    deleteCity,
} = require('../controllers/cityController');
const {
    createDestination,
    getDestinations,
    getDestinationById,
    getDestinationBySlug,
    getDestinationByIdAndUpdate,
    updateDestination,
    deleteDestination,
} = require('../controllers/destinationController');

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

//Destination Type management
routerAPI.post('/destinationType', auth, createDestinationType);
routerAPI.get('/destinationTypes', auth, getDestinationTypes);
routerAPI.put('/destinationTypes/:id', auth, updateDestinationType);
routerAPI.delete('/destinationTypes/:id', auth, deleteDestinationType);

routerAPI.post('/city', auth, uploadByFolder('cityImages').array('images', 4), createCity);
routerAPI.get('/cities', auth, getCities);
routerAPI.get('/cities/:id', getCityById);
routerAPI.get('/city/:slug', getCityBySlug);
routerAPI
    .route('/cities/:id/edit')
    .get(auth, getCityByIdAndUpdate)
    .put(auth, uploadByFolder('cityImages').array('images', 4), getCityByIdAndUpdate);
routerAPI.put('/cities/:id', auth, uploadByFolder('cityImages').array('images', 4), updateCity);
routerAPI.delete('/cities/:id', auth, deleteCity);

routerAPI.post(
    '/destination',
    auth,
    uploadByFolder('destinationImages').fields([
        { name: 'images', maxCount: 10 },
        { name: 'album_space', maxCount: 10 },
        { name: 'album_fnb', maxCount: 10 },
        { name: 'album_extra', maxCount: 10 },
    ]),
    createDestination,
);
routerAPI.get('/destinations', auth, getDestinations);
routerAPI.get('/destinations/:id', getDestinationById);
routerAPI.get('/destination/:slug', getDestinationBySlug);
routerAPI
    .route('/destinations/:id/edit')
    .get(auth, getDestinationById) 
    .put(
        auth,
        uploadByFolder('destinationImages').fields([
            { name: 'images', maxCount: 15 },
            { name: 'album_space', maxCount: 10 },
            { name: 'album_fnb', maxCount: 10 },
            { name: 'album_extra', maxCount: 10 },
        ]),
        updateDestination,
    );
routerAPI.delete('/destinations/:id', auth, deleteDestination);

module.exports = routerAPI;
