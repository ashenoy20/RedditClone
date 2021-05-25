const Joi = require('joi')

module.exports.subredditSchema = Joi.object({
    subreddit: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
})


module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
})

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        description: Joi.string().required(),
    }).required()
})