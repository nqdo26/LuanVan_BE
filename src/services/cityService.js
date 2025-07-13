const City = require('../models/city');
const slugify = require('slugify');

const createCityService = async (data, imageFiles, userId) => {
    try {
        const existingCity = await City.findOne({ name: data.title.trim() });
        if (existingCity) {
            return {
                EC: 1,
                EM: 'Tên thành phố đã tồn tại. Vui lòng chọn tên khác.',
            };
        }

        let weatherData = data.weather;
        if (typeof weatherData === 'string') {
            try {
                weatherData = JSON.parse(weatherData);
            } catch (error) {
                return {
                    EC: 2,
                    EM: 'Dữ liệu thời tiết không hợp lệ.',
                };
            }
        }

        let infoData = data.info || [];
        if (typeof infoData === 'string') {
            try {
                infoData = JSON.parse(infoData);
            } catch (error) {
                infoData = [];
            }
        }
        let typeData = data.type || [];
        if (typeof typeData === 'string') {
            try {
                typeData = JSON.parse(typeData);
            } catch (error) {
                typeData = [];
            }
        }

        if (!Array.isArray(typeData)) {
            typeData = typeData ? [typeData] : [];
        }

        const images = imageFiles.map((file) => file.path);

        const newCity = new City({
            name: data.title,
            description: data.description,
            type: typeData,
            images,
            weather: weatherData,
            info: infoData,
            createdBy: userId,
        });

        await newCity.save();

        return {
            EC: 0,
            EM: 'Tạo thành phố thành công',
            data: newCity,
        };
    } catch (error) {
        return {
            EC: 99,
            EM: 'Tạo thành phố thất bại, đã xảy ra lỗi server',
        };
    }
};

const getCitiesService = async () => {
    try {
        const cities = await City.find({})
            .populate('type', 'title')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });

        return {
            EC: 0,
            EM: 'Lấy danh sách thành phố thành công',
            data: cities,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Lấy danh sách thành phố thất bại',
        };
    }
};

const getCityByIdService = async (id) => {
    try {
        const city = await City.findById(id).populate('type', 'title').populate('createdBy', 'fullName email');

        if (!city) {
            return {
                EC: 1,
                EM: 'Thành phố không tồn tại.',
            };
        }

        return {
            EC: 0,
            EM: 'Lấy thông tin thành phố thành công',
            data: city,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Lấy thông tin thành phố thất bại',
        };
    }
};

const getCityBySlugService = async (slug) => {
    try {
        const city = await City.findOne({ slug: slug })
            .populate('type', 'title')
            .populate('createdBy', 'fullName email');

        if (!city) {
            return {
                EC: 1,
                EM: 'Thành phố không tồn tại.',
            };
        }

        // Removed automatic view increment - now handled by explicit API call
        // await City.findByIdAndUpdate(city._id, { $inc: { views: 1 } });

        return {
            EC: 0,
            EM: 'Lấy thông tin thành phố thành công',
            data: city,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Lấy thông tin thành phố thất bại',
        };
    }
};

