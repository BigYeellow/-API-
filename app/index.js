const Koa = require('koa')
//接受post过来的资源，除了数据，还有文件，比koa-parser更好
const koaBody = require('koa-body')
const path = require('path')
const routing = require('./routes')
//检测错误
const error = require('koa-json-error')
//检查post过来的参数的正确性
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
//生成请求路径
const koaStatic = require('koa-static')
const { connectionStr } = require('./config')

mongoose.connect(connectionStr, { useNewUrlParser: true }, () => {
    console.log('MongoDB连接成功了好开心')
})

mongoose.connection.on('error', console.error)

const app = new Koa()

//直接映射到public目录下，不用写/public
app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? stack : {stack, ...rest}
}))
app.use(koaBody({
    //支持文件
    multipart: true,
    formidable: {
        //图片上传目录,两种都可以
        uploadDir: path.join(__dirname + '/public/uploads'),
        // uploadDir: './public/uploads',
        //保留扩展名
        keepExtensions: true
    }
}))

app.use(parameter(app))
routing(app)




app.listen(3000, () => {
    console.log('服务启动了!')
})