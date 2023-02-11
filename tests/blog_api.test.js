const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blogs')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})


describe('Test retrieving all blogs', () => {
  //4.8
  test('right number of blogs in JSON format', async () => {
    const response = await api.get('/api/blogs')
    expect(200)
    expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  //4.9
  test('returned blogs have field id', async () => {
    const response = await api.get('/api/blogs')

    const ids = response.body.map(blog => blog.id)
    const filtered = ids.filter(e => e) // filter away all undefined ids
    const fetchIds = (filtered) => {
    // there can not be less defined ids than blogs in database
      if (filtered.length < helper.initialBlogs.length) {
        return undefined
      } else {
        return filtered
      }
    }

    expect(fetchIds(filtered)).toBeDefined()
  })

})

describe('Test adding blogs', () => {
//4.10
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const urls = blogsAtEnd.map(r => r.url)

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(urls).toContain(
      'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
    )
  })

  // 4.11*
  test('if likes is not defined it will get value 0', async () => {
    const newBlog = {
      title: 'Second class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2018/05/05/TestDefinitions.htmll',
    }

    const response  = await api.post('/api/blogs').send(newBlog)
    expect(response.body.likes).toBe(0)

  })

  // 4.12* 1/2
  test('if url is not defined give status code 400', async () => {
    const newBlog = {
      title: 'Third class tests',
      author: 'Robert C. Martin',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

  })

  // 4.12* 2/2
  test('if title is not defined give status code 400', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2018/05/05/TestDefinitions.htmll',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

  })
})



// 4.13
test('a blog can be deleted', async () => {
  const blogAtStart = await helper.blogsInDb()
  const blogToDelete = blogAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  )

  const urls = blogsAtEnd.map(r => r.url)

  expect(urls).not.toContain(blogToDelete.url)
})

//4.14*
test('likes in blog can be updated', async () => {
  const blogAtStart = await helper.blogsInDb()
  const blogToUpdate = blogAtStart[0]
  blogToUpdate.likes = 10

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length
  )
  expect(response.body.likes).toBe(10)
})



afterAll(async () => {
  await mongoose.connection.close()
})