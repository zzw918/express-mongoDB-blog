// 对比其他几个model文件，形式基本一致！
// 思路：先在路由中获取到文章，然后在将该文章的所有信息、收藏人的信息新建为收藏，那么评论呢？ 也要收藏吗
var mongodb = require('./db');

function Collect(post, collector) {
  this.post = post;
  this.collector = collector;
}

module.exports = Collect;

Collect.prototype.save = function (callback) {
  var post = this.post;
  var collector = this.collector;
  mongodb.open(function (err, db) {
    console.log("成功daf ");
    if (err) {
      return callback(err);
    }
    callback(null);
  });
  // mongodb.open(function (err, db) {
  //   console.log("好好学习");
  //   if (err) {
  //     return callback(err.toString());
  //   }
  //   db.collection('collections', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err.toString());
  //     }
  //     collection.insert({
  //       collector: collector,
  //       post: post
  //     }, function (err) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err.toString());
  //       }
  //       callback(null);
  //     });
  //   });
  // });
}