const getCityByIdAndUpdateService = async (id, data = null, imageFiles = [], userId = null) => {
    try {
        if (!data) {
            const city = await City.findById(id).populate('type', 'title').populate('createdBy', 'fullName email');

            if (!city) {
                return {
                    EC: 1,
                    EM: 'Thành phố không tồn tại.',
                };
            }

            return {
                EC: 0,
                EM: 'Lấy thông tin thành phố thành công',
                data: city,
            };
        }

        const existingCity = await City.findById(id);
        if (!existingCity) {
            return {
                EC: 1,
                EM: 'Thành phố không tồn tại.',
            };
        }

        let weatherData = data.weather;
        if (typeof weatherData === 'string') {
            try {
                weatherData = JSON.parse(weatherData);
            } catch (error) {
                return {
                    EC: 3,
                    EM: 'Dữ liệu thời tiết không hợp lệ.',
                };
            }
        }

        let infoData = data.info || [];
        if (typeof infoData === 'string') {
            try {
                infoData = JSON.parse(infoData);
            } catch (error) {
                infoData = [];
            }
        }
        let typeData = data.type || [];
        if (typeof typeData === 'string') {
            try {
                typeData = JSON.parse(typeData);
            } catch (error) {
                typeData = [];
            }
        }

        if (!Array.isArray(typeData)) {
            typeData = typeData ? [typeData] : [];
        }

        const updateData = {
            name: data.title || existingCity.name,
            description: data.description || existingCity.description,
            type: typeData.length > 0 ? typeData : existingCity.type,
            weather: weatherData || existingCity.weather,
            info: infoData || existingCity.info,
        };

        // Update slug if title/name is changed
        if (data.title && data.title !== existingCity.name) {
            const newSlug = slugify(data.title, { lower: true });

            // Check if slug already exists (except for current city)
            const existingSlugCity = await City.findOne({
                slug: newSlug,
                _id: { $ne: id },
            });

            if (existingSlugCity) {
                return {
                    EC: 1,
                    EM: 'Tên thành phố đã tồn tại. Vui lòng chọn tên khác.',
                };
            }

            updateData.slug = newSlug;
        }

        let finalImages = existingCity.images || [];

        if (data.existing_images && Array.isArray(data.existing_images)) {
            finalImages = data.existing_images;
        }

        if (imageFiles && imageFiles.length > 0) {
            const newImages = imageFiles.map((file) => file.path);
            finalImages = [...finalImages, ...newImages];
        }

        updateData.images = finalImages;

        const { existing_images, ...otherData } = data;
        Object.assign(updateData, otherData);

        const updatedCity = await City.findByIdAndUpdate(id, updateData, { new: true })
            .populate('type', 'title')
            .populate('createdBy', 'fullName email');

        return {
            EC: 0,
            EM: 'Cập nhật thành phố thành công',
            data: updatedCity,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Có lỗi xảy ra khi xử lý thành phố',
        };
    }
};

const updateCityService = async (id, data, imageFiles, userId) => {
    try {
        const existingCity = await City.findById(id);
        if (!existingCity) {
            return {
                EC: 1,
                EM: 'Thành phố không tồn tại.',
            };
        }

        let weatherData = data.weather;
        if (typeof weatherData === 'string') {
            try {
                weatherData = JSON.parse(weatherData);
            } catch (error) {
                return {
                    EC: 3,
                    EM: 'Dữ liệu thời tiết không hợp lệ.',
                };
            }
        }

        let infoData = data.info || [];
        if (typeof infoData === 'string') {
            try {
                infoData = JSON.parse(infoData);
            } catch (error) {
                infoData = [];
            }
        }

        let typeData = data.type || [];
        if (typeof typeData === 'string') {
            try {
                typeData = JSON.parse(typeData);
            } catch (error) {
                typeData = [];
            }
        }

        if (!Array.isArray(typeData)) {
            typeData = typeData ? [typeData] : [];
        }

        const updateData = {
            name: data.title || existingCity.name,
            description: data.description || existingCity.description,
            type: typeData.length > 0 ? typeData : existingCity.type,
            weather: weatherData || existingCity.weather,
            info: infoData || existingCity.info,
        };

        // Update slug if title/name is changed
        if (data.title && data.title !== existingCity.name) {
            const newSlug = slugify(data.title, { lower: true });

            // Check if slug already exists (except for current city)
            const existingSlugCity = await City.findOne({
                slug: newSlug,
                _id: { $ne: id },
            });

            if (existingSlugCity) {
                return {
                    EC: 1,
                    EM: 'Tên thành phố đã tồn tại. Vui lòng chọn tên khác.',
                };
            }

            updateData.slug = newSlug;
        }

        let finalImages = existingCity.images || [];

        if (data.existing_images && Array.isArray(data.existing_images)) {
            finalImages = data.existing_images;
        }

        if (imageFiles && imageFiles.length > 0) {
            const newImages = imageFiles.map((file) => file.path);
            finalImages = [...finalImages, ...newImages];
        }

        updateData.images = finalImages;

        const { existing_images, ...otherData } = data;
        Object.assign(updateData, otherData);

        const updatedCity = await City.findByIdAndUpdate(id, updateData, { new: true })
            .populate('type', 'title')
            .populate('createdBy', 'fullName email');

        return {
            EC: 0,
            EM: 'Cập nhật thành phố thành công',
            data: updatedCity,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Cập nhật thành phố thất bại, đã xảy ra lỗi server',
        };
    }
};

