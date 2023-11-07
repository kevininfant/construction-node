require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser'); // Removed unnecessary space
const fs = require('fs');
const path = require('path'); // Import the 'path' module
const PORT = process.env.API_PORT || 3307; // Default to port 3000 if API_PORT is not defined in your .env file

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Read the filenames from the 'routers' directory
const routerDir = './routers';
const filenames = fs.readdirSync(routerDir);

// Iterate through the filenames and dynamically add routes
filenames.forEach(file => {
    const routerPath = path.join(__dirname, routerDir, file);
    const router = require(routerPath);
    app.use(`/api/v1/`, router);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
