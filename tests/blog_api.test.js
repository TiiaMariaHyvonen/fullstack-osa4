const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blogs')
const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()

  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})


describe('Test retrieving all blogs', () => {

  test('right number of blogs in JSON format', async () => {
    const response = await api.get('/api/blogs')
    expect(200)
    expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

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

  test('a valid blog can be added', async () => {
    const login_response = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
    const token = login_response.body.token

    const usersAtStart = await helper.usersInDb()
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      userId: usersAtStart[0].id
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const urls = blogsAtEnd.map(r => r.url)

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(urls).toContain(
      'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
    )
  })


  test('if likes is not defined it will get value 0', async () => {
    const login_response = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
    const token = login_response.body.token
    const usersAtStart = await helper.usersInDb()
    const newBlog = {
      title: 'Second class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2018/05/05/TestDefinitions.htmll',
      userId: usersAtStart[0].id
    }

    const response  = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog)
    expect(response.body.likes).toBe(0)

  })

  test('if url is not defined give status code 400', async () => {
    const login_response = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
    const token = login_response.body.token
    const usersAtStart = await helper.usersInDb()
    const newBlog = {
      title: 'Third class tests',
      author: 'Robert C. Martin',
      likes: 5,
      userId: usersAtStart[0].id
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

  })


  test('if title is not defined give status code 400', async () => {
    const login_response = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
    const token = login_response.body.token
    const usersAtStart = await helper.usersInDb()
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2018/05/05/TestDefinitions.htmll',
      likes: 5,
      userId: usersAtStart[0].id
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

  })

  test('if token is not included give status code 401 and error message', async () => {
    const usersAtStart = await helper.usersInDb()
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2018/05/05/TestDefinitions.htmll',
      likes: 5,
      userId: usersAtStart[0].id
    }

    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('token missing or invalid')

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

  })
})



// To test deleting blog, first create blog with id of user 'root', which is first user in database
test('a blog can be deleted', async () => {
  const login_response = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
  const token = login_response.body.token

  const user_response = await api.get('/api/users')

  const blogToBeDeleted = {
    title: 'Last class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/delete',
    likes: 19,
    userId: user_response.body[0].id
  }

  const blog_post_response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogToBeDeleted)

  await api
    .delete(`/api/blogs/${blog_post_response.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length // One blog was added and deleted
  )

  const urls = blogsAtEnd.map(r => r.url)
  expect(urls).not.toContain(blogToBeDeleted.url)
})

test('likes in blog can be updated', async () => {

  const login_response = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
  const token = login_response.body.token
  console.log(token)
  const user_response = await api.get('/api/users')
  console.log(user_response.body[0].id)
  const blogToBeUpdated = {
    title: 'Last class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/delete',
    likes: 19,
    userId: user_response.body[0].id
  }
  console.log(blogToBeUpdated)

  const blog_post_response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogToBeUpdated)

  console.log(blog_post_response.body)

  const response = await api
    .put(`/api/blogs/${blog_post_response.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ likes: '67' })
    .expect(200)
  console.log('------------')
  console.log(response.body)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length + 1
  )
  expect(response.body.likes).toBe(67)
})


describe('when there is initially one user at db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hyvonet ',
      name: 'Tiia-Maria Hyvönen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Path `username` (`ro`) is shorter than the minimum allowed length (3).')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root2',
      name: 'Superuser2',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Given password is too short')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})





afterAll(async () => {
  await mongoose.connection.close()
})