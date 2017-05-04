var mongodb = require('./db');

function Comment(name, day, title, comment) {
  this.name = name;
  this.day = day;
  this.title = title;
  this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function (callback) {
  var name = this.name,
      day = this.day,
      title = this.title,
      comment = this.comment;
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
        title: title,
        name: name,
        "time.day": day
      }, {
        $push: {"comments": comment}
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err.toString());
        }
        callback(null);
      });
    });
  });
}