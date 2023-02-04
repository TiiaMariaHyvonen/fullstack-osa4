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



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}