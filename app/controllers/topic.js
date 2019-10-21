const Topic = require('../models/topics')
const Question = require('../models/questions')


class TopicCtl {
    async find(ctx) {
        //分页逻辑
        // const { per_page = 3 } = ctx.query
        // const perPage = Math.max(per_page * 1, 1)
        // const page = Math.max(ctx.query.page * 1, 1) - 1
        // //模糊搜索
        // const topic = await Topic.find({name: new RegExp(ctx.query.q)}).limit(perPage).skip(page * per_page)
        const topic = await Topic.find()
        ctx.body = topic
    }
    
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map( f => '+' + f).join('')
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        ctx.body = topic
    }
    async create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            avatarUrl: {
                type: 'string',
                required: false
            },
            introduction: {
                type: 'string',
                required: false
            }
        })
        const { name } = ctx.request.body
        const repeatedTopic = await Topic.findOne({ name })
        if(repeatedTopic) {
            ctx.throw(409, '话题已存在~')
        }else {
            const topic = await new Topic(ctx.request.body).save()
            ctx.body = topic
        }

    }
    async update(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: false
            },
            avatarUrl: {
                type: 'string',
                required: false
            },
            introduction: {
                type: 'string',
                required: false
            }
        })
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = topic
    }
    async delete(ctx) {
        const topic = await Topic.findByIdAndDelete(ctx.params.id)
        ctx.body = topic
        if(!topic) {
            ctx.throw(404, '话题不存在~')
        }
        ctx.status = 204
    }
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id)
        if(!topic) {
            ctx.throw(404, '话题不存在~')
        }else{
            await next()
        }
    }
    async listTopicFollower(ctx) {
        //find:获取所有User列表，条件：这些用户的关注里包含李雷
        const user = await User.find({ followingTopics: ctx.params.id })
        ctx.body = user
    }
    async listQuestion(ctx) {
        const question = await Question.find({topic: ctx.params.id})
        if(!question) {
            ctx.throw(404, '该话题下暂时没有问题哦')
        }else {
            ctx.body = question
        }
    }


}

module.exports = new TopicCtl()