const DestinationType = require('../models/destinationType');

const createDestinationTypeService = async (title) => {
    try {
        const existingDestinationType = await DestinationType.findOne({ title: title });
        if (existingDestinationType) {
            return {
                EC: 1,
                EM: `DestinationType "${title}" already exists`,
            };
        }

        const result = await DestinationType.create({
            title: title,
        });

        return {
            EC: 0,
            EM: 'DestinationType created successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while creating DestinationType',
        };
    }
};

const updateDestinationTypeService = async (id, title) => {
    try {
        const data = await DestinationType.findById(id);
        if (!data) {
            return {
                EC: 1,
                EM: 'DestinationType not found',
            };
        }

        const existingDestinationType = await DestinationType.findOne({
            title: title,
            _id: { $ne: id }, // Exclude current record
        });
        if (existingDestinationType) {
            return {
                EC: 1,
                EM: `DestinationType "${title}" already exists`,
            };
        }

        const result = await DestinationType.findByIdAndUpdate(
            id,
            {
                title: title,
                updatedAt: new Date(),
            },
            { new: true },
        );

        return {
            EC: 0,
            EM: 'DestinationType updated successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while updating DestinationType',
        };
    }
};

const deleteDestinationTypeService = async (id) => {
    try {
        const data = await DestinationType.findByIdAndDelete(id);
        if (!data) {
            return {
                EC: 1,
                EM: 'DestinationType not found',
            };
        }

        return {
            EC: 0,
            EM: 'DestinationType deleted successfully',
            data: data,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while deleting DestinationType',
        };
    }
};

const getDestinationTypesService = async () => {
    try {
        let result = await DestinationType.aggregate([
            {
                $lookup: {
                    from: 'destinations',
                    localField: '_id',
                    foreignField: 'type',
                    as: 'destinations',
                },
            },
            {
                $project: {
                    title: 1,
                    destinationCount: { $size: '$destinations' },
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);

        return {
            EC: 0,
            EM: 'Get DestinationTypes successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting DestinationTypes',
        };
    }
};

module.exports = {
    createDestinationTypeService,
    updateDestinationTypeService,
    deleteDestinationTypeService,
    getDestinationTypesService,
};
