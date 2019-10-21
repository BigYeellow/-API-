const Router = require('koa-router')
const router = new Router({prefix: '/questions/:questionId/answers/:answerId/comment'})
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete:del, checkCommentator, checkCommentExist   } = require('../controllers/comment')


//koa-jwt的认证

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id',checkCommentExist, findById)
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)
router.post('/', auth, create)
router.delete('/:id',auth, checkCommentExist, checkCommentator, del)





module.exports = router
