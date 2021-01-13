const express = require('express')
const User = require('../models/user')
const catchAsyncError = require('../utils/catchAsyncError')
const passport = require('passport')
const router = express.Router()

router.get('/register', (req, res) => {
    res.render('auth/register')
})

router.post('/register', catchAsyncError(async (req, res) => {
    const {email, username, password} = req.body
    if(username.indexOf(' ') >= 0){
       return res.redirect('/register')
    }
    const newUser = new User({email, username})
    await User.register(newUser, password)
    req.login(newUser, () => {
       req.session.user = req.user
       res.redirect('/')
    })
    
}))

router.get('/login', (req, res) => {
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    res.render('auth/login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.session.user = req.user
    const url = req.session.requestURL || '/'
    delete req.session.requestURL
    res.redirect(url)
})

router.get('/logout', (req, res) => {
  if(req.isAuthenticated()){
    req.session.user = undefined
    req.logout()
  }
  res.redirect('/')     
})



module.exports = router