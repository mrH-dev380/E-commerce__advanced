const redis = require('redis')

const client = redis.createClient({
  password: 'aRvDGREk0sjbT6KZyS9qc9jScoRHVgiB',
  socket: {
    host: 'redis-14261.c295.ap-southeast-1-1.ec2.cloud.redislabs.com',
    port: 14261,
  },
})

client.connect()

client.on('connect', (err, result) => {
  console.log('Redis client connected')
})

client.on('ready', (err, result) => {
  console.log('Redis is ready')
})

client.on('error', (error) => {
  console.log('error::', error)
})

module.exports = client
