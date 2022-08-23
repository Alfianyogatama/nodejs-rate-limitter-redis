const express = require('express')
const app = express()
const port = 3000
const Controller = require('./controllers')
const { limitter } = require('./middlewares')

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/do-something', limitter, Controller.basic)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

