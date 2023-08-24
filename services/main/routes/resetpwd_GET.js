const response = require('./response')
const users = require('../security/users')

async function handler (req) {
    if (req.query.token) {
        const result = await users.get_user_from_token(req.query.token)
        if (result.success) {
            let html = await response.loadHTMLFile(req.params.path)
            html = html.replace(/1111email1111/g, result.data.email)
            return response.applyHTMLResponse(html)
        }
    }
    return response.applyJSONResponse({
        success: false,
        msg: 'Invalid Token'
    })
}

module.exports = {
    handler
}
