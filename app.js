const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const port = 3000

const urlExamine = require('./urlExamine')

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
  //check the pattern of URL
  //...
  Url.findOne({ longUrl: req.body.longUrl })
    .exec((err, url) => {
      if (err) throw err
      let basicUrl = 'http://localhost:3000/'

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
      //flash: 短網誌有誤
      res.redirect('/')
    }
  })
})

app.listen(port, () => {
  console.log('App is running')
})