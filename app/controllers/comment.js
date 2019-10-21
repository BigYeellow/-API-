const Comment = require('../models/comments')


class CommentCtl {
    async find(ctx) {
        const q = new RegExp(ctx.query.q)
        const { rootCommentId } = ctx.query
        const { questionId, answerId } = ctx.params
        // const question = await Question.find({ $or: [{title: q}, {description: q}] })
        const comment = await Comment.find({content: q, questionId, answerId, rootCommentId}).populate('commentator')
        ctx.body = comment
    }

    async findById(ctx) {
        // const { fields= '' } = ctx.query
        //+description +questioner注意字段之间一定要有空格,所以join(' ')而不是join('')
        // const selectStr = fields.split(';').filter(f => f).map(f => '+' + f).join(' ')
        // console.log(selectStr)
        //类型为id引用的字段加了populate会无视select，直接显示
        //populate只会显示当前模板下的具体数据
        const comment = await Comment.findById(ctx.params.id).populate('commentator')
        ctx.body = comment
    }
    async create(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true
            },
            rootCommentId: {
                type: 'string',
                required: false
            },
            replyTo: {
                type: 'string',
                required: false
            }
        })
        //...:把数组展开成用逗号隔离的序列
        const commentator = ctx.state.user._id
        const questionId = ctx.params.questionId
        const answerId = ctx.params.answerId
        const comment = await new Comment({...ctx.request.body, commentator, questionId, answerId}).save()
        ctx.body = comment
    }
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id)
        if(!comment) {
            ctx.throw(404, '评论不存在~')
        }else if(comment.questionId !== ctx.params.questionId ) {
            //只在路由中有questionId和answerId才进行判断
            ctx.throw(404, '该问题下不存在该答案~')
        }else if(comment.answerId !== ctx.params.answerId) {
            ctx.throw(404, '该答案下不存在该评论~')
        }else{
            ctx.state.comment = comment
            await next()
        }
    }
    async update(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true
            },
        })
        const { content } = ctx.request.body
        await ctx.state.comment.update({ content })
        ctx.body = ctx.state.comment
    }
    async delete(ctx) {
        const comment = await Comment.findByIdAndDelete(ctx.params.id)
        ctx.body = comment
        ctx.status = 204

    }
    //检查操作问题的是不是回答者
    async checkCommentator(ctx, next) {
        const comment = ctx.state.comment
        //引用中的值不是指针，而是被引用的实体值
        if( comment.commentator._id.toString() !== ctx.state.user._id ) {
            ctx.throw(403, '没有权限~')
        }else {
            await next()
        }
    }


}

module.exports = new CommentCtl()