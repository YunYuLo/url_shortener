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


app.post('/', (req, res) => {
  Url.findOne({ longUrl: req.body.longUrl })
    .exec((err, url) => {
      if (err) throw err
      let basicUrl = process.env.LOCAL_URL || 'http://localhost:3000/'

      if (url) {
        //url exist
        let shortUrl = basicUrl + url.shortUrl
        res.render('index', { shortUrl, longUrl: url.longUrl })
      } else {
        ; (async () => {
          try {
            //add new url to db
            let shortUrl = basicUrl + await urlExamine(req.body.longUrl)
            res.render('index', { shortUrl, longUrl: url.longUrl })
          } catch (e) {
            console.log(e)
          }
        })()
      }
    })
})

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