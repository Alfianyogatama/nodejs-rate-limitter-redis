const client = require('./redis')

class Controller {
  static async basic(req, res) {
    try {
      const { username, email } = req.body
      // await client.set()
      res.status(200).json({
        status: 200,
        message: 'Ok'
      })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = Controller

