const shell = require('../utils/shell')

let account
async function loadAccount () {
    if (!account) {
        const rez = await shell.executeCmd('az account show')
        if (rez.code === 0) {
            account = JSON.parse(rez.data[0])
        } else {
            console.log(rez)
            throw new Error(rez.errors.join())
        }
    }
    return account
}

module.exports = {
    loadAccount
}

if (require.main === module) {
    loadAccount().then(r => console.log(r))
}