const deleteCityService = async (id) => {
    try {
        const existingCity = await City.findById(id);
        if (!existingCity) {
            return {
                EC: 1,
                EM: 'Thành phố không tồn tại.',
            };
        }

        const Destination = require('../models/destination');
        const destinationCount = await Destination.countDocuments({ 'location.city': id });

        if (destinationCount > 0) {
            await Destination.deleteMany({ 'location.city': id });
        }

        await City.findByIdAndDelete(id);

        return {
            EC: 0,
            EM:
                destinationCount > 0
                    ? `Xóa thành phố và ${destinationCount} địa điểm liên quan thành công`
                    : 'Xóa thành phố thành công',
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Xóa thành phố thất bại, đã xảy ra lỗi server',
        };
    }
};

const getCityDeletionInfoService = async (id) => {
    try {
        const existingCity = await City.findById(id);
        if (!existingCity) {
            return {
                EC: 1,
                EM: 'Thành phố không tồn tại.',
            };
        }

        const Destination = require('../models/destination');
        const relatedDestinations = await Destination.find({ 'location.city': id }).select('title');
        const destinationCount = relatedDestinations.length;

        return {
            EC: 0,
            EM: 'Lấy thông tin xóa thành phố thành công',
            data: {
                cityName: existingCity.name,
                destinationCount,
                destinations: relatedDestinations.map((dest) => ({ id: dest._id, title: dest.title })),
            },
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Lấy thông tin xóa thành phố thất bại',
        };
    }
};

const getCitiesWithDestinationCountService = async () => {
    try {
        const Destination = require('../models/destination');

        const cities = await City.find({})
            .populate('type', 'title')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });

        const citiesWithCount = await Promise.all(
            cities.map(async (city) => {
                const destinationCount = await Destination.countDocuments({ 'location.city': city._id });
                return {
                    ...city.toObject(),
                    destinationCount,
                };
            }),
        );

        return {
            EC: 0,
            EM: 'Lấy danh sách thành phố với số địa điểm thành công',
            data: citiesWithCount,
        };
    } catch (error) {
        return {
            EC: 2,
            EM: 'Lấy danh sách thành phố thất bại',
        };
    }
};

const incrementCityViews = async (cityId) => {
    try {
        const city = await City.findByIdAndUpdate(
            cityId,
            {
                $inc: { views: 1 },
            },
            {
                new: true,
                runValidators: false,
            },
        );

        if (!city) {
            return {
                EC: 1,
                EM: 'Không tìm thấy thành phố',
                data: null,
            };
        }

        return {
            EC: 0,
            EM: 'Tăng lượt xem thành công',
            data: city.views,
        };
    } catch (error) {
        console.error('Error in incrementCityViews service:', error);
        return {
            EC: 1,
            EM: 'Lỗi khi tăng lượt xem',
            data: null,
        };
    }
};

module.exports = {
    createCityService,
    getCitiesService,
    getCityByIdService,
    getCityBySlugService,
    getCityByIdAndUpdateService,
    updateCityService,
    deleteCityService,
    getCityDeletionInfoService,
    getCitiesWithDestinationCountService,
    incrementCityViews,
};
