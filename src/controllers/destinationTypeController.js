const {
    createDestinationTypeService,
    updateDestinationTypeService,
    deleteDestinationTypeService,
    getDestinationTypesService,
} = require('../services/destinationTypeService');

const createDestinationType = async (req, res) => {
    const { title } = req.body;
    const data = await createDestinationTypeService(title.trim());
    return res.status(200).json(data);
};

const updateDestinationType = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const data = await updateDestinationTypeService(id, title.trim());
    return res.status(200).json(data);
};

const deleteDestinationType = async (req, res) => {
    const { id } = req.params;
    const data = await deleteDestinationTypeService(id);
    return res.status(200).json(data);
};

const getDestinationTypes = async (req, res) => {
    const data = await getDestinationTypesService();
    return res.status(200).json(data);
};

module.exports = {
    createDestinationType,
    updateDestinationType,
    deleteDestinationType,
    getDestinationTypes,
};
