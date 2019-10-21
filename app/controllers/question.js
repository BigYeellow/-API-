const Question = require('../models/questions')


class QuestionCtl {
    async find(ctx) {
        // const q = new RegExp(ctx.query.q)
        // const question = await Question.find({ $or: [{title: q}, {description: q}] })
        const question = await Question.find()
        ctx.body = question
    }

    async findById(ctx) {
        const { fields= '' } = ctx.query
        //+description +questioner注意字段之间一定要有空格,所以join(' ')而不是join('')
        const selectStr = fields.split(';').filter(f => f).map(f => '+' + f).join('')
        // console.log(selectStr)
        //类型为id引用的字段加了populate会无视select，直接显示
        const question = await Question.findById(ctx.params.id).select(selectStr).populate('questioner topic')
        ctx.body = question
    }
    async create(ctx) {
        ctx.verifyParams({
            title: {
                type: 'string',
                required: true
            },
            description: {
                type: 'string',
                required: false
            }
        })
        //...:把数组展开成用逗号隔离的序列
        const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save()
        ctx.body = question
    }
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+quesioner').populate('questioner')
        if(!question) {
            ctx.throw(404, '问题不存在~')
        }else{
            ctx.state.question = question
            await next()
        }
    }
    async update(ctx) {
        ctx.verifyParams({
            title: {
                type: 'string',
                required: true
            },
            description: {
                type: 'string',
                required: false
            }
        })
        await ctx.state.question.update(ctx.request.body)
        ctx.body = ctx.state.question
    }
    async delete(ctx) {
        const question = await Question.findByIdAndDelete(ctx.params.id)
        ctx.body = question
        ctx.status = 204

    }
    //检查操作问题的是不是提问者
    async checkQuestioner(ctx, next) {
        const { question } = ctx.state
        //引用中的值不是指针，而是被引用的实体值
        if( question.questioner._id.toString() !== ctx.state.user._id ) {
            ctx.throw(403, '没有权限~')
        }else {
            await next()
        }
    }


}

module.exports = new QuestionCtl()