const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authentication = async (req, res, next) => {
    try {
        let token = req.cookies.jwtoken;
        if (!token) return res.status(403).send({ status: false, message: "Token required! Please login to generate token" });

        try {

            const verifyToken = jwt.verify(token, "secrete-key");
            req.decodedToken = verifyToken;

        } catch (error) {
            return res.status(401).send({ status: false, message: error.message });
        }

        let user = await userModel.findOne({ _id: req.decodedToken._id });
        if (!user) return res.status(400).send({ status: false, message: "user not found" });

        req.userData = user;

        next()

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { authentication }