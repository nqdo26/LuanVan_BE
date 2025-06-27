const {
    createCityTypeService,
    updateCityTypeService,
    deleteCityTypeService,
    getCityTypesService,
} = require('../services/cityTypeService');

const createCityType = async (req, res) => {
    const { title } = req.body;
    const data = await createCityTypeService(title.trim());
    return res.status(200).json(data);
};

const updateCityType = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const data = await updateCityTypeService(id, title.trim());
    return res.status(200).json(data);
};

const deleteCityType = async (req, res) => {
    const { id } = req.params;
    const data = await deleteCityTypeService(id);
    return res.status(200).json(data);
};

const getCityTypes = async (req, res) => {
    const data = await getCityTypesService();
    return res.status(200).json(data);
};

module.exports = {
    createCityType,
    updateCityType,
    deleteCityType,
    getCityTypes,
};
