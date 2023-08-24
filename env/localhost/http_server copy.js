
const express = require('express');
const app = express();
const port = 3000;
const http_router = require('../../services/main/http_router')
    

// Define a route handler for the root URL
app.all('*', express.json(), async (req, res) => {
    req.headers['x-original-host'] = 'localhost';
    req.params.path = req.params[0].slice(1)
    const response = await http_router.process_http_req(req)
    console.log(response)
    res.status(response.status || 200).set(response.headers || {})
    res.send(response.body)
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

function customStringify (obj, replacer = null, space = 4) {
    const seen = new WeakSet() // To keep track of seen objects

    return JSON.stringify(obj, function (key, value) {
        if (replacer) {
            value = replacer.call(this, key, value)
        }

        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]'
            }
            seen.add(value)
        }

        return value
    }, space)
}