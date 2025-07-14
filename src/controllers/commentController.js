const {
    createCommentService,
    getCommentsByDestinationService,
    deleteCommentService,
    getCommentByIdService,
} = require('../services/commentService');

const createComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { destinationId, title, content, visitDate } = req.body;
        let { detail } = req.body;

        if (typeof detail === 'string') {
            try {
                detail = JSON.parse(detail);
            } catch (e) {
                return res.status(400).json({
                    EC: 1,
                    EM: 'Invalid detail format',
                });
            }
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map((file) => file.path || file.url);
        }

        if (!destinationId || !title || !content || !detail) {
            return res.status(400).json({
                EC: 1,
                EM: 'Missing required fields: destinationId, title, content, detail',
            });
        }
        const formattedDetail = {
            criteria1: detail.criteria1 || 0,
            criteria2: detail.criteria2 || 0,
            criteria3: detail.criteria3 || 0,
            criteria4: detail.criteria4 || 0,
            criteria5: detail.criteria5 || 0,
            criteria6: detail.criteria6 || 0,
        };

        const commentData = {
            destinationId,
            userId,
            title,
            content,
            visitDate,
            images,
            detail: formattedDetail,
        };

        const result = await createCommentService(commentData);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in createComment controller:', error);
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const getCommentsByDestination = async (req, res) => {
    try {
        const { destinationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!destinationId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Destination ID is required',
            });
        }

        const result = await getCommentsByDestinationService(destinationId, page, limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getCommentsByDestination controller:', error);
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!commentId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Comment ID is required',
            });
        }

        const result = await deleteCommentService(commentId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in deleteComment controller:', error);
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

const getCommentById = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            return res.status(400).json({
                EC: 1,
                EM: 'Comment ID is required',
            });
        }

        const result = await getCommentByIdService(commentId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getCommentById controller:', error);
        return res.status(500).json({
            EC: 2,
            EM: 'Server error',
        });
    }
};

module.exports = {
    createComment,
    getCommentsByDestination,
    deleteComment,
    getCommentById,
};
