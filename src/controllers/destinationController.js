const destinationService = require('../services/destinationService');

const createDestination = async (req, res) => {
    try {
        const files = {
            space: req.files?.album_space || [],
            fnb: req.files?.album_fnb || [],
            extra: req.files?.album_extra || [],
            highlight: req.files?.highlight || [],
        };
        let body = { ...req.body };
        [
            'highlight',
            'services',
            'cultureType',
            'activities',
            'fee',
            'usefulInfo',
            'newHighlight',
            'newServices',
            'newUsefulInfo',
            'newCultureType',
            'newActivities',
            'newFee',
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
        res.status(200).json({ EC: 0, data: destination });
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
        const destination = await destinationService.updateDestination(req.params.id, req.body, req.files);
        if (!destination) return res.status(404).json({ EC: 1, EM: 'Không tìm thấy địa điểm' });
        res.status(200).json({ EC: 0, EM: 'Cập nhật địa điểm thành công', data: destination });
    } catch (err) {
        res.status(500).json({ EC: 1, EM: 'Cập nhật địa điểm thất bại', error: err.message });
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
