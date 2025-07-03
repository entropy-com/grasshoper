const http = require("http");

const port = 8000;

const pizzas = [];

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url == "/displaypizzas") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(pizzas));
    } else {
      res.writeHead(404);
      res.end("Not found.");
    }
  } else if (req.method === "POST") {
    if (req.url == "/addpizzas") {
      let body = '';
      req.on("data", chunk => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const newPizza = JSON.parse(body);
          pizzas.push(newPizza);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ "pizzas status": "success" }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ "pizza status": "error occurred" }));
        }
      });
    } else {
      res.writeHead(404);
      res.end("Not found.");
    }
  }
});

// Correct port
server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}.`);
});
