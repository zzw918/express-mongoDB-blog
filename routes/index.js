var express = require("express");
// 引入crypto是为了在保存用户密码的时候能够加密。使用md5的方式。
var crypto = require("crypto");
var User = require('../models/user'),
    Post = require('../models/post');
var checkLogin = require('../middlewares/check').checkLogin;
var checkNotLogin = require('../middlewares/check').checkNotLogin;
var router = express.Router();

// 主页路由
router.get('/', function (req, res) {
  // 判断是否是第一页， 把请求的页数转化为number类型
  var page = parseInt(req.query.p) || 1;

  // 查询并返回page页的十篇文章
  Post.getTen(null, page, function (err, posts, total) {
    if (err) {
      // flash('error', err);
      // 显然这里不能在flash了，flash伴随着重定向啊，本来就在首页了，还能定向到哪里去呢？？　
      post = [];
      console.log(err);
    }
    res.render('index', {
      title: '主页',
      posts: posts,
      page: page,
      isFirstPage: (page - 1) == 0,
      isLastPage: ((page - 1) * 10 + posts.length) == total,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  // res.render('index', {
  //   title: "主页",
  //   user: req.session.user
  // });
});

// get注册页路由
router.get('/register', function (req, res) {
  res.render('register', {
    title: "注册",
    user: req.session.user
  });
});

router.post('/register', function (req, res) {
  var name = req.body.name;
  var password = req.body.password;
  var passwordAgain = req.body['password-repeat'];
  if (password !== passwordAgain) {
    req.flash('error', "注册失败！");
    return res.redirect('/register');
  } 

  // 之前犯了错误 --- 不能只验证了密码就说注册成功啊， 因为后面还要判断数据库中是否存在，然后反馈。 
  /*else {
    req.flash("success", "注册成功! 现在就登录吧~");
    res.redirect('/login');
  }*/

  // 用于加密用户的密码，然后再存储。 加密方式：md5
  // 创建一个用户
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name: name,
    password: password,
    email: req.body.email
  });

  // 查询这个用户是否存在于数据库，如果不存在，就插入数据库
  // User.get() 方法是一个在数据库查询是否有这个用户的方法
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', "用户已经存在！");
      return res.redirect('/register');
    }
    // 如果不存在，那么就将该用户存入数据库
    newUser.save(function (err, user) {
      if (err) {
        // 注意： 这一类都是不可预知的错误，所以使用err，而不是具体的字符串。
        req.flash('error', err);
        res.redirect('/reg');
      }
      // 下面是非常关键的一步：
      // 显然 session 只会在这个session期间存在，并没有存入数据库
      req.session.user = newUser;
      console.log(req.session.user);
      req.flash('success', "注册成功！");
      res.redirect('/');
    });
  });


});



// get登录页路由
// 使用middlewares中间件，当检测到已经登录了时候，就不允许再次登录了。
router.get('/login', checkNotLogin, function (req, res) {
  res.render('login', {
    title: "登录",
    user: req.session.user
  });
});

// post登录页路由
router.post('/login', checkNotLogin, function (req, res) {
  var name = req.body.name;
  var md5 = crypto.createHash("md5");
  var password = md5.update(req.body.password).digest('hex');

  User.get(name, function (err, user) {
    if (err) {
      req.flash('error', 'Error, something happened');
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('error', '用户未注册');
      return res.redirect('/');
    }
    if (password !== user.password) {
      req.flash('error', "密码错误！");
      return res.redirect('/register');
    }
    req.session.user = user;
    console.log(req.session.user);
    req.flash('success', '登录成功！');
    res.redirect('/');
  });
});

// get 发表路由
// 这里使用 middlewares 中间件下的check.js， 如果检测到没有登录，就redirect到登录页面。
router.get('/post', checkLogin, function (req, res) {
  res.render('post', {
    title: "发表文章"
  });
})

router.post('/post', checkLogin, function (req, res) {
  var curUser = req.session.user,
      tags = [req.body.tag1,req.body.tag2,req.body.tag3],
      post = new Post(curUser.name, curUser.head, req.body.title, tags, req.body.post);
  post.save(function (err) {
    if (err) {
      req.flash('error', err);
      console.log("文章成功失败");
      return res.redirect('/post');
    }
    console.log("文章成功存储");
    res.redirect('/');
  });
});


// get 登出路由
router.get('/logout', function (req, res) {
  req.session.user = null;
  res.redirect('/');
});

module.exports = router;


