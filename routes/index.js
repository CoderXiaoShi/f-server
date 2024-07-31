const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

console.log(
  'process.cwd(): ', process.cwd()
)



router.get('/delete', async (ctx) => {
  console.log('delete')
  // const curPath = path.join(process.cwd())
  console.log(ctx.query);

  if (fs.existsSync(ctx.query.path)) {
    // 文件
    fs.unlinkSync(ctx.query.path)
  }

  // ctx.redirect(ctx.query.redirect)
  ctx.body = {
    code: 0,
    msg: '删除成功'
  }

  // console.log('curPath: ', curPath);

  // await ctx.render('index', {
  //   title: 'Hello Koa 2!'
  // })
})

// router.get('/string', async (ctx, next) => {
//   ctx.body = 'koa2 string'
// })

// router.get('/json', async (ctx, next) => {
//   ctx.body = {
//     title: 'koa2 json'
//   }
// })

module.exports = router
