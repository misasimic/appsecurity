const response = require('./response')
const users = require('../security/users')

async function handler (req) {
    const res = {}
    const result = await users.login_pwd(req.body)
    if (result.success) {
        response.applyCookie('jwt', result.jwt, res)
    }
    return response.applyJSONResponse(result, res)
}

module.exports = {
    handler
}
