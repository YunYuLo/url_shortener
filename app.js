const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
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
app.use(express.static('public'))

// routers
app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log('App is running')
})