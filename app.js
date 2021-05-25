if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const path = require('path')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const passportLocal = require('passport-local')
const {isAuth} = require('./utils/isAuth')
const MongoDBStore = require("connect-mongo")

const subredditRoutes = require('./routes/subreddits')
const postRoutes = require('./routes/posts')
const authRoutes = require('./routes/user')
const commentRoutes = require('./routes/comments')

const User = require('./models/user')

const db_url = process.env.DB_URL

const app = express()

mongoose.connect('mongodb://localhost:27017/reddit-clone', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


const sessionConfig = {
    name: 'reddit_cookie',
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
       // secure: true,
        //Expires in a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    resave: false,
    store: MongoDBStore.create({
        mongoUrl: db_url,
        secret: 'secret',
        touchAfter: 24 * 60 * 60
    }).on('error', () => {
        console.log("ERROR")
    })
}  

app.use(session(sessionConfig))
app.use(flash())


app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next) => {
    res.locals.user = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res, next) => {
    res.render('home')
})

app.get('/profile', isAuth, (req, res) => {
    res.render('profile')
})



app.use('/subreddits/:id/posts/:Postid', commentRoutes)

app.use('/subreddits/:id/posts', postRoutes)

app.use('/subreddits', subredditRoutes)

app.use('/', authRoutes)

app.use('*', (req, res, next) => {
    next(new ExpressError('Web page not found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No POGCHAMP, Something Went Vewy Wong'
    if(statusCode != 404) req.flash('error', err.message)
    res.status(statusCode).render('layouts/error', {err})
})



// Port Listener
app.listen(8080, () => {
    console.log('LISTENING ON PORT 8080')
})


