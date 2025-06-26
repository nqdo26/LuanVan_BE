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

        const existingTag = await Tag.findOne({
            title: title,
            _id: { $ne: id },
        });
        if (existingTag) {
            return {
                EC: 1,
                EM: `Tag "${title}" already exists`,
            };
        }

        tag.title = title;
        const result = await tag.save();

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
        const tag = await Tag.findById(id);
        if (!tag) {
            return {
                EC: 1,
                EM: 'Tag not found',
            };
        }

        await Tag.findByIdAndDelete(id);

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
        const tags = await Tag.find();
        return {
            EC: 0,
            EM: 'Get tags successfully',
            data: tags,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting tags',
        };
    }
};

const getTagByIdService = async (id) => {
    try {
        const tag = await Tag.findById(id);
        if (!tag) {
            return {
                EC: 1,
                EM: 'Tag not found',
            };
        }

        return {
            EC: 0,
            EM: 'Get tag successfully',
            data: tag,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting tag',
        };
    }
};

module.exports = {
    createTagService,
    updateTagService,
    deleteTagService,
    getTagsService,
    getTagByIdService,
};
