const http = require('http')


const server = http.createServer(async (req, res) => {
    const http_router = require('../../services/main/http_router')
    const response = await http_router.process_http_req(req)
    console.log(response)
    res.writeHead(response.status || 200, response.headers || {})
    res.end(response.body)
    /*
    // Set the response header
    res.writeHead(200, { 'Content-Type': 'text/plain' })

    // Write the response content
    res.end('Hello, this is a simple HTTP server!')
    */
})

const port = 3000
const hostname = '127.0.0.1'


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
