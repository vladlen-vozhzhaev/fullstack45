const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'fullstack43'
})

connection.connect(err => {
    if (err){
        console.log("Ошибка подключения", err);
    }else {
        console.log("Успешно подключено к БД");
    }
})

connection.query("SELECT * FROM users", (err, result)=>{
    console.log(err);
    console.log(result);
});

connection.end();