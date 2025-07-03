// server.js
const http = require('http');

http.createServer((req, res) => {
    console.log(req)
    const method = req.method;
    const url = req.url;
    
    if (method === "GET") {

        if (url === "/") {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end("home page");

        }
        if(url == "/home"){
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.write("welcome to alverqqq \n")
            res.end("this is home you bitch")
            
        }
    }

 
}).listen('443');


http.createServer((req, res) => {
    res.end("Server B");
}).listen(4000);


console.log("Start");

setTimeout(function(){
  console.log("This runs after 2 seconds.");
}, 2000);

console.log("End");