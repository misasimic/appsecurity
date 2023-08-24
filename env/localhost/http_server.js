const express = require('express');
const https = require('https');
const fs = require('fs');
const http_router = require('../../services/main/http_router')

const app = express();
const port = 443; // Default HTTPS port

// Load SSL/TLS certificates
const privateKey = fs.readFileSync(__dirname + '/key.pem', 'utf8');
const certificate = fs.readFileSync(__dirname + '/cert.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Define your routes
app.all('*', express.json(), async (req, res) => {
    req.headers['x-original-host'] = 'localhost';
    req.params.path = req.params[0].slice(1)
    const response = await http_router.process_http_req(req)
    console.log(response)
    res.status(response.status || 200).set(response.headers || {})
    res.send(response.body)
});

// Start the server
httpsServer.listen(port, () => {
  console.log(`HTTPS server running on https://localhost:${port}`);
});
