const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const fs = require('fs')
const send = require('koa-send');
const path = require('path')
const mime = require('mime-types')


const index = require('./routes/index')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {

  // 设置允许的源，这里允许所有源
  ctx.set('Access-Control-Allow-Origin', '*');
  // 允许的请求方法
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 允许携带 Cookie 等凭证（如果需要）
  ctx.set('Access-Control-Allow-Credentials', 'true');

  if (ctx.method === 'OPTIONS') {
    // 对于 OPTIONS 预检请求，直接返回 204 No Content 响应
    ctx.status = 204;
    return;
  }

  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())

app.use(async (ctx, next) => {

  // if ('/' == ctx.path) return ctx.body = 'Try GET /package.json';
  // await send(ctx, ctx.path);
  // await send(ctx, '/stylesheets/bootstrap.css', { root: __dirname + '/public' });
  // await send(ctx, '/log/error.2023-01-03.log', { root: process.cwd() });
  // return;
  console.log('-------------------------')
  const curPath = path.join(
    process.cwd(),
    decodeURIComponent(ctx.url)
  )

  console.log('curPath: ', curPath);
  let fileList = [];
  /*
    ok - 路径不存在: 不处理
    ok - 是文件夹: 列出文件列表
    - 是文件: 前端处理
      图片: 循环浏览
      视频: 可以播放, 快进, 加速
      文本: 返回文本内容全文
      markdown: 渲染, 可以修改, 保存
  */
  console.log('文件是否存在: ', fs.existsSync(curPath))
  if (fs.existsSync(curPath)) {

    // 如果是文件
    const currStat = fs.statSync(curPath);

    if (!currStat.isDirectory()) {
      console.log('遇到了文件--------', curPath, ctx.url)
      const contentType = mime.lookup(curPath);
      ctx.response.set('Content-Type', contentType)
      ctx.response.set('Content-Length', currStat.size);
      ctx.response.set('Last-Modified', currStat.mtime.toUTCString());
      ctx.response.set('ETag', `${currStat.size}-${currStat.mtime.getTime()}`);
      ctx.response.set('Cache-Control', 'max-age=3600');

      ctx.status = 200
      ctx.body = fs.createReadStream(curPath);

      return;
    }

    // 如果是文件夹

    fileList = fs.readdirSync(curPath, {
      withFileTypes: true
    });
    fileList = fileList.map(f => {
      let name = ''
      // if (f.isDirectory()) {
      //   name = `<a href="${ctx.url !== '/' ? ctx.url : ''}/${f.name}">${f.name}</a>`;
      // } else {
      //   name = `<a href="${ctx.url !== '/' ? ctx.url : ''}/${f.name}">${f.name}</a>`;
      // }
      name = `<a href="${ctx.url !== '/' ? ctx.url : ''}/${f.name}">${f.name}</a>`;
      return {
        name: name,
        path: path.join(curPath, f.name),
        stat: f.isDirectory() ? 1 : 0,
      }
    })
    fileList = fileList.sort((n1, n2) => {
      return n2.stat - n1.stat
    })
  } else {
    console.log('文件不存在')
    ctx.status = 404;
    return;
  }

  let breadcrumb = []
  console.log('curPath: ', curPath);
  console.log('process.cwd(): ', process.cwd());
  if (curPath === process.cwd() + "/") {
    console.log(1)
    breadcrumb = [process.cwd()]
  } else {
    console.log(2)
    breadcrumb = curPath.replace(process.cwd(), '').split('/')
    breadcrumb.unshift(process.cwd());
  }

  breadcrumb = breadcrumb.filter(item => item !== '');
  console.log('breadcrumb 1: ', breadcrumb);

  breadcrumb = breadcrumb.map((item) => {
    let curPath = ''

    for (let i = 1; i < breadcrumb.length - 1; i++) {
      curPath += `/${breadcrumb[i]}`
      if (breadcrumb[i] === item) {
        break;
      }
    }
    return {
      path: item === process.cwd() ? '/' : curPath,
      name: item,
      isLast: breadcrumb[breadcrumb.length - 1] === item
    }
  })

  console.log('breadcrumb 2: ', breadcrumb);

  await ctx.render('index', {
    title: 'Hello Koa 2!',
    fileList,
    curPath,
    breadcrumb,
    rootPath: process.cwd()
  })
  await next()
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
