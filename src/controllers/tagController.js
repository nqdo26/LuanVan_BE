const { createTagService, updateTagService, deleteTagService, getTagsService } = require('../services/tagService');

const createTag = async (req, res) => {
    const { title } = req.body;
    const data = await createTagService(title);
    return res.status(200).json(data);
};

const updateTag = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const data = await updateTagService(id, title.trim());
    return res.status(200).json(data);
};

const deleteTag = async (req, res) => {
    const { id } = req.params;
    const data = await deleteTagService(id);
    return res.status(200).json(data);
};

const getTags = async (req, res) => {
    const data = await getTagsService();
    return res.status(200).json(data);
};

module.exports = {
    createTag,
    updateTag,
    deleteTag,
    getTags,
};
