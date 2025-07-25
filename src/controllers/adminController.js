const User = require('../models/user');

const City = require('../models/city');
const Destination = require('../models/destination');

const { createAdminService, updateUserAdminService } = require('../services/adminService');
const { getUsersService, deleteUserService } = require('../services/userService');

const createAdmin = async (req, res) => {
    const { fullName, email, password, avatar } = req.body;

    const data = await createAdminService(email, password, fullName, avatar);

    return res.status(200).json(data);
};

const getUsers = async (req, res) => {
    const data = await getUsersService();
    return res.status(200).json(data);
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    const data = await deleteUserService(id);

    return res.status(200).json(data);
};

const updateUserAdmin = async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const data = await updateUserAdminService(id, isAdmin);
    return res.status(200).json(data);
};

const getStatistics = async (req, res) => {
    try {
        const userCount = await User.countDocuments({});
        const adminCount = await User.countDocuments({ isAdmin: true });
        const cityCount = await City.countDocuments({});
        const destinationCount = await Destination.countDocuments({});
        const cities = await City.find({});
        const places = await Destination.find({});
        const placeStats = places.map((p) => ({
            name: p.title,
            statistics: {
                views: p.statistics?.views || 0,
                averageRating: p.statistics?.averageRating || 0,
            },
        }));
        const cityStats = await Promise.all(
            cities.map(async (c) => {
                const totalViews = c.views || 0;
                return { city: c.name, totalViews };
            }),
        );

        // Lấy 7 ngày gần nhất
        const dayjs = require('dayjs');
        const days = Array.from({ length: 7 }, (_, i) =>
            dayjs()
                .subtract(6 - i, 'day')
                .format('DD/MM'),
        );
        const userCounts = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%d/%m', date: '$createdAt' } },
                    users: { $sum: 1 },
                },
            },
        ]);
        // Map về đủ 7 ngày, nếu không có thì users = 0
        const recentUsers = days.map((date) => {
            const found = userCounts.find((u) => u._id === date);
            return { _id: date, users: found ? found.users : 0 };
        });
        res.json({
            userCount,
            adminCount,
            cityCount,
            destinationCount,
            placeStats,
            cityStats,
            recentUsers,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAdmin,
    getUsers,
    deleteUser,
    updateUserAdmin,
    getStatistics,
};
