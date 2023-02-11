const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/blogs')
const { requestLogger, unknownEndpoint } = require('./utils/middleware')

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use('/api/blogs', blogRouter)
app.use(unknownEndpoint)



module.exports = app