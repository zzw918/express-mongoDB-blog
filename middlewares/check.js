// 用于检测是否登录。 如果没有已经登录，那么就提示未登录，并转到登录界面； 如果已经登录，就返回到上一页面。
// 并通过next()交出控制权。
module.exports = {
  checkLogin: function checkLogin(req, res, next) {
                if (!req.session.user) {
                  req.flash('error', '未登录');
                  res.redirect('/login');
                }
                next();
              },

  checkNotLogin:  function checkNotLogin(req, res, next) {
                    if (req.session.user) {
                      req.flash('已登录');
                      // back即表示返回到上一页面
                      res.redirect('back');
                    }
                    next();
                  }
};

