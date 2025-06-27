const Tag = require('../models/tag');

const createTagService = async (title) => {
    try {
        const existingTag = await Tag.findOne({ title: title });
        if (existingTag) {
            return {
                EC: 1,
                EM: `Tag "${title}" already exists`,
            };
        }

        const result = await Tag.create({
            title: title,
        });

        return {
            EC: 0,
            EM: 'Tag created successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while creating tag',
        };
    }
};

const updateTagService = async (id, title) => {
    try {
        const tag = await Tag.findById(id);
        if (!tag) {
            return {
                EC: 1,
                EM: 'Tag not found',
            };
        }

        const existingTag = await Tag.findOne({ title: title });
        if (existingTag) {
            return {
                EC: 1,
                EM: `Tag "${title}" already exists`,
            };
        }

        const result = await Tag.findByIdAndUpdate(id, { title: title }, { new: true });

        return {
            EC: 0,
            EM: 'Tag updated successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while updating tag',
        };
    }
};

const deleteTagService = async (id) => {
    try {
        const tag = await Tag.findByIdAndDelete(id);
        if (!tag) {
            return {
                EC: 1,
                EM: 'Tag not found',
            };
        }

        return {
            EC: 0,
            EM: 'Tag deleted successfully',
            data: tag,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while deleting tag',
        };
    }
};

const getTagsService = async () => {
    try {
        let result = await Tag.aggregate([
            {
                $lookup: {
                    from: 'destinations',
                    localField: '_id',
                    foreignField: 'tags',
                    as: 'destinations',
                },
            },
            {
                $project: {
                    title: 1,
                    destinationsCount: { $size: '$destinations' },
                },
            },
        ]);

        return {
            EC: 0,
            EM: 'Get tags successfully',
            data: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting tags',
        };
    }
};

module.exports = {
    createTagService,
    updateTagService,
    deleteTagService,
    getTagsService,
};
