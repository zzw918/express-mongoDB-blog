/*
* 此模块用于处理User相关的数据，包括存储用户信息等。
*
*/
var mongodb = require("./db");
var crypto = require("crypto");

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;


User.prototype.save = function (callback) {
  var md5 = crypto.createHash('md5'),
      email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
      head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';

  // 创建user对象，用于插入数据库
  var user = {
    name: this.name,
    password:this.password,
    email: this.email,
    head: head,
    collections: []
  };

  // 打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }

    // 读取users集合
    db.collection('users', function (err, collection) {
      if (err) {
      //显然是先关掉数据库，然后在返回错误。 如果先返回错误，那么函数就不会往下执行了，数据库就不会关掉了。
       mongodb.close();
       return callback(err);
      }
      collection.insert(user, {
        safe:true
      }, function (err, user) {
        // 这一步一定是要关掉数据库的，因为数据已经插入了，暂时不会在使用数据库。
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};

User.get = function (name, callback) {
  mongodb.open(function (err, db) {
    // 在打开数据库的过程中，如果出现了错误，就将错误闯出去，这样，在调用方法的时候，就知道该如何处理了。
    if (err) {
      mongodb.close();
      return callback("打开数据库错误");
    }
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        name: name
      }, function (err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};
