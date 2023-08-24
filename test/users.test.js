const env = require('../env/env')
env.settings.provider = 'localhost'

const users = require('../services/main/security/users')
// const { describe, test, expect } = require('jest')

const testUser = {
    email: 'test@test.com',
    name: 'test name',
    pwd: 'testpwd'
}

let jwt

describe('testing Users Service', () => {
    test('sign_up', async () => {
        const sign_up = await users.sign_up(testUser)
        expect(sign_up.pwd).toBeUndefined()
        expect(sign_up.email === testUser.email).toBe(true)
    })

    test('login_pwd', async () => {
        const success = await users.login_pwd(testUser)
        expect(success.success).toBe(true)
        expect(success.jwt).toBeTruthy()
        jwt = success.jwt
        const wrongPwd = await users.login_pwd({
            email: testUser.email, pwd: 'wrongPwd'
        })
        expect(wrongPwd.success).toBe(false)
    })

    test('login_jwt', async () => {
        const success = await users.login_jwt(jwt)
        expect(success.success).toBe(true)
        expect(success.user.email === testUser.email).toBe(true)
        const token = users.getResetToken('whatever')
        const failed = await users.login_jwt(token)
        expect(failed.success).toBe(false)
    })

    test('reset_pwd', async () => {
        const token = users.getResetToken(testUser.email)
        const resetPwdUser = await users.reset_pwd(token, {
            email: testUser.email,
            pwd: 'newPwd'
        })
        expect(resetPwdUser.email === testUser.email).toBe(true)
        let resetPwdUserFail = {}
        try {
            resetPwdUserFail = await users.reset_pwd(token, {
                email: 'whatever',
                pwd: 'newPwd'
            })
        } catch (err) {

        }
        expect(resetPwdUserFail.email === testUser.email).toBe(false)
    })
})
