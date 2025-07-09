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
        const files = req.files;

        console.log('Data received in BE:', data);

        if (data.tags && Array.isArray(data.tags)) {
            data.tags = data.tags.map((tag) => {
                if (mongoose.Types.ObjectId.isValid(tag)) {
                    return new mongoose.Types.ObjectId(tag);
                } else {
                    console.warn(`Invalid tag format received: ${tag}`);
                    return tag;
                }
            });
        }

        console.log('Processed tags in BE:', data.tags);

        const updated = await destinationService.updateDestination(id, data, files);
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

module.exports = {
    createDestination,
    getDestinations,
    getDestinationById,
    getDestinationBySlug,
    updateDestination,
    getDestinationByIdAndUpdate,
    deleteDestination,
};
