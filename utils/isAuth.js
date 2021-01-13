module.exports.isAuth = (req, res, next) => {
    if(!req.isAuthenticated()){
       req.session.requestURL = req.originalUrl
       return res.redirect('/login')
    }
    next()
}