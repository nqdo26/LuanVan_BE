const City = require('../models/city');

const createCityService = async (data, imageFiles) => {
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

        // Validate weather data
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

        const images = imageFiles.map((file) => file.path);

        const newCity = new City({
            name: data.title,
            description: data.description,
            type: data.type || null,
            images,
            weather: weatherData,
            info: infoData,
        });

        await newCity.save();

        return {
            EC: 0,
            EM: 'Tạo thành phố thành công',
            data: newCity,
        };
    } catch (error) {
        console.error('Error in createCityService:', error);
        return {
            EC: 99,
            EM: 'Tạo thành phố thất bại, đã xảy ra lỗi server',
        };
    }
};

const getCitiesService = async () => {
    try {
        const cities = await City.find({}).populate('type', 'title').sort({ createdAt: -1 });

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

module.exports = {
    createCityService,
    getCitiesService,
};
