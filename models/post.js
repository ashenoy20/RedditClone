const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Comments = require('./comments')

 
const postSchema = new Schema({
    title: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    description: String,
    image: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comments'
        }
    ]
})

postSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Comments.deleteMany({
            _id:{
                $in: doc.comments
            }
        })
    }
})


module.exports = mongoose.model('Posts', postSchema)