const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const port = 3000

//connect mongoose database
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/url', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

// include mongoose models
const Url = require('./models/url')

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// routers
app.get('/', (req, res) => {
  res.render('index')
})


app.post('/', (req, res) => {
  const longUrl = req.body.longUrl
  const newUrl = new Url({
    longUrl: longUrl,
    shortUrl: ""
  })
  const shortUrl = newUrl._id.toString().slice(-5)
  newUrl.shortUrl = shortUrl

  newUrl.save((err) => {
    if (err) return console.log(err)

    console.log('the new URL is added')
    //flash: 短網址產生結果
    res.redirect('/')
  })
})

app.get('/:shortUrl', (req, res) => {
  Url.findOne({ shortUrl: req.params.shortUrl }, (err, url) => {
    if (err) throw err

    if (url) {
      res.redirect(url.longUrl)
    } else {
      //flash: 短網誌有誤
      res.redirect('/')
    }
  })
})

app.listen(port, () => {
  console.log('App is running')
})