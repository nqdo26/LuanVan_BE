const express = require('express');
const path = require('path');
const {
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
} = require('../controllers/userController');

const {
    createComment,
    getCommentsByDestination,
    deleteComment,
    getCommentById,
} = require('../controllers/commentController');

const auth = require('../../middleware/auth');
const delay = require('../../middleware/delay');
const { createAdmin, getUsers, deleteUser, updateUserAdmin, getStatistics } = require('../controllers/adminController');
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
    getCitiesWithDestinationCount,
    getCityById,
    getCityBySlug,
    getCityByIdAndUpdate,
    updateCity,
    getCityDeletionInfo,
    deleteCity,
    incrementCityViewsController,
} = require('../controllers/cityController');
const {
    createDestination,
    getDestinations,
    searchDestinations,
    getDestinationById,
    getDestinationBySlug,
    getDestinationByIdAndUpdate,
    updateDestination,
    deleteDestination,
    getPopularDestinations,
    getDestinationsByTags,
    getDestinationsByCity,
    incrementDestinationViews,
    filterDestinations,
} = require('../controllers/destinationController');
const {
    createTour,
    updateTour,
    deleteTour,
    getTours,
    getTourBySlug,
    getTourById,
    getPublicTours,
    getUserTours,
    addDestinationToTour,
    addNoteToTour,
    updateDestinationInTour,
    removeDestinationFromTour,
    removeNoteFromTour,
} = require('../controllers/tourController');

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
routerAPI.get('/users/:id', auth, getUserById);
routerAPI.delete('/users/:id', auth, deleteUser);
routerAPI.patch('/users/:id/admin', auth, updateUserAdmin);

// Favorites management
routerAPI.post('/favorites', auth, addToFavorites);
routerAPI.delete('/favorites/:destinationId', auth, removeFromFavorites);
routerAPI.get('/favorites', auth, getUserFavorites);

// Comments management
routerAPI.post('/comments', auth, uploadByFolder('CommentImages').array('images', 5), createComment);
routerAPI.get('/comments/destination/:destinationId', getCommentsByDestination);
routerAPI.get('/comments/:commentId', getCommentById);
routerAPI.delete('/comments/:commentId', auth, deleteComment);

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

// User update APIs
routerAPI.patch('/users/update-name', auth, updateUserName);
routerAPI.patch('/users/update-password', auth, updateUserPassword);
routerAPI.patch('/users/update-avatar', auth, uploadByFolder('AvartarImages').single('avatar'), updateUserAvatar);

// City routes
routerAPI.post('/city', auth, uploadByFolder('cityImages').array('images', 4), createCity);
routerAPI.get('/cities',  getCities);
routerAPI.get('/cities-with-count', auth, getCitiesWithDestinationCount);
routerAPI.get('/cities/:id', getCityById);
routerAPI.get('/city/:slug', getCityBySlug);
routerAPI
    .route('/cities/:id/edit')
    .get(auth, getCityByIdAndUpdate)
    .put(auth, uploadByFolder('cityImages').array('images', 4), getCityByIdAndUpdate);
routerAPI.put('/cities/:id', auth, uploadByFolder('cityImages').array('images', 4), updateCity);
routerAPI.patch('/cities/:id/views', incrementCityViewsController);
routerAPI.get('/cities/:id/deletion-info',  getCityDeletionInfo);
routerAPI.delete('/cities/:id', auth, deleteCity);

// Destination routes
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

routerAPI.get('/destinations/popular', getPopularDestinations);
routerAPI.get('/destinations/search', searchDestinations);
routerAPI.get('/destinations/by-tags', getDestinationsByTags);
routerAPI.get('/destinations/city/:citySlug', getDestinationsByCity);   
routerAPI.patch('/destinations/:id/views', incrementDestinationViews);
routerAPI.get('/destinations', getDestinations);
routerAPI.get('/destinations/filter', filterDestinations);
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

// Tour management
routerAPI.post('/tours', auth, createTour);
routerAPI.get('/tours', auth, getTours);
routerAPI.get('/tours/user', auth, getUserTours);
routerAPI.get('/tours/public', getPublicTours);
routerAPI.get('/tours/:id', auth, getTourById);
routerAPI.get('/tours/slug/:slug', getTourBySlug);
routerAPI.put('/tours/:id', auth, updateTour);
routerAPI.delete('/tours/:id', auth, deleteTour);

// Tour itinerary management
routerAPI.post('/tours/:tourId/destinations', auth, addDestinationToTour);
routerAPI.post('/tours/:tourId/notes', auth, addNoteToTour);
routerAPI.put('/tours/:tourId/destinations', auth, updateDestinationInTour);
routerAPI.delete('/tours/:tourId/destinations', auth, removeDestinationFromTour);
routerAPI.delete('/tours/:tourId/notes', auth, removeNoteFromTour);

// Admin statistics
routerAPI.get('/admin/statistics', auth, getStatistics);

module.exports = routerAPI;
