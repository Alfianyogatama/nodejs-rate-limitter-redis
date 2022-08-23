const moment = require('moment')

exports.dateNow = () => {
  return moment()
}

exports.parseMilisecond = (date) => {
  return moment(date).unix()
}

