module.exports = {
    cookieSecret: 'myblog', 
    db: 'blog',
    host: 'localhost',
    port: 27017
};
// 此模块会在app.js中使用： 设置session, for flash
// 还会在设置数据库中使用。  
// 也就是说这里的setting是全局的setting、掌管session、cookie和数据库