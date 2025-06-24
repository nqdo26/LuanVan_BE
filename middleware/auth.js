require('dotenv').config();
const { a } = require('framer-motion/client');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const white_lists = ['/', '/login', '/register', '/search', '/createAdmin'];

    if (white_lists.find((item) => '/v1/api' + item === req.originalUrl)) {
        next();
    } else {
        if (req?.headers?.authorization?.split(' ')?.[1]) {
            const token = req.headers.authorization.split(' ')[1];

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = {
                    fullName: decoded.fullName,
                    email: decoded.email,
                    name: decoded.name,
                    avatar: decoded.avatar,
                    isAdmin: decoded.isAdmin,
                    favortites: decoded.favortites,
                    tours: decoded.tours,
                };
                next();
            } catch (error) {
                return res.status(401).json({
                    message: 'Token het han/Hoac khong hop le',
                });
            }
        } else {
            // return exception
            return res.status(401).json({
                message: 'Ban chu truyen Access token o header/Hoac token bi het han',
            });
        }
    }
};

module.exports = auth;
