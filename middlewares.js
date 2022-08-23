const Client = require('./redis')
const { dateNow, parseMilisecond } = require('./day')

exports.limitter = async (req, res, next) => {
  try {
    /**
     * * CHECK RECORD DI REDIS DENGAN KEY IP ADDRESS USER
     * * JIKA TIDAK ADA RECORD BUAT RECORD BARU DENGAN FORMAT :
     *    * - ARRAY OF :
     *    * - requestTimeStamp : waktu dalam milisecond string, requestCount: jumlah maksimal request
     *    * - */
    // await Client.flushAll()
    const userIp = req.ip
    const record = await Client.get(userIp)
    const currentRequestTime = dateNow()

    // console.log(record, currentRequestTime, parseMilisecond(currentRequestTime))

    const windowSizeInSeconds = 60
    const maxRequestCount = 3
    const windowLogInterval = 1 // ?

    if (!record) {
      console.log('masuk sini')
      const newRecord = []
      const requestLog = {
        requestTimeStamp: parseMilisecond(currentRequestTime.format()),
        requestCount: 1
      }
      newRecord.push(requestLog)
      await Client.set(userIp, JSON.stringify(newRecord))
      return next()
    }
    console.log('else condition')
    const datas = JSON.parse(record)
    const startTimeStamp = parseMilisecond(
      dateNow().subtract(windowSizeInSeconds, 'seconds')
    )
    // console.log(startTimeStamp, 'START TIME STAMP')
    // console.log(parseMilisecond(currentRequestTime), startTimeStamp)
    const requestWithinWindow = datas.filter((el) => {
      // console.log(el.requestTimeStamp, startTimeStamp)
      return el.requestTimeStamp > startTimeStamp
    })

    console.log('requestWithinWindow', requestWithinWindow)
    const totalWindowReqCount = requestWithinWindow.reduce((total, el) => {
      return total + el.requestCount
    }, 0)

    // console.log(totalWindowReqCount, '<<<<')
    // number of requests reach maksimum limit
    if (totalWindowReqCount >= maxRequestCount)
      throw {
        code: 429,
        message: `You have exceeded the ${maxRequestCount} requests in ${windowSizeInSeconds} seconds limit!`
      }

    // if number of requests less then limit
    // log new entry
    const lastReqLog = datas[datas.length - 1]
    const intervalStartTimeStamp = parseMilisecond(
      currentRequestTime.subtract(windowLogInterval, 'seconds')
    )

    //  if interval has not passed since last request log, increment counter
    console.log(lastReqLog.requestTimeStamp, intervalStartTimeStamp)
    if (lastReqLog.requestTimeStamp > intervalStartTimeStamp) {
      lastReqLog.requestCount++
      datas[datas.length - 1] = lastReqLog
    } else {
      //  if interval has passed, log new entry for current user and timestamp
      datas.push({
        requestTimeStamp: parseMilisecond(currentRequestTime),
        requestCount: 1
      })
    }
    console.log(datas)
    await Client.set(userIp, JSON.stringify(datas))
    // await Client.flushAll()
    next()
  } catch (err) {
    console.error(err)
    res.status(err.code).json({
      code: err.code || 500,
      message: err.message || 'Internal server error'
    })
  }
}

