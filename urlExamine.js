const Url = require('./models/url')

const urlExamine = async longUrl => {
  try {
    const shortUrl = getRandomDigit(5)
    const checkUrl = await urlAvailable(shortUrl)
    while (checkUrl === false) {
      urlExamine(longUrl)
    }
    await addUrl(longUrl, shortUrl)
    return shortUrl
  } catch (error) {
    console.log(error)
  }
}

//check duplicate - return true/false
const urlAvailable = shortUrl => {
  return new Promise((resolve, reject) => {
    Url.findOne({ shortUrl })
      .exec((err, url) => {
        if (err) reject(err)
        resolve(url ? false : true)
      })
  })
}

//create random short url
const getRandomDigit = digits => {
  let randomDigit = ''
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (i = 1; i <= digits; i++) {
    let randomNum = Math.floor(Math.random() * chars.length + 1)
    randomDigit += chars.charAt(randomNum)
  }
  return randomDigit
}

//add new url to db
const addUrl = (longUrl, shortUrl) => {
  return new Promise((resolve, reject) => {
    const newUrl = new Url({
      longUrl,
      shortUrl
    })
    newUrl.save((err) => {
      reject(err)
      resolve(shortUrl)
    })
  })
}

module.exports = urlExamine