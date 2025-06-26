const CityType = require('../models/cityType');

// Create a new city type
const createCityType = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                EC: 1,
                EM: 'Title is required',
            });
        }

        // Check if city type already exists
        const existingCityType = await CityType.findOne({ title });
        if (existingCityType) {
            return res.status(400).json({
                EC: 1,
                EM: 'City type already exists',
            });
        }

        const newCityType = new CityType({ title });
        await newCityType.save();

        return res.status(201).json({
            EC: 0,
            EM: 'City type created successfully',
            DT: newCityType,
        });
    } catch (error) {
        console.error('Error creating city type:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error',
        });
    }
};

// Get all city types
const getCityTypes = async (req, res) => {
    try {
        const cityTypes = await CityType.find().sort({ title: 1 });

        return res.status(200).json({
            EC: 0,
            EM: 'Get city types successfully',
            DT: cityTypes,
        });
    } catch (error) {
        console.error('Error getting city types:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error',
        });
    }
};

// Get city type by ID
const getCityTypeById = async (req, res) => {
    try {
        const { id } = req.params;

        const cityType = await CityType.findById(id);
        if (!cityType) {
            return res.status(404).json({
                EC: 1,
                EM: 'City type not found',
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: 'Get city type successfully',
            DT: cityType,
        });
    } catch (error) {
        console.error('Error getting city type:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error',
        });
    }
};

// Update city type
const updateCityType = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                EC: 1,
                EM: 'Title is required',
            });
        }

        // Check if another city type with same title exists
        const existingCityType = await CityType.findOne({ title, _id: { $ne: id } });
        if (existingCityType) {
            return res.status(400).json({
                EC: 1,
                EM: 'City type with this title already exists',
            });
        }

        const updatedCityType = await CityType.findByIdAndUpdate(id, { title }, { new: true, runValidators: true });

        if (!updatedCityType) {
            return res.status(404).json({
                EC: 1,
                EM: 'City type not found',
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: 'City type updated successfully',
            DT: updatedCityType,
        });
    } catch (error) {
        console.error('Error updating city type:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error',
        });
    }
};

// Delete city type
const deleteCityType = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCityType = await CityType.findByIdAndDelete(id);
        if (!deletedCityType) {
            return res.status(404).json({
                EC: 1,
                EM: 'City type not found',
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: 'City type deleted successfully',
            DT: deletedCityType,
        });
    } catch (error) {
        console.error('Error deleting city type:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error',
        });
    }
};

module.exports = {
    createCityType,
    getCityTypes,
    getCityTypeById,
    updateCityType,
    deleteCityType,
};
