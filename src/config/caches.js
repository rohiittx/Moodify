const Redis = require('ioredis').default

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

redis.on("connect", ()=>{  // ye ek mmiddleware h redis ka
    console.log("server is connected to redis")
})

redis.on("error", (err)=>{
    console.log(err)
})

module.exports = redis

/**
 * abhi sirf server ko redis se connect kiya h 
 */