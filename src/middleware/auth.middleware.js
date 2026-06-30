const jwt = require("jsonwebtoken")
const userModel = require('../models/user.model')
const blackListModel = require("../models/blacklist.model")
const redis = require('../config/caches')

async function identifyUser(req,res,next) {
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"Token not Provided"
        })
    }

    const isTokenBlacklisted = await redis.get(token) // check kr rhe h token black list me h ki nhi

    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Invalid Token"
        })
    }

    let decoded = null 

    try {
        decoded = jwt.verify(token ,process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message:"Invalid Token"
        })
    }

    req.user = decoded

    next()
}

module.exports = identifyUser