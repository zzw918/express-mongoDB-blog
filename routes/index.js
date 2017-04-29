var express = require("express");
// 引入crypto是为了在保存用户密码的时候能够加密。使用md5的方式。
var crypto = require("crypto");
var User = require('../models/user');
var router = express.Router();

// 主页路由
router.get('/', function (req, res) {
  res.render('index', {
    title: "主页",
    user: req.session.user
  });
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
router.get('/login', function (req, res) {
  res.render('login', {
    title: "登录",
    user: req.session.user
  });
});

// post登录页路由
router.post('/login', function (req, res) {
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
router.get('/post', function (req, res) {
  res.render('post', {
    title: "发表文章"
  });
})


module.exports = router;