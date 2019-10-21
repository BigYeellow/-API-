const User = require('../models/users')
const Question = require('../models/questions')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')
const Answer = require('../models/answers')

class UsersCtl{
    async find(ctx) {
        //分页逻辑
        // const { per_page = 2 } = ctx.query
        // const perPage = Math.max(per_page * 1, 1)
        // const page = Math.max(ctx.query.page * 1, 1) - 1
        // ctx.body = await User.find().limit(perPage).skip(perPage * page)
        ctx.body = await User.find().populate('following locations business employments.company employments.job educations.school educations.major')
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectStr = fields.split(';').filter(f => f).map(f => ' +' + f).join(' ');
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if (f === 'employments') {
                return 'employments.company employments.job';
            }
            if (f === 'educations') {
                return 'educations.school educations.major';
            }
            return f;
        }).join(' ');
        const user = await User.findById(ctx.params.id).select(selectStr).populate(populateStr);
        if (!user) { ctx.throw(404, '用户不存在'); }
        ctx.body = user;
    }
    async create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            age: {
                type: 'number',
                required: false
            },
            password: {
                type: 'string',
                required: true
            }
        })
        const { name } = ctx.request.body
        const repeatedUser = await User.findOne({ name })
        if(repeatedUser) {
            ctx.throw(409, '用户已存在~')
        }
        const user = await new User(ctx.request.body).save()
        ctx.body = user 
    }
    async update(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            age: {
                type: 'number',
                required: false
            },
            password: {
                type: 'string',
                required: false
            },
            avatarUrl: {
                type: 'string',
                required: false
            },
            gender: {
                type: 'string',
                required: false
            },
            headline: {
                type: 'string'
            },
            locations: {
                type: 'array',
                itemType: 'string',
                required: false
            },
            bussiness: {
                type: 'string',
                required: false
            },
            employments: {
                type: 'array',
                itemType: 'object',
                required: false
            },
            educations: {
                type: 'array',
                itemType:'object',
                required: false
            }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        if(!user) {
            ctx.throw(404, '用户不存在~')
        }
        ctx.body = user
    }
    async delete(ctx) {
        const user = await User.findByIdAndDelete(ctx.params.id)
        if(!user) {
            ctx.throw(404, '用户不存在~')
        }
        ctx.status = 204
    }

    async login(ctx) {
        const { name, password} = ctx.request.body
        const user = await User.findOne({ name, password})
        const { _id } = user
        if(!user) {
            ctx.throw(401, '用户名或密码错误~')
        }
        const token = jwt.sign({_id, name}, secret, {expiresIn: '1d'})
        ctx.body = { token }
    }
    async checkOwner(ctx, next) {
        if(ctx.params.id !== ctx.state.user._id){
            ctx.throw(403, '没有权限~')
        }
        await next()
    }
    async listFollowing(ctx) {
        //populate: 显示出所有信息
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if (!user) { ctx.throw(404) }
        ctx.body = user.following
    }

    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id)
        if( !me.following.map(id => id.toString()).includes(ctx.params.id)){
            me.following.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }

    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id)

        if(!user) {
            ctx.throw('404', '用户不存在~')
        }

        await next()
    }

    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')

        const index = me.following.map(id => id).indexOf(ctx.params.id)

        if(index > -1){
            me.following.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    async listFollower(ctx) {
        //find:获取所有User列表，条件：这些用户的关注里包含李雷
        const user = await User.find({ following: ctx.params.id })

        ctx.body = user
    }
//    话题接口

    async listFollowingTopic(ctx) {
        //populate: 显示出所有信息
        const user = await User.findById(ctx.params.id).populate('followingTopics')
        if (!user) { ctx.throw(404) }
        ctx.body = user.followingTopics
    }

    async followTopic(ctx) {
        //关注除了bug
        const me = await User.findById(ctx.state.user._id)
        if( !me.followingTopics.map(id => id.toString()).includes(ctx.params.id)){
            me.followingTopics.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }
    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id)

        const index = me.followingTopics.map(id => id).indexOf(ctx.params.id)

        if(index > -1){
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
    async listQuestion(ctx) {
        const question = await Question.find({ questioner: ctx.params.id })
        ctx.body = question
    }
    //列出自己赞过的答案赞
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswer').populate('likingAnswer')
        if(!user) {
            ctx.throw(404, '该用户不存在')
        }else {
            ctx.body = user
        }
    }
    //喜欢一个答案
    async likeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswer').populate('likingAnswer')
        if(!me.likingAnswer.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswer.push(ctx.params.id)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: { voteCount: 1 }})
        }
        ctx.status = 204
        await next()
    }
    //取消喜欢一个答案
    async unLikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswer').populate('likingAnswer')
        const index = me.likingAnswer.map(item => item._id).indexOf(ctx.params.id)
        if(index > -1) {
            me.likingAnswer.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
    //列出不喜欢的答案
    async listDisLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+disLikingAnswer').populate('disLikingAnswer')
        if(!user) {
            ctx.throw(404, '该用户不存在')
        }else {
            ctx.body = user
        }
    }
    //不喜欢一个答案
    async disLikeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+disLikingAnswer').populate('disLikingAnswer')
        if(!me.disLikingAnswer.map(id => id.toString()).includes(ctx.params.id)) {
            me.disLikingAnswer.push(ctx.params.id)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: { voteCount: -1 }})
        }
        ctx.status = 204
        await next()
    }
    //取消不喜欢一个答案
    async unDisLikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+disLikingAnswer').populate('disLikingAnswer')
        const index = me.disLikingAnswer.map(item => item._id).indexOf(ctx.params.id)
        if(index > -1) {
            me.disLikingAnswer.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
    //列出收藏的答案
    async listCollectingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+collectingAnswer').populate('collectingAnswer')
        if(!user) {
            ctx.throw(404, '该用户不存在')
        }else {
            ctx.body = user
        }
    }
    //收藏答案
    async collectAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswer').populate('collectingAnswer')
        if(!me.collectingAnswer.map(id => id.toString()).includes(ctx.params.id)) {
            me.collectingAnswer.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }
    //取消收藏答案
    async unCollectAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswer').populate('collectingAnswer')
        const index = me.collectingAnswer.map(item => item._id).indexOf(ctx.params.id)
        if(index > -1) {
            me.collectingAnswer.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
}

module.exports = new UsersCtl()