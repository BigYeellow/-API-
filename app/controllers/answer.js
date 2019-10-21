const Answer = require('../models/answers')


class AnswerCtl {
    async find(ctx) {
        const q = new RegExp(ctx.query.q)
        // const question = await Question.find({ $or: [{title: q}, {description: q}] })
        const answer = await Answer.find({content: q, questionId: ctx.params.questionId}).populate('answerer')
        ctx.body = answer
    }

    async findById(ctx) {
        // const { fields= '' } = ctx.query
        //+description +questioner注意字段之间一定要有空格,所以join(' ')而不是join('')
        // const selectStr = fields.split(';').filter(f => f).map(f => '+' + f).join(' ')
        // console.log(selectStr)
        //类型为id引用的字段加了populate会无视select，直接显示
        //populate只会显示当前模板下的具体数据
        const answer = await Answer.findById(ctx.params.id)
        ctx.body = answer
    }
    async create(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true
            },
        })
        //...:把数组展开成用逗号隔离的序列
        const answerer = ctx.state.user._id
        const questionId = ctx.params.questionId
        const answer = await new Answer({...ctx.request.body, answerer, questionId}).save()
        ctx.body = answer
    }
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id)
        if(!answer) {
            ctx.throw(404, '答案不存在~')
        }else if(ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
            //只在路由中有questionId中才进行判断(赞和踩路由中不检查)
            ctx.throw(404, '该问题下不存在该答案~')
        }else{
            ctx.state.answer = answer
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
        await ctx.state.answer.update(ctx.request.body)
        ctx.body = ctx.state.answer
    }
    async delete(ctx) {
        const answer = await Answer.findByIdAndDelete(ctx.params.id)
        ctx.body = answer
        ctx.status = 204

    }
    //检查操作问题的是不是回答者
    async checkAnswerer(ctx, next) {
        const answer = ctx.state.answer
        //引用中的值不是指针，而是被引用的实体值
        if( answer.answerer._id.toString() !== ctx.state.user._id ) {
            ctx.throw(403, '没有权限~')
        }else {
            await next()
        }
    }


}

module.exports = new AnswerCtl()