require('dotenv').config({path: '.env'});

module.exports = {
    jwtSecret: process.env.SECRET_KEY,
    jwtSession: {
        session: false
    }
};