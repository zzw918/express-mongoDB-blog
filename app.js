var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var route = require('./routes/index.js');
// 注意：express-session是处理session的模块，而connect-flah是通知消息的模块，且必须依赖于epress-session,单独引入connect-flash是没有用的。
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var flash = require("connect-flash");

// 引入settings是为了在使用session和flash的时候使用的。
var settings = require("./setting");

// var cookieParser = require('cookie-parser');

var app = express();
// module.exports放在这里是希望可以看的更清楚一些。
module.exports =  app;


// 使用使用了body-parser模块，才能通过 req.body 接受到post表单里的内容。
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//使用public文件夹下的文件，必须要使用的内置中间件express.static 
app.use(express.static('public'));

// 下面的设置都是为了使用flash的。 flash依赖于session。
app.use(session({
  secret: settings.cookieSecret, // 加密
  key: settings.db, //cookie
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, // 30天
  resave: false,
  saveUninitialized: true,
   store: new MongoStore({
      // db: settings.db,
      host: settings.host,
      port: settings.port,
      url: 'mongodb://localhost/blog'
    })
}));
app.use(flash());
// set flash 这样就可以在ejs中使用了
app.use(function (req, res, next) {
  // 这里设置的locals下的对象在哪里都可以使用
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  // 如果使用回调函数式的中间件，必须要next()，否则生产线不会继续进而卡死在这里
  next();
});


// 设置模板路径和引擎，这里用到了path的方法，所以之前要引入path.join()模块
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 模块加载顺序非常重要，只有route依赖的一些模块加载完了之后，才能使用app.use("/", route)
app.use('/', route);

app.use(function (req, res, next) {
  res.render('404');
  // next();
  // 404页面是找不到页面的情况下出现的，所以不需要next的
  // 值得注意的是： 在顺序方面一定是404在路由的最后面，并且路由也十分靠后，只有这样，才能实用前面的东西。
});
