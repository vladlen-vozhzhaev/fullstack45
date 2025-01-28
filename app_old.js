const http = require("http")
const fs = require('fs')

http.createServer((request, response)=>{
    console.log(request.url)
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    if (request.url === '/'){
        fs.readFile("index_old.html", (err, data)=>{
            response.end(data);
        })
    }else if (request.url === "/contact-us"){
        fs.readFile("contact-us.html", (err, data)=>{
            response.end(data);
        })
    }else if (request.url === "/handler-form"){
        let body = "";
        request.on('data', chunk => {
            body += chunk.toString();
        })
        request.on('end', ()=>{
            console.log(body);
            let data = body.split('&');
            console.log(data);
            console.log(data[0].split('=')[0], data[0].split('=')[1])
            console.log(data[1].split('=')[0], data[1].split('=')[1])
            response.end('Форма успешно отправлена')
        })
    }
    else {
        response.end("404");
    }
}).listen(3000, "127.0.0.1", function (){
    console.log("Сервер запущен!");
})