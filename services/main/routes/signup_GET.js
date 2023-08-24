const response = require('./response')

async function handler (req) {
    return response.applyHTMLResponse(await response.loadHTMLFile(req.params.path))
}

module.exports = {
    handler
}
