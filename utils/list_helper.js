const dummy = (blogs) => {
    return 1
}
  

const totalLikes = (blogs) => {
    if (blogs.length === 0) {
        return 0
    }
    
    const reducer = (sum, item) => {
        return sum + item.likes
      }
    
      return blogs.reduce(reducer, 0)
}


const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return {}
    }
    const likes = blogs.map(blog => blog.likes)
    const index = likes.indexOf(Math.max(...likes))
    const favorite = blogs[index]

    return ( {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    })
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) { return {} }

    const authors = blogs.map(blog => blog.author)
    const author_occurances = {}

    for (author of authors) {
        if (!author_occurances.hasOwnProperty(author)){
            author_occurances[author] = 1
        } else {
            author_occurances[author] = author_occurances[author] + 1 
        }
    }

    const values = Object.values(author_occurances)
    const value = Math.max(...values)
    const most_author = Object.keys(author_occurances).find(key => author_occurances[key] === value)
    
    return ({
        author: most_author,
        blogs: value
    })
}


const mostLikes = (blogs) => {
    if (blogs.length === 0) { return {} }

    //const authors = blogs.map(blog => blog.author)
    const author_occurances = {}

    for (blog of blogs) {
        if (!author_occurances.hasOwnProperty(blog.author)){
            author_occurances[blog.author] = blog.likes 
        } else {
            author_occurances[blog.author] = author_occurances[blog.author] + blog.likes 
        }
    }

    const values = Object.values(author_occurances)
    const value = Math.max(...values)
    const most_author = Object.keys(author_occurances).find(key => author_occurances[key] === value)

    return ({
        author: most_author,
        likes: value
    })
}




module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}