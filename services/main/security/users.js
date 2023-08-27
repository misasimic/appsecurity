const user_repo = require('./users_repo')
const crypto = require('crypto')
const jwt = require('./jwt')
const secret = '3b96be03-199f-4e6b-aadf-0e83e389a69a'

function hashPwd (user) {
    const hashedUser = Object.assign({}, user)
    hashedUser.pwd_hash = crypto.createHash('sha256').update(user.email + user.pwd + secret).digest('hex')
    delete hashedUser.pwd
    return hashedUser
}

async function sign_up (user) {
    validateUser(user)
    const hashed = hashPwd(user)
    const saved = await user_repo.save_user(hashed)
    return saved
}

function validateUser (user) {
    const errors = []
    function checkField (name) {
        if (!user[name]) errors.push(name + ' field is required!')
    }
    checkField('email')
    checkField('name')
    checkField('pwd')
    if (errors.length > 0) throw new Error(errors.join(' '))
}

async function login_pwd (user) {
    const result = {
        success: false
    }
    const storedUser = (await user_repo.get_user(user)).data

    if (storedUser) {
        result.success = true
        const hashed = hashPwd(user)
        result.success = storedUser.pwd_hash === hashed.pwd_hash
        if (result.success) {
            result.jwt = jwt.generate_token({
                email: user.email
            })
        } else {
            result.msg = 'Invalid user/password'
        }
    } else {
        result.msg = 'Invalid user/password'
    }
    return result
}

async function login_jwt (token) {
    const decoded = await jwt.decode(token)

    const user = await user_repo.get_user({
        email: decoded.payload?.email
    })

    const result = {
        success: user.success
    }
    if (result.success) result.user = { email: decoded.payload.email }
    return result
}

function getResetToken (email) {
    return jwt.generate_token({ email })
}

async function reset_pwd (token, user) {
    const decoded = await jwt.decode(token)
    if (decoded.success && decoded.payload.email === user.email) {
        const storedUser = await user_repo.get_user(user)
        const usr = storedUser.data
        usr.pwd = user.pwd
        return await sign_up(usr)
    }
    throw new Error('Invalid token/email')
}

async function get_user_from_token (token) {
    const decoded = await jwt.decode(token)
    const result = {
        success: false,
        msg: 'invalid token'
    }
    if (decoded.success) {
        const userReq = await user_repo.get_user(decoded.payload)
        if (userReq.success) {
            return userReq
        }
    }
    return result
}

// get_user_from_token('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pc2Euc2ltaWNAZ21haWwuY29tIiwiaWF0IjoxNjkyODc1ODE1LCJleHAiOjE2OTMxMzUwMTV9.AwNCXCsYNc9s8suFOwqRbyiLGkgMt9RUTZ6TDU74u1s')

module.exports = {
    sign_up,
    login_jwt,
    login_pwd,
    getResetToken,
    reset_pwd,
    get_user: user_repo.get_user,
    get_user_from_token
}
