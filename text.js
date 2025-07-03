const http=require('http');
const fs=require("fs");
const  port=process.env.PORT || 3000;

http.createServer((req,res)=>{

    if (req.method==="GET"){
    if(req.url==='/read'){
        fs.readFile("data.txt","utf-8",(err,data)=>{
            if(err){
                res.writeHead(500,{'Content-Type':"text/plain"})
                res.end("error reading this file")
            }
            else{
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(data);
            }

        })
    }else if(req.url==="/write"){
        fs.writeFile("data.txt","helo from monkeyNation",(err)=>{
            if(err){
                res.writeHead(500,{'Content-Type':"text/plain"})
                res.end("error in text  updating process");
            }
            else{
                res.writeHead(200,{'Content-Type':"text/plain"});
                res.end("succesfullty updated data.txt");
            }
        })
    }
    else{
        res.writeHead(404,{"Content-Type":"text/plain"});
        res.end("error with the url")
    }}
    else if(req.method==="POST"){
      

    }
}).listen(port,()=>{
    console.log(`Server is listening on http://localhost:${port}.`);
});
