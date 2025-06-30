const { createCityService } = require('../services/cityService');

const createCity = async (req, res) => {
    try {
        const result = await createCityService(req.body, req.files || []);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: 'A server error occurred.',
            error: error.message,
        });
    }
};

module.exports = {
    createCity,
};
