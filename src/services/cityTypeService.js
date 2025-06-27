const CityType = require('../models/CityType');

const createCityTypeService = async (title) => {
    try {
        const existingCityType = await CityType.findOne({ title: title });
        if (existingCityType) {
            return {
                EC: 1,
                EM: `CityType "${title}" already exists`,
            };
        }

        const result = await CityType.create({
            title: title,
        });

        return {
            EC: 0,
            EM: 'CityType created successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while creating CityType',
        };
    }
};

const updateCityTypeService = async (id, title) => {
    try {
        const data = await CityType.findById(id);
        if (!data) {
            return {
                EC: 1,
                EM: 'CityType not found',
            };
        }

        const existingCityType = await CityType.findOne({ title: title });
        if (existingCityType) {
            return {
                EC: 1,
                EM: `CityType "${title}" already exists`,
            };
        }

        const result = await CityType.findByIdAndUpdate(id, { title: title }, { new: true });

        return {
            EC: 0,
            EM: 'CityType updated successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while updating CityType',
        };
    }
};

const deleteCityTypeService = async (id) => {
    try {
        const data = await CityType.findByIdAndDelete(id);
        if (!data) {
            return {
                EC: 1,
                EM: 'CityType not found',
            };
        }

        return {
            EC: 0,
            EM: 'CityType deleted successfully',
            data: data,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while deleting CityType',
        };
    }
};

const getCityTypesService = async () => {
    try {
        let result = await CityType.aggregate([
            {
                $lookup: {
                    from: 'city',
                    localField: '_id',
                    foreignField: 'type',
                    as: 'cities',
                },
            },
            {
                $project: {
                    title: 1,
                    cityCount: { $size: '$cities' },
                },
            },
        ]);

        return {
            EC: 0,
            EM: 'Get CityTypes successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting CityTypes',
        };
    }
};

module.exports = {
    createCityTypeService,
    updateCityTypeService,
    deleteCityTypeService,
    getCityTypesService,
};
