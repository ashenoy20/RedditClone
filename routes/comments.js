const express = require('express')
const catchAsyncError = require('../utils/catchAsyncError')
const Post = require('../models/post')
const Comment = require('../models/comments')
const { commentSchema } = require('../validatorSchema')
const ExpressError = require('../utils/ExpressError')
const {isAuth} = require('../utils/isAuth')

const router = express.Router({mergeParams: true})


const validComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

router.post('/', isAuth, validComment, catchAsyncError(async (req, res) => {
    const { id , Postid } = req.params
    const post = await Post.findById(Postid)
    const comment = new Comment(req.body.comment)
    comment.user = req.session.user
    post.comments.push(comment)
    await post.save()
    await comment.save()
    res.redirect(`/subreddits/${id}/posts/${Postid}`)
}))

module.exports = router