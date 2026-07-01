const userModel = require('../models/user.model')
const blackListModel = require('../models/blacklist.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const redis = require('../config/caches')

async function registerUser(req,res){
    const { username , email, password } = req.body

    console.log(req.body);
    console.log(typeof req.body.username);
    console.log(req.body.username);

    const isAlreadyExist = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    })

    if(isAlreadyExist){
        return res.status(400).json({
            message: 'user already exit with this email or username'
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password:hash
    })

    const token = jwt.sign({
        id: user._id,
        username: user.username
    },process.env.JWT_SECRET,
    { expiresIn:'3d'})

    res.cookie('token', token)

    return res.status(201).json({
        message: 'User register successfully',
        user:{
            id:user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function loginUser(req,res){
    const { username , email, password } = req.body

    const user = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    }).select('+password')

    if(!user){
        return res.status(400).json({
            message: 'Invalid credentials'
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message: 'Invalid credentials'
        })
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        { 
            expiresIn:'3d'
        }
    )

    res.cookie('token', token)

    return res.status(201).json({
        message: 'User logged in successfully',
        user:{
            id:user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function getMe(req,res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: 'user fetch successfully',
        user
    })
}

async function logoutUser(req,res) {
    const token = req.cookies.token

    res.clearCookie('token')

    await redis.set(token, Date.now().toString(),"EX",60*60)  // expire hoga token 60*60 sec me means 1hour me hat jayega
    // isme hamne data key value k pair me send kiya h token h key or date h value
    // kyu ki data string ki form me save hota h to toString me change kr diya

    // await blackListModel.create({
    //     token
    // })

    res.status(201).json({
        message:'logout successfully'
    })
}

module.exports = { 
    registerUser,
    loginUser,
    getMe,
    logoutUser
}