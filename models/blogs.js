const mongoose = require('mongoose')
const logger = require('../utils/logger')
const config = require('../utils/config')

const blogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
  .then(result => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

module.exports = mongoose.model('Blog', blogSchema)

