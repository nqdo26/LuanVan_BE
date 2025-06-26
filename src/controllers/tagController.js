const {
    createTagService,
    updateTagService,
    deleteTagService,
    getTagsService,
    getTagByIdService,
} = require('../services/tagService');

const createTag = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                EC: 1,
                EM: 'Title is required',
            });
        }

        const data = await createTagService(title.trim());
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: 'Internal server error',
        });
    }
};

const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                EC: 1,
                EM: 'Title is required',
            });
        }

        const data = await updateTagService(id, title.trim());
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: 'Internal server error',
        });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteTagService(id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: 'Internal server error',
        });
    }
};

const getTags = async (req, res) => {
    try {
        const data = await getTagsService();
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: 'Internal server error',
        });
    }
};

const getTagById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getTagByIdService(id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EC: 2,
            EM: 'Internal server error',
        });
    }
};

module.exports = {
    createTag,
    updateTag,
    deleteTag,
    getTags,
    getTagById,
};
