const Router = require('koa-router')
const router = new Router({prefix: '/questions/:questionId/answer'})
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete:del, checkAnswerer, checkAnswerExist   } = require('../controllers/answer')


//koa-jwt的认证

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id',checkAnswerExist, findById)
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)
router.post('/', auth, create)
router.delete('/:id',auth, checkAnswerExist, checkAnswerer, del)




module.exports = router
