const express = require('express')
const Subreddit = require('../models/subreddit')
const Comment = require('../models/comments')
const catchAsyncError = require('../utils/catchAsyncError')
const { subredditSchema } = require('../validatorSchema')
const ExpressError = require('../utils/ExpressError')
const {isAuth} = require('../utils/isAuth')
const multer = require('multer')
const {cloudinary, storage} = require('../cloudinary')
const upload = multer({storage})


const router = express.Router()

const validSubreddit = (req, res, next) => {
    const { error } = subredditSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

router.get('/', catchAsyncError(async (req, res) => {
    const allSubreddits = await Subreddit.find({})
    res.render('subreddits/index', { allSubreddits })
}))

router.get('/new', isAuth, (req, res) => {
    res.render('subreddits/new')
})



router.post('/', isAuth, upload.single('image'), validSubreddit, catchAsyncError(async (req, res) => {
    const subreddit = new Subreddit(req.body.subreddit)
    subreddit.image.url = req.file.path
    subreddit.image.fileName = req.file.filename
    subreddit.user = req.session.user
    await subreddit.save()
    req.flash('success', 'New subreddit created!')
    res.redirect('/subreddits')
}))


router.get('/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params
    const subreddit = await Subreddit.findById(id).populate({
        path: 'posts',
        populate: {
            path: 'user',
            model: 'User'
        }
    }).populate('user')
    res.render('subreddits/show', { subreddit })
}))

router.get('/:id/edit', isAuth, catchAsyncError(async (req, res) => {
    const { id } = req.params
    const subreddit = await Subreddit.findById(id)
    res.render('subreddits/edit', { subreddit })
}))


router.put('/:id', isAuth, upload.single('image'), validSubreddit, catchAsyncError(async (req, res) => {
    const { id } = req.params
    const campground = await Subreddit.findByIdAndUpdate(id, {...req.body.subreddit})
    if(req.file){
        campground.image.url = req.file.path
        cloudinary.uploader.destroy(campground.image.fileName)
        campground.image.fileName = req.file.filename
        await campground.save()
    }
    req.flash('success', 'Subreddit updated!')
    res.redirect(`/subreddits/${id}`)
}))

router.delete('/:id', isAuth, catchAsyncError(async (req, res) => {
    const { id } = req.params
    const subreddit = await Subreddit.findById(id).populate('posts')
    for(let i of subreddit.posts){
        await Comment.deleteMany({
            _id: {
                $in: i.comments
            }
        })
    }
    cloudinary.uploader.destroy(subreddit.image.fileName)
    await Subreddit.findByIdAndDelete(id)
    req.flash('success', 'Subreddit deleted!')
    res.redirect('/subreddits')
}))

module.exports = router
