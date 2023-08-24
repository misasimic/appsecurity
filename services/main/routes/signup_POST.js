const response = require('./response')
const users = require('../security/users')

async function handler (req) {
    let result = {
        success: false
    }
    try {
        result = await users.sign_up(req.body)
    } catch (err) {
        result.err = err.message
    }
    return response.applyJSONResponse(result)
}

module.exports = {
    handler
}

handler({
    body: {
        email: 'test@test.com',
        name: 'test',
        pwd: 'test'
    }
}).then(r => console.log(r))
