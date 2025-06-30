const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**

 * @param {string} folderName 
 * @returns 
 */
function uploadByFolder(folderName) {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `GoOhNo/${folderName}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            public_id: (req, file) => `${Date.now()}-${file.originalname}`,
        },
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 4,
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Chỉ chấp nhận ảnh JPEG, PNG, WEBP'), false);
            }
        },
    });
}

module.exports = { uploadByFolder };
