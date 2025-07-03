const http = require("http");

const port = 8000;

const pizzas = [];

const server = http.createServer((req, res) => {
  if (req.url == "/pizzas") {
    
    if (req.method === "POST") {
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
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ "pizza status": "error occurred" }));
        }
      });
    }
    else if (req.method === "GET") {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`
        <h1>Add a Pizza</h1>
        <form id="pizzaForm">
          <input id="pizzaType" name="type" placeholder="Enter pizza flavor" /><br/>
          <button type="submit">Add Pizza</button>
        </form>
        <h2>Current Pizzas:</h2>
        <pre id="pizzaList">
      `);
      res.write(JSON.stringify(pizzas, null, 2));
      res.write(`</pre>
        <script>
          document.getElementById('pizzaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('pizzaType').value;
            
            try {
              const response = await fetch('/pizzas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type })
              });
              
              const result = await response.json();
              if (response.ok) {
                document.getElementById('pizzaType').value = '';
                location.reload(); // Refresh to show new pizza
              } else {
                alert('Error: ' + result['pizza status']);
              }
            } catch (error) {
              alert('Error adding pizza');
            }
          });
        </script>
      `);
      res.end();
    }
  }
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not valid url");
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});