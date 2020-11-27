const mysql = require('mysql');
module.exports = {
    //数据库配置
    config: {
        host: '47.94.23.200',
        port: '3306',
        user: 'zrq',
        password: 'ZRQhappy1314.',
        database: 'zrq',
    },
    //链接数据库，使用mysql的连接池连接方式
    //连接池对象
    sqlConnect: function (sql, sqlArr, callBack) {
        var pool = mysql.createPool(this.config);
        pool.getConnection((err, conn) => {
            console.log("数据库读取成功")
            if (err) {
                console.log(err);
                return;
            }
            //事件驱动回调
            conn.query(sql, sqlArr, callBack);
            conn.release();
        })
    }
}