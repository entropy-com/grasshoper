// This is the main Node.js server file.
// It now includes server-side filtering based on query parameters.
const { listAvailableGPUs } = require('./hyperbolic.js');
const { getPrice } = require('./gcloud.js'); // Import the getPrice function from gcloud.js
const express = require('express'); // Import Express framework
const app = express(); // Create an Express application instance
const cors = require('cors'); // Import CORS middleware

// CORS options to allow requests from http://localhost:5173
const corsoptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'] // Allow GET and POST requests
};

app.use(cors(corsoptions)); // Enable CORS with specified options
app.use(express.json()); // Enable parsing JSON bodies from incoming requests

app.get('/hyperbolic', async (req, res) => {
    const data = await listAvailableGPUs();
    res.json(data);
});

// Define a GET route for the root URL '/'
app.get('/', async (req, res) => {
    try {
        // Fetch all GPU prices using the getPrice function
        const prices = await getPrice();
        let filteredPrices = prices; // Initialize filteredPrices with all fetched prices

        // Get the descriptionFilter from the query parameters (e.g., /?descriptionFilter=Nvidia)
        const descriptionFilter = req.query.descriptionFilter;
        
        // If a descriptionFilter is provided, apply the filter
        if (descriptionFilter) {
            // Filter the prices array: keep GPUs whose description (case-insensitive)
            // includes the filter string (case-insensitive).
            filteredPrices = prices.filter(gpu =>
                gpu.desc.toLowerCase().includes(descriptionFilter.toLowerCase())
            );
        }

        res.json(filteredPrices); // Send the (filtered) prices as JSON response
        console.log("success"); // Log success message
    } catch (err) {
        res.status(500).json({ error: 'Failed to get prices' }); // Send 500 status on error
        console.log("error in dealing with the api:", err); // Log the detailed error
    }
});

// Define a POST route for the root URL '/' (for demonstration/testing purposes)
app.post('/', (req, res) => {
    const { email, name } = req.body; // Extract email and name from request body
    console.log('received ', name, '->', email); // Log received data
    res.json({ status: `success / ${name} /${email}` }); // Send a success status message
});

let port = 3000; // Define the port number for the server
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`); // Start the server and log its URL
});
