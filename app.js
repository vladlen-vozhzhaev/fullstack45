const express = require('express')
const mysql = require('mysql2');
const { engine } = require('express-handlebars');
const multer  = require('multer')
const { parse } = require('node-html-parser');
const upload = multer()
const uuid = require('uuid-v4');
const app = express();
const fs = require('fs');
//const urlencodedParser = express.urlencoded({extended: false});
const bodyParser = require('body-parser')
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const hbs = engine({
    // Specify helpers which are only registered on this instance.
    helpers: {
        subStr() { return ''; },
    }
});


const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'fullstack43'
})

function connectDB(){
    connection.connect(err => {
        if (err){
            console.log("Ошибка подключения", err);
        }else {
            console.log("Успешно подключено к БД");
        }
    })
    return connection;

}

function updateDB(sql, params, callback){ // Что-то меняет в бд
    connectDB().query(sql, params, callback);
}

function query(){ // Что-то читает из бд
    connectDB();
}



app.use(express.static("public"))
app.get("/", (req, res)=> {

    connection.connect(err => {
        if (err) {
            console.log("Ошибка подключения", err);
        } else {
            console.log("Успешно подключено к БД");
        }
    })
    connection.query(`SELECT * FROM articles`, (err, result) => {
        res.render('home', {result, helpers: {
                subStr(str) { return str.substring(0, 90) + "..."; }
            }});
    })
});
app.get("/post/:id", (req, res)=>{
    connection.connect(err => {
        if (err) {
            console.log("Ошибка подключения", err);
        } else {
            console.log("Успешно подключено к БД");
        }
    })
    connection.query(`SELECT * FROM articles WHERE id = '${req.params.id}'`, (err, result) => {
        result = result[0];
        res.render('post', {result});
    })
})
app.get("/addArticle", (req, res)=>{
    res.render("addArticle");
})
app.get("/contact-us", (req, res)=>{
    res.send("Контакты");
})
app.get('/shop/:categoryId/:productId', (req, res)=>{
    const html = `Категория - ${req.params.categoryId}\nТовар - ${req.params.productId}`;
    res.send(html);
});
app.post("/handler-form", urlencodedParser, (req, res)=>{
  console.log(req.body);
  res.send("Форма успешно отправлена")
})
app.post("/addArticle", upload.any(), (req, res)=>{
    const html = parse(req.body.content); // Превратили контент в HTML код
    const img = html.getElementsByTagName('img')[0]; // Нашли там картинку
    const meta = (img.getAttribute("src").split(',')[0]); // Взяли метаданные о картинке
    const extension = meta.split('/')[1].split(';')[0]; // Из метаданных вытащили формат файла
    const base64 = img.getAttribute("src").split(',')[1]; // Взяли саму картину в BASE64
    const path = `/img/${uuid()}.${extension}`; // Указали, что картинка будет в папке img и у неё будет уникальное название
    fs.writeFile(`public${path}`, base64, 'base64', err => { // Записываем файл
        if (err) { // Если ошибка при записи файла
            console.error(err);
        } else { // Если файл записался
            img.setAttribute('src', path); // Меняем атрибут src картинки на ссылку к файлу
            const content = html.innerHTML; // Записываем получившийся HTML (с изменённой картинкой)
            // Записываем статью в базу данных!
            updateDB(
                "INSERT INTO articles (title, content, author) VALUES (?,?,?)",
                [req.body.title, content, req.body.author],
                ()=>{
                    res.send("Ура! Статья добавлена!");
                }
            )
        }
    });
})

app.listen(3000);