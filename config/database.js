mysqlConfig = {
    connectionLimit : 100, 
    host     : '13.124.26.102',
    user: "moadev",
    password: "Ectus!2#",
    // host     : 'localhost',
    // user: "root",
    // password: "123",
    port     : 3306,
    database : 'moa_platform',
    charset  : 'utf8'
};

// mySQL pool
let mysql = require('mysql2/promise');
let mysqlPool = mysql.createPool(mysqlConfig);

exports.mysqlPool = mysqlPool;
