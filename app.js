const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const port = 3000

const urlExamine = require('./urlExamine')

//connect mongoose database
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/url', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

// include mongoose models
const Url = require('./models/url')

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true
}))


app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(flash())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})

// routers
app.get('/', (req, res) => {
  res.render('index')
})

//create a short url
app.post('/', async (req, res) => {
  try {
    let url = await Url.findOne({ longUrl: req.body.longUrl }).exec()
    console.log(url)

    const basicUrl = `${req.get('origin')}/`

    if (url) {
      //url exist
      res.render('index', {
        shortUrl: basicUrl + url.shortUrl,
        longUrl: url.longUrl
      })
    } else {
      //add new url to db
      let shortId = await urlExamine()
      const newUrl = new Url({
        longUrl: req.body.longUrl,
        shortUrl: shortId
      })
      await newUrl.save()
      res.render('index', {
        shortUrl: basicUrl + shortId,
        longUrl: req.body.longUrl
      })
    }
  } catch (err) {
    req.flash('warning_msg', 'URL incorrect, Please check again!')
    res.redirect('/')
  }
})

//redirect short url to original page
app.get('/:shortUrl', (req, res) => {
  Url.findOne({ shortUrl: req.params.shortUrl }, (err, url) => {
    if (err) throw err

    if (url) {
      res.redirect(url.longUrl)
    } else {
      req.flash('warning_msg', 'Short URL incorrect!')
      res.redirect('/')
    }
  })
})

app.listen(process.env.PORT || port, () => {
  console.log('App is running')
})