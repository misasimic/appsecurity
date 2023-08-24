const response = require('./response')
const users = require('../security/users')

async function handler (req) {
    try {
        const result = await users.reset_pwd(req.body.token, req.body)
        return response.applyJSONResponse(result)
    } catch (err) {
        return response.applyJSONResponse({
            success: false,
            msg: err.message
        })
    }
}

module.exports = {
    handler
}
if (require.main === module) {
    handler({
        body: {
            email: 'misa.simic@gmail.com',
            pwd: 'pwd',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pc2Euc2ltaWNAZ21haWwuY29tIiwiaWF0IjoxNjkyODc1ODE1LCJleHAiOjE2OTMxMzUwMTV9.AwNCXCsYNc9s8suFOwqRbyiLGkgMt9RUTZ6TDU74u1s'
        }
    }).then(r => console.log(r))
}
