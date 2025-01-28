const express = require('express')
const mysql = require('mysql2');
const { engine } = require('express-handlebars');
const app = express();
const urlencodedParser = express.urlencoded({extended: false});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

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
app.post("/addArticle", urlencodedParser, (req, res)=>{
    console.log(req.body);
    connection.connect(err => {
        if (err){
            console.log("Ошибка подключения", err);
        }else {
            console.log("Успешно подключено к БД");
        }
    })
    connection.query(`INcSERT INTO articles (title, content, author) VALUES ('${req.body.title}','${req.body.ontent}','${req.body.author}')`, (err)=>{
        console.log(err);
        res.send("Статья успешно добавлена!");
    });
})

app.listen(3000);