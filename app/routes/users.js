const Router = require('koa-router')
const router = new Router({prefix: '/users'})
// const jwt = require('jsonwebtoken')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete:del,
        login, checkOwner, listFollowing, follow, unfollow,
        listFollower, checkUserExist, followTopic, listFollowingTopic, unfollowTopic, listQuestion,
        listLikingAnswers, likeAnswer, unLikeAnswer,
        listDisLikingAnswers, disLikeAnswer, unDisLikeAnswer,
        listCollectingAnswers, collectAnswer, unCollectAnswer} = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topic')
const { checkAnswerExist } = require('../controllers/answer')

//自己编写的认证
// const auth = async (ctx, next) => {
//     const { authorization = '' } = ctx.request.header
//     const token = authorization.replace('Bearer ', '')
//     try{
//         const user = jwt.verify(token, secret)
//         ctx.state.user = user
//         console.log(user)
//     }catch(error){
//         ctx.throw(401, error.message)
//     }
//     await next()
// }

//koa-jwt的认证

const auth = jwt({ secret })

router.get('/', find)

router.post('/', create)

router.get('/:id', findById)

router.patch('/:id', auth, checkOwner, update)

router.delete('/:id', auth, checkOwner, del)

router.post('/login', login)

router.get('/:id/following', listFollowing)

router.put('/following/:id', auth, checkUserExist, follow)

router.delete('/unfollowing/:id', auth, checkUserExist, unfollow)

router.get('/listFollower/:id', listFollower)

router.put('/followingTopic/:id', auth, checkTopicExist, followTopic)

router.delete('/followingTopic/:id', auth, checkTopicExist, unfollowTopic)

router.get('/followingTopic/:id', auth, listFollowingTopic)

router.get('/:id/question', listQuestion)

router.get('/:id/likingAnswer', auth, listLikingAnswers)

router.patch('/likingAnswer/:id', auth, checkAnswerExist, likeAnswer, unDisLikeAnswer)

router.delete('/unLikingAnswer/:id', auth, checkAnswerExist, unLikeAnswer)

router.get('/:id/disLikingAnswer', auth, listDisLikingAnswers)

router.patch('/disLikingAnswer/:id', auth, checkAnswerExist, disLikeAnswer, unLikeAnswer)

router.delete('/unDisLikingAnswer/:id', auth, checkAnswerExist, unDisLikeAnswer)

router.get('/:id/collectingAnswer', auth, listCollectingAnswers)

router.patch('/collectingAnswer/:id', auth, checkAnswerExist, collectAnswer)

router.delete('/collectingAnswer/:id', auth, checkAnswerExist, unCollectAnswer)



module.exports = router
