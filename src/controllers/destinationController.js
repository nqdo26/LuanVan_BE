const destinationService = require('../services/destinationService');
const mongoose = require('mongoose');

const createDestination = async (req, res) => {
    try {
        const files = {
            space: req.files?.album_space || [],
            fnb: req.files?.album_fnb || [],
            extra: req.files?.album_extra || [],
            highlight: req.files?.highlight || [],
        };
        let body = { ...req.body };

        if (req.user && req.user.email) {
            body.createdBy = req.user.email;
        } else if (body.createdBy) {
            body.createdBy = body.createdBy;
        }
        [
            'highlight',
            'services',
            'cultureType',
            'activities',
            'fee',
            'usefulInfo',
            'newHighlight',
            'newServices',
        ].forEach((key) => {
            if (typeof body[key] === 'string') {
                try {
                    body[key] = JSON.parse(body[key]);
                } catch {}
            }
        });
        if (body.openHour && typeof body.openHour === 'string') {
            try {
                body.openHour = JSON.parse(body.openHour);
            } catch {}
        }
        const destination = await destinationService.createDestination(body, files);
        res.status(201).json({ EC: 0, EM: 'Tạo địa điểm thành công', data: destination });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Tạo địa điểm thất bại', error: err.message });
    }
};

const getDestinations = async (req, res) => {
    try {
        const destinations = await destinationService.getDestinations();
        res.status(200).json({ EC: 0, data: destinations });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Lấy danh sách địa điểm thất bại', error: err.message });
    }
};

const getDestinationById = async (req, res) => {
    try {
        const destination = await destinationService.getDestinationById(req.params.id);
        if (!destination) return res.status(404).json({ EC: 1, EM: 'Không tìm thấy địa điểm' });

        const response = {
            title: destination.title,
            slug: destination.slug,
            type: destination.type,
            tags: destination.tags,
            location: {
                address: destination.location?.address || '',
                city: destination.location?.city || '',
            },
            contactInfo: {
                phone: destination.contactInfo?.phone || '',
                website: destination.contactInfo?.website || '',
                facebook: destination.contactInfo?.facebook || '',
                instagram: destination.contactInfo?.instagram || '',
            },
            details: {
                description: destination.details?.description || '',
                highlight: destination.details?.highlight || [],
                services: destination.details?.services || [],
                cultureType: destination.details?.cultureType || [],
                activities: destination.details?.activities || [],
                fee: destination.details?.fee || [],
                usefulInfo: destination.details?.usefulInfo || [],
            },
            openHour: destination.openHour || {},
            album: {
                space: destination.album?.space || [],
                fnb: destination.album?.fnb || [],
                extra: destination.album?.extra || [],
            },
        };

        res.status(200).json({ EC: 0, data: response });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Lỗi lấy địa điểm', error: err.message });
    }
};

const getDestinationBySlug = async (req, res) => {
    try {
        const destination = await destinationService.getDestinationBySlug(req.params.slug);
        if (!destination) return res.status(404).json({ EC: 1, EM: 'Không tìm thấy địa điểm' });
        res.status(200).json({ EC: 0, data: destination });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Lỗi lấy địa điểm', error: err.message });
    }
};
const updateDestination = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        [
            'highlight',
            'services',
            'cultureType',
            'activities',
            'fee',
            'usefulInfo',
            'newHighlight',
            'newServices',
        ].forEach((key) => {
            if (typeof data[key] === 'string') {
                try {
                    data[key] = JSON.parse(data[key]);
                } catch {}
            }
        });

        if (data.details && typeof data.details === 'string') {
            try {
                data.details = JSON.parse(data.details);
            } catch {}
        }

        if (data.openHour && typeof data.openHour === 'string') {
            try {
                data.openHour = JSON.parse(data.openHour);
            } catch {}
        }

        if (data.contactInfo && typeof data.contactInfo === 'string') {
            try {
                data.contactInfo = JSON.parse(data.contactInfo);
            } catch {}
        }

        if (data.album && typeof data.album === 'string') {
            try {
                data.album = JSON.parse(data.album);
            } catch {}
        }

        if (data.tags && Array.isArray(data.tags)) {
            data.tags = data.tags.map((tag) => {
                if (mongoose.Types.ObjectId.isValid(tag)) {
                    return new mongoose.Types.ObjectId(tag);
                } else {
                    return tag;
                }
            });
        }

        if (req.user && req.user.email) {
            data.createdBy = req.user.email;
        }

        const updated = await destinationService.updateDestination(id, data, req.files || []);
        if (!updated) {
            return res.status(404).json({
                EC: 1,
                EM: 'Không tìm thấy địa điểm',
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: 'Cập nhật địa điểm thành công',
            data: updated,
        });
    } catch (err) {
        return res.status(500).json({
            EC: 1,
            EM: 'Cập nhật địa điểm thất bại',
            error: err.message,
        });
    }
};

