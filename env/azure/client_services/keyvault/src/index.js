const { SecretClient } = require('@azure/keyvault-secrets')
const { DefaultAzureCredential } = require('@azure/identity')

let client

function getClient () {
    if (!client) {
        const credential = new DefaultAzureCredential(true)
        const url = 'https://' + process.env.KeyVaultName + '.vault.azure.net'
        client = new SecretClient(url, credential)
    }
    return client
}

async function getSecret (secretName) {
    const cl = getClient()
    try {
        const secret = await cl.getSecret(secretName)
        return secret.value
    } catch (err) {
        console.log(err.message)
        return ''
    }
}

module.exports = {
    getSecret
}

getSecret('secret').then(r => console.log(r))
