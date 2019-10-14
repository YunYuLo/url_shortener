const Url = require('./models/url')

const urlExamine = async () => {
  let shortUrl = ''
  do {
    shortUrl = getRandomDigit(5)
    const shortUrlExist = await Url.findOne({ shortUrl }).exec()

    if (!shortUrlExist) {
      return shortUrl
    }

  } while (shortUrlExist)

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


module.exports = urlExamine