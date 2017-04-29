var settings = require("../setting"),
    Db = require("mongodb").Db,
    Connection = require("mongodb").Connection,
    Server = require("mongodb").Server;
// 通过Db构造函数创建一个数据库，传入参数： 数据库名、开启指定主机端口的数据库服务器、设置为安全数据库
module.exports = new Db(settings.db, new Server(settings.host, settings.port), {safe: true});