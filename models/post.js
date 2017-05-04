/*
* 此模块用于处理post相关的数据，包括存储文章等。
*
*/
var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(name, head, title, tags, post, ifIndex) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.tags = tags;
  this.post = post;
  this.ifIndex = ifIndex;
}

module.exports = Post;

// 这里需要使用this，所以才用prototype的。
// 存储一篇文章及相关信息
Post.prototype.save = function (callback) {
  var date = new Date();
  
  // 存储各种时间格式，方便以后扩展
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + "-" + (date.getMonth() + 1),
    day: date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + ((date.getMinutes() < 10)? ("0"+date.getMinutes()):(date.getMinutes()))
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
    comments: [],
    // 如果没选中发送到首页，ifIndex值为undefined，那么就设置为off
    ifIndex: this.ifIndex || "off",
    pv: 0,
    recommends: 0,
    notRecommends: 0
  };
  // 其中recommends是推荐数
  // 其中pv存储的是阅读量

  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    // 读取posts集合
    db.collection('posts', function (err, collection) {
      if (err) {
        // req.flash('error', err);
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

// 获取首页的10篇文章
Post.getTenIndex = function (name, page, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err.toString());
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err.toString());
      }
      collection.count({"ifIndex": "on"}, function (err, total) {
      // collection.count({}, function (err, total) {
            if (err) {
              mongodb.close();
              return callback(err.toString());
            }
            collection.find({
              // 这里只抓取发表到首页的文章，而不选择不发表到首页的文章
              ifIndex: "on"
            }, {
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
};

// 获取用户页的10篇文章
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
};

Post.getOne = function (name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err.toString());
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err.toString());
      }
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      },function (err, doc) {
        if (err) {
          mongodb.close();
          return callback(err.toString());
        }
        if (doc) {
          collection.update({
            "name": name,
            "time.day": day,
            "title": title
          }, {
            $inc: {
              "pv": 1
            }
          }, function (err) {
            mongodb.close();
            if (err) {
              return callback(err.toString());
            }
          });
          callback(null, doc);
        }
      });
    });

  });

}

Post.modify = function (editedPost, callback) {
// Post.modify = function (name, day, title,post, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      console.log("打开数据库失败！");
      return callback(err.toString());
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        console.log("打开posts失败！");
        mongodb.close();
        return callback(err.toString());
      }
      // 当这里更新有问题时，我们可以现在cmd中试。 可用，可以再条件中去掉几个，然后逐渐尝试。
      // 比如，我只是用title来修改，不用其他的。
      // 但是，这里添加day为什么出错？
      // 所以就可以去edit.ejs中找错误，事实证明，ejs出错！
      // 下面新添加了修改标签的方法： 删除所有的已有标签，全部替换为最新的标签，使用set和unset方法实现。
      collection.update({
        "name": editedPost.name,
        "title": editedPost.title,
        "time.day": editedPost.day
      }, {
        $set: {
          post: editedPost.post,
          ifIndex: editedPost.ifIndex
        },
        $unset: {
          "tags": 1
        }
      }, function (err) {
        if (err) {
          console.log("最终失败！");
          mongodb.close();
          return callback(err.toString());
        }
        collection.update({
          "name": editedPost.name,
          "title": editedPost.title,
          "time.day": editedPost.day
        }, {
          $set: {
            "tags": [editedPost.tag1, editedPost.tag2, editedPost.tag3]
          }
        }, function (err) {
          mongodb.close();
          if (err) {
            return callback(err.toString());
          } 
          callback(null);
        });
      });
    });
  });
}

Post.getAllUsers = function (callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    // 既然要查找所有的用户，当然要去users集合下寻找啊
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.find({}).toArray(function (err, users) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, users);
      });
    });
  });
}

// 删除文章路由
// 整个操作过程非常的清晰。
Post.remove = function (name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.deleteOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
}


// 添加评论
Post.addComment = function (name, day, title, comment, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err.toString());
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err.toString());
      }
      collection.update({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        $push: {"comments": comment}
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err.toString());
        }
        console.log("没有问题");
        callback(null);
      });
    });
  });
}




// 推荐路由
// 每个用户只能推荐一次
Post.recommend = function (name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err.toString());
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err.toString());
      }
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title      
      }, function (err, doc) {
          if ((doc.notRecommends >= 1) || (doc.recommends >= 1)) {
            console.log("已经推荐了！");
            mongodb.close();
            callback(null);
          } else {
            collection.update({
              "name": name,
              "time.day": day,
              "title": title
            }, {
              $inc: {recommends: 1}
            }, function (err) {
              mongodb.close();
              if (err) {
                return callback(err.toString());
              }
              callback(null);
            });
        }
      });
    });
  });
}

// 踩路由
// 每个用户只能不推荐一次
Post.notRecommend = function (name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err.toString());
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err.toString());
      }
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title      
      }, function (err, doc) {
          if ((doc.notRecommends >= 1) || (doc.recommends >= 1)) {
            mongodb.close();
            callback(null);
          } else {
            collection.update({
              "name": name,
              "time.day": day,
              "title": title
            }, {
              $inc: {notRecommends: 1}
            }, function (err) {
              mongodb.close();
              if (err) {
                return callback(err.toString());
              }
              callback(null);
            });
        }
      });
    });
  });
}


