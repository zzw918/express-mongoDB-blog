/*
* 此模块用于处理post相关的数据，包括存储文章等。
*
*/
var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(name, head, title, tags, post) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.tags = tags;
  this.post = post;
}

module.exports = Post;

// 存储一篇文章及相关信息
Post.prototype.save = function (callback) {
  var date = new Date();
  
  // 存储各种时间格式，方便以后扩展
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + "-" + (date.getMonth() + 1),
    day: date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  };
  
  // 要存入数据库的文档 --- 可以看到在存储用户信息和这个是一样的，都需要经历这一步，因为创建实例是在controller哪里做的，
  // 所以这里要使用 this 来引用实例，以获取数据库文档。
  // comment是指评论，后面会用到，另外pv是指page view,访问量的意思，需要记录。
  var post = {
    name: this.name,
    head: this.head,
    // 因为time就是在上面定义
    time: time,
    title: this.title,
    tags: this.tags,
    // post就是指用户输入的content
    post: this.post,
    comment: [],
    pv: 0
  };

  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    // 读取posts集合
    db.collection('posts', function (err, collection) {
      if (err) {
        // req.flash('error', err);
        // 这不是胡写吗！  这里哪有什么req呢？ 这里是为了将错误传递给回调函数，供router中使用
        mongodb.close();
        return callback(err);
      }
      // 将文档插入post集合
      collection.insert(post, {
        safe: true
      },function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        // 即在实际使用这个函数中，回调函数到底有什么我们是不知道的，所以最后就算没有错，也要去调用回调函数
        callback(null);
      });
    });
  });

}

Post.getTen = function (name, page, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err.toString());
    }
    console.log("1");
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err.toString());
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.count(query, function (err, total) {
      // 这里的count的目的仅仅是为了得到total而已。
        // 根据query查询一共有多少post，然后跳过page - 1 乘以 10 篇的post, 取接下来的10篇。
        collection.find(query, {
          skip: (page - 1) * 10,
          limit: 10
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if (err) {
            callback(err.toString());
          }
          // 显然，这里传出去的是docs，这样才能从回掉函数中获取到docs
          callback(null, docs, total);
          // 可以获取到文档
          // console.log(docs[2].post);
        });
      });
    });
  });
}
