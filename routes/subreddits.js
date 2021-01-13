const express = require('express')
const Subreddit = require('../models/subreddit')
const Post = require('../models/post')
const Comment = require('../models/comments')
const catchAsyncError = require('../utils/catchAsyncError')
const { subredditSchema } = require('../validatorSchema')
const ExpressError = require('../utils/ExpressError')
const {isAuth} = require('../utils/isAuth')


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

router.post('/', isAuth, validSubreddit, catchAsyncError(async (req, res) => {
    const subreddit = new Subreddit(req.body.subreddit)
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

router.get('/:id/edit', catchAsyncError(async (req, res) => {
    const { id } = req.params
    const subreddit = await Subreddit.findById(id)
    res.render('subreddits/edit', { subreddit })
}))


router.put('/:id', isAuth, validSubreddit, catchAsyncError(async (req, res) => {
    const { id } = req.params
    await Subreddit.findByIdAndUpdate(id, {...req.body.subreddit})
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
    await Subreddit.findByIdAndDelete(id)
    req.flash('success', 'Subreddit deleted!')
    res.redirect('/subreddits')
}))

module.exports = router
