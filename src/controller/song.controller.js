const songModel = require('../models/song.model')
const id3 = require('node-id3')
const storageService = require('../services/storage.service')

async function uploadSong(req,res) {

    const songBuffer = req.body.buffer
    const {mood} = req.body
    const tags = id3.read(songBuffer) 
    /** ye node-id3 package jo ham song bhej rhe h uska title, poster ko read krega or ye id3 hamare song ki image bhi provide kr rha h  */
    
    const [songFile, posterFile ] = await Promise.all([
        storageService.uploadFile({
            buffer: songBuffer,
            filename: tags.title,
            folder: '/cohort-2/moodify/songs'
        }),
        storageService.uploadFile({
            buffer: tags.image.imageBuffer,
            filename: tags.title + ".jpeg",
            folder: 'cohort-2/moodify/posters'
        })
    ])
    
    // const posterFile = await Promise.all([storageService.uploadFile({
    //     buffer: tags.image.imageBuffer,
    //     filename: tags.title + ".jpeg",
    //     folder: 'cohort-2/moodify/posters'
    // })])

    const song = await songModel.create({
        title: tags.title,
        url: songFile.url,
        posterUrl: posterUrl.url,
        mood
    })

    res.status(201).json({
        message:" song created successfully",
        song
    })
}

async function getSong(req,res) {
    const {mood} = req.query

    const song = await songModel.findOne({
        mood
    })

    res.status(200).json({
        message: "song fetch successfully",
        song,
    })
}


module.exports = {
    uploadSong,
    getSong
}