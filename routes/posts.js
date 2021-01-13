const express = require('express')
const Subreddit = require('../models/subreddit')
const catchAsyncError = require('../utils/catchAsyncError')
const Post = require('../models/post')
const { postSchema } = require('../validatorSchema')
const ExpressError = require('../utils/ExpressError')
const {isAuth} = require('../utils/isAuth')


const router = express.Router({mergeParams: true})

const validPost = (req, res, next) => {
    const { error } = postSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

router.get('/new', isAuth, (req, res) => {
    const { id } = req.params
    res.render('posts/new', {id})
})

router.get('/:Postid', catchAsyncError(async (req, res) => {
    const { id, Postid } = req.params
    const post = await Post.findById(Postid).populate({
        path: 'comments',
        populate: {
            path: 'user',
            model: 'User'
        }
    })
    res.render('posts/show', {post, id})
}))

router.post('/', isAuth, validPost, catchAsyncError(async (req, res) => {
    const { id } = req.params
    const subreddit = await Subreddit.findById(id)
    const post = new Post(req.body.post)
    post.user = req.session.user
    subreddit.posts.push(post);
    await post.save();
    await subreddit.save();
    req.flash('success', 'Post created!')
    res.redirect(`/subreddits/${id}`);
}))

router.get('/:Postid/edit', catchAsyncError(async (req, res) => {
    const { id, Postid } = req.params
    const post = await Post.findById(Postid)
    res.render('posts/edit', {id, post})
}))

router.put('/:Postid', isAuth, validPost, catchAsyncError(async (req, res) => {
    const { id, Postid } = req.params
    await Post.findByIdAndUpdate(Postid, {...req.body.post})
    req.flash('success', 'Post edited!')
    res.redirect(`/subreddits/${id}`)
}))

router.delete('/:Postid', isAuth, catchAsyncError(async (req, res) => {
    const { id, Postid } = req.params
    await Subreddit.findByIdAndUpdate(id, {$pull: {posts: Postid}})
    await Post.findByIdAndDelete(Postid)
    req.flash('success', 'Post deleted')
    res.redirect(`/subreddits/${id}`)
    
}))

module.exports = router
