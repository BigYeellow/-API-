const Router = require('koa-router')
const router = new Router({prefix: '/questions'})
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete:del, checkQuestioner, checkQuestionExist  } = require('../controllers/question')


//koa-jwt的认证

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id',checkQuestionExist, findById)
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
router.post('/', auth, create)
router.delete('/:id',auth, checkQuestionExist, checkQuestioner, del)




module.exports = router
