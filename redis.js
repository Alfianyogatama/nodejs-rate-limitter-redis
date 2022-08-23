const redis = require('redis')
const redisHost = 'redis-19083.c295.ap-southeast-1-1.ec2.cloud.redislabs.com'
const redisPort = '19083'
const client = redis.createClient({
  url: 'redis://default:fiqd0T5AlYTDelzwMwnUnQFzAMVjDtmm@redis-19083.c295.ap-southeast-1-1.ec2.cloud.redislabs.com:19083'
})

client.on('error', (err) => console.log('redis error ', err))
client.connect().then((_) => console.log('redis connected!'))

module.exports = client
