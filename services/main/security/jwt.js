const jwt = require('jsonwebtoken')

const secretKey = '8f2df57c-b2a8-4fae-b100-cc8f9d3fc3f5re'

const options = {
    expiresIn: '3d' // Token will expire in 1 hour
}

function generate_token (payload) {
    return jwt.sign(payload, secretKey, options)
}

async function decode (token) {
    const rez = {
        success: true
    }
    try {
        const payload = await jwt.verify(token, secretKey)
        rez.payload = payload
    } catch (err) {
        rez.success = false
        rez.message = err.message
    }
    return rez
}

module.exports = {
    generate_token,
    decode
}
