const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blogs')

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('right number of blogs in JSON format', async () => {
  const response = await api.get('/api/blogs')
  expect(200)
  expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('returned blogs have field id', async () => {
  const response = await api.get('/api/blogs')

  const ids = response.body.map(blog => blog.id)
  const filtered = ids.filter(e => e) // filter away all undefined ids
  const fetchIds = (filtered) => {
    // there can not be less defined ids than blogs in database
    if (filtered.length < initialBlogs.length) {
      return undefined
    } else {
      return filtered
    }
  }

  expect(fetchIds(filtered)).toBeDefined()
})



afterAll(async () => {
  await mongoose.connection.close()
})