const blogRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})


blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  console.log(blog)
  const user = await User.findById(request.body.userId)
  console.log(user)
  blog.user = user._id
  if (blog.title === undefined || blog.url === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  else {
    blog.likes = blog.likes || 0
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  }
})




blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})


blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})


module.exports = blogRouter