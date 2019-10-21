const Router = require('koa-router')
const router = new Router({prefix: '/topics'})
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete:del, listTopicFollower, checkTopicExist, listQuestion } = require('../controllers/topic')


//koa-jwt的认证

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id',checkTopicExist, findById)
router.patch('/:id', auth, checkTopicExist, update)
router.post('/', auth, create)
router.delete('/:id',auth, checkTopicExist, del)
router.get('/:id/follower', checkTopicExist, listTopicFollower)
router.get('/:id/question', checkTopicExist, listQuestion)




module.exports = router
