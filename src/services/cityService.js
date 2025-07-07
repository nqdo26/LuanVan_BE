const City = require('../models/city');

const createCityService = async (data, imageFiles, userId) => {
    try {
        if (
            !data.title?.trim() ||
            !data.description?.trim() ||
            !data.weather ||
            !imageFiles ||
            imageFiles.length === 0
        ) {
            return {
                EC: 1,
                EM: 'Vui lòng nhập đầy đủ thông tin bắt buộc và tải lên ít nhất 1 ảnh.',
            };
        }

        const existingCity = await City.findOne({ name: data.title.trim() });
        if (existingCity) {
            return {
                EC: 2,
                EM: 'Tên thành phố đã tồn tại. Vui lòng chọn tên khác.',
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

        if (!Array.isArray(weatherData) || weatherData.length !== 4) {
            return {
                EC: 4,
                EM: 'Dữ liệu thời tiết phải có đầy đủ 4 mùa.',
            };
        }

        const weatherValid = weatherData.every(
            (w) => w.minTemp !== undefined && w.maxTemp !== undefined && w.note?.trim(),
        );

        if (!weatherValid) {
            return {
                EC: 5,
                EM: 'Vui lòng điền đầy đủ thông tin thời tiết cho tất cả các mùa.',
            };
        }

        // Parse info data if it's a string
        let infoData = data.info || [];
        if (typeof infoData === 'string') {
            try {
                infoData = JSON.parse(infoData);
            } catch (error) {
                infoData = [];
            }
        }

        // Parse type data if it's a string (for multiple types)
        let typeData = data.type || [];
        if (typeof typeData === 'string') {
            try {
                typeData = JSON.parse(typeData);
            } catch (error) {
                typeData = [];
            }
        }

        // Ensure typeData is an array
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
            EC: 2,
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
        console.error('Error in getCitiesService:', error);
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
        console.error('Error in getCityByIdService:', error);
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

        // Tăng views khi có người xem
        await City.findByIdAndUpdate(city._id, { $inc: { views: 1 } });

        return {
            EC: 0,
            EM: 'Lấy thông tin thành phố thành công',
            data: city,
        };
    } catch (error) {
        console.error('Error in getCityBySlugService:', error);
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

        // Update images if provided
        if (imageFiles && imageFiles.length > 0) {
            updateData.images = imageFiles.map((file) => file.path);
        }

        const updatedCity = await City.findByIdAndUpdate(id, updateData, { new: true })
            .populate('type', 'title')
            .populate('createdBy', 'fullName email');

        return {
            EC: 0,
            EM: 'Cập nhật thành phố thành công',
            data: updatedCity,
        };
    } catch (error) {
        console.error('Error in getCityByIdAndUpdateService:', error);
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

        // Parse weather data if it's a string
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

        // Parse info data if it's a string
        let infoData = data.info || [];
        if (typeof infoData === 'string') {
            try {
                infoData = JSON.parse(infoData);
            } catch (error) {
                infoData = [];
            }
        }

        // Parse type data if it's a string (for multiple types)
        let typeData = data.type || [];
        if (typeof typeData === 'string') {
            try {
                typeData = JSON.parse(typeData);
            } catch (error) {
                typeData = [];
            }
        }

        // Ensure typeData is an array
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

        // Update images if provided
        if (imageFiles && imageFiles.length > 0) {
            updateData.images = imageFiles.map((file) => file.path);
        }

        const updatedCity = await City.findByIdAndUpdate(id, updateData, { new: true })
            .populate('type', 'title')
            .populate('createdBy', 'fullName email');

        return {
            EC: 0,
            EM: 'Cập nhật thành phố thành công',
            data: updatedCity,
        };
    } catch (error) {
        console.error('Error in updateCityService:', error);
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

        await City.findByIdAndDelete(id);

        return {
            EC: 0,
            EM: 'Xóa thành phố thành công',
        };
    } catch (error) {
        console.error('Error in deleteCityService:', error);
        return {
            EC: 2,
            EM: 'Xóa thành phố thất bại, đã xảy ra lỗi server',
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
};
