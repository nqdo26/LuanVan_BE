const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình nơi lưu trữ file avatar
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'src/public/uploads/images/avatar/';
        cb(null, dir); // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        const normalizedPath = path.normalize(filename);
        cb(null, normalizedPath); // Đặt tên file với đường dẫn chuẩn hóa
    },
});

// Cấu hình nơi lưu trữ file cover
const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'src/public/uploads/images/cover/';
        cb(null, dir); // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        const normalizedPath = path.normalize(filename);
        cb(null, normalizedPath); // Đặt tên file với đường dẫn chuẩn hóa
    },
});

const contentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'src/public/uploads/lessons/';
        cb(null, dir); // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        const normalizedPath = path.normalize(filename);
        cb(null, normalizedPath); // Đặt tên file với đường dẫn chuẩn hóa
    },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const contentFileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/html') {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 1024 * 1024 * 5, // Giới hạn kích thước file 5MB
    },
    fileFilter: fileFilter,
});

const uploadCover = multer({
    storage: coverStorage,
    limits: {
        fileSize: 1024 * 1024 * 100, // Giới hạn kích thước file 5MB
    },
    fileFilter: fileFilter,
});

const uploadContent = multer({
    storage: contentStorage,
    limits: {
        fileSize: 1024 * 1024 * 10, // Giới hạn kích thước file 10MB
    },
    fileFilter: contentFileFilter,
});

module.exports = {
    uploadAvatar,
    uploadCover,
    uploadContent,
};