const getDestinationByIdAndUpdate = getDestinationById;

const deleteDestination = async (req, res) => {
    try {
        const destination = await destinationService.deleteDestination(req.params.id);
        if (!destination) return res.status(404).json({ EC: 1, EM: 'Không tìm thấy địa điểm' });
        res.status(200).json({ EC: 0, EM: 'Xóa địa điểm thành công' });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Xóa địa điểm thất bại', error: err.message });
    }
};

const getPopularDestinations = async (req, res) => {
    try {
        const destinations = await destinationService.getPopularDestinations();
        res.status(200).json({ EC: 0, data: destinations });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Lấy danh sách địa điểm phổ biến thất bại', error: err.message });
    }
};

const getDestinationsByTags = async (req, res) => {
    try {
        const { tags, cityId, limit = 20 } = req.query;

        if (!tags) {
            return res.status(400).json({
                EC: 1,
                EM: 'Tags parameter is required',
            });
        }

        // Parse tags if it's a string
        let tagIds = [];
        if (typeof tags === 'string') {
            try {
                tagIds = JSON.parse(tags);
            } catch {
                tagIds = tags.split(',');
            }
        } else if (Array.isArray(tags)) {
            tagIds = tags;
        }

        // Validate tag IDs
        const validTagIds = tagIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

        if (validTagIds.length === 0) {
            return res.status(400).json({
                EC: 1,
                EM: 'No valid tag IDs provided',
            });
        }

        const result = await destinationService.getDestinationsByTags(validTagIds, cityId, parseInt(limit));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getDestinationsByTags:', error);
        res.status(500).json({
            EC: 1,
            EM: 'Lỗi server khi lấy địa điểm theo tags',
            error: error.message,
        });
    }
};

const searchDestinations = async (req, res) => {
    try {
        const { q: query, limit = 10, skip = 0 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                EC: 1,
                EM: 'Vui lòng nhập từ khóa tìm kiếm',
                data: null,
            });
        }

        const result = await destinationService.searchDestinations(query.trim(), {
            limit: parseInt(limit),
            skip: parseInt(skip),
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in searchDestinations:', error);
        res.status(500).json({
            EC: 1,
            EM: 'Lỗi server khi tìm kiếm địa điểm',
            error: error.message,
        });
    }
};

const incrementDestinationViews = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate destination ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                EC: 1,
                EM: 'ID địa điểm không hợp lệ',
                data: null,
            });
        }

        const result = await destinationService.incrementDestinationViews(id);

        if (result.EC === 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error in incrementDestinationViews controller:', error);
        res.status(500).json({
            EC: 1,
            EM: 'Lỗi server khi tăng lượt xem',
            data: null,
        });
    }
};

module.exports = {
    createDestination,
    getDestinations,
    searchDestinations,
    getDestinationById,
    getDestinationBySlug,
    updateDestination,
    getDestinationByIdAndUpdate,
    deleteDestination,
    getPopularDestinations,
    getDestinationsByTags,
    incrementDestinationViews,
};
