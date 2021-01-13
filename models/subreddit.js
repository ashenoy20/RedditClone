const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Posts = require('./post')
const Comment = require('./comments')


const subredditSchema = new Schema({
    title: String,
    description: String,
    image: String,
    user: {
        type: Schema.Types.ObjectId ,
        ref: 'User'
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Posts'
        }
    ]
})

subredditSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Posts.deleteMany({
            _id:{
                $in: doc.posts
            }
        })
        
    }
})

module.exports = mongoose.model('Subreddits', subredditSchema)
