const Comment = require('../models/comment');
const Destination = require('../models/destination');

const createCommentService = async (commentData) => {
    try {
        const { destinationId, userId, title, content, visitDate, images, detail } = commentData;

        const destination = await Destination.findById(destinationId);
        if (!destination) {
            return {
                EC: 1,
                EM: 'Destination not found',
            };
        }

        const detailValues = Object.values(detail);
        const averageRating =
            detailValues.length > 0 ? detailValues.reduce((sum, score) => sum + score, 0) / detailValues.length : 0;

        const newComment = await Comment.create({
            destinationId,
            userId,
            title,
            content,
            visitDate: visitDate || new Date(),
            images: images || [],
            detail,
            createdAt: new Date(),
        });

        await Destination.findByIdAndUpdate(destinationId, {
            $push: { comments: newComment._id },
        });

        const allComments = await Comment.find({ destinationId });
        const totalComments = allComments.length;

        if (totalComments > 0) {
            const totalRating = allComments.reduce((sum, comment) => {
                const values = Object.values(comment.detail || {});
                const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
                return sum + avg;
            }, 0);

            const newAverageRating = totalRating / totalComments;

            await Destination.findByIdAndUpdate(destinationId, {
                $set: {
                    'statistics.totalRate': totalComments,
                    'statistics.averageRating': isNaN(newAverageRating) ? 0 : Math.round(newAverageRating * 10) / 10,
                },
            });
        }

        const populatedComment = await Comment.findById(newComment._id).populate('userId', 'fullName avatar');

        return {
            EC: 0,
            EM: 'Create comment success',
            data: populatedComment,
        };
    } catch (error) {
        console.error(error);
        return {
            EC: 2,
            EM: 'An error occurred while creating comment',
        };
    }
};

const getCommentsByDestinationService = async (destinationId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ destinationId })
            .populate('userId', 'fullName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments({ destinationId });

        return {
            EC: 0,
            EM: 'Get comments success',
            data: {
                comments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments,
                    hasNextPage: page < Math.ceil(totalComments / limit),
                    hasPrevPage: page > 1,
                },
            },
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting comments',
        };
    }
};

const deleteCommentService = async (commentId, userId) => {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return {
                EC: 1,
                EM: 'Comment not found',
            };
        }
        const User = require('../models/user');
        let isAdmin = false;
        const user = await User.findById(userId);
        if (user && user.role === 'admin') {
            isAdmin = true;
        }
        if (comment.userId.toString() !== userId && !isAdmin) {
            return {
                EC: 3,
                EM: 'You are not authorized to delete this comment',
            };
        }

        const destinationId = comment.destinationId;

        await Comment.findByIdAndDelete(commentId);
        
        await Destination.findByIdAndUpdate(destinationId, {
            $pull: { comments: commentId },
        });

        const remainingComments = await Comment.find({ destinationId });
        const totalComments = remainingComments.length;

        if (totalComments > 0) {
            const totalRating = remainingComments.reduce((sum, comment) => {
                const commentDetailValues = Object.values(comment.detail || {});
                const commentAverage =
                    commentDetailValues.length > 0
                        ? commentDetailValues.reduce((s, score) => s + score, 0) / commentDetailValues.length
                        : 0;
                return sum + commentAverage;
            }, 0);

            const newAverageRating = totalComments > 0 ? totalRating / totalComments : 0;

            await Destination.findByIdAndUpdate(destinationId, {
                $set: {
                    'statistics.totalRate': totalComments,
                    'statistics.averageRating': isNaN(newAverageRating) ? 0 : Math.round(newAverageRating * 10) / 10,
                },
            });
        } else {
            // No comments left, reset statistics
            await Destination.findByIdAndUpdate(destinationId, {
                $set: {
                    'statistics.totalRate': 0,
                    'statistics.averageRating': 0,
                },
            });
        }

        return {
            EC: 0,
            EM: 'Delete comment success',
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while deleting comment',
        };
    }
};

const getCommentByIdService = async (commentId) => {
    try {
        const comment = await Comment.findById(commentId).populate('userId', 'fullName avatar');

        if (!comment) {
            return {
                EC: 1,
                EM: 'Comment not found',
            };
        }

        return {
            EC: 0,
            EM: 'Get comment success',
            data: comment,
        };
    } catch (error) {
        console.log(error);
        return {
            EC: 2,
            EM: 'An error occurred while getting comment',
        };
    }
};

module.exports = {
    createCommentService,
    getCommentsByDestinationService,
    deleteCommentService,
    getCommentByIdService,
};
