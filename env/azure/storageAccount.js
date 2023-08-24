const azure = require('./index')
const { StorageManagementClient } = require('@azure/arm-storage')

let cachedStorageAccountName
async function getStorageAccountName () {
    if (!cachedStorageAccountName) {
        cachedStorageAccountName = await azure.getSubscriptionHash() + azure.env.settings.projectName + 'Acc'
    }
    return cachedStorageAccountName.substr(0, 23).toLowerCase()
}
let connString
async function getStorageAccountConnectionString () {
    if (!connString) {
        const storageClient = await getClient()
        const resourceGroupName = await azure.getResourceGroupName()
        const storageAccountName = await getStorageAccountName()

        try {
            const storageAccountKeys = await storageClient.storageAccounts.listKeys(resourceGroupName, storageAccountName)
            connString = `DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKeys.keys[0].value};EndpointSuffix=core.windows.net`
            return connString
        } catch (error) {
            console.log('Storage Account does not exist')
            const created = await CreateStorageAccount()
            if (created) {
                console.log('Storage Account created successfully')
                return await getStorageAccountConnectionString()
            }
        }
    }
    return connString
}

async function CreateStorageAccount () {
    const storageClient = await getClient()
    const resourceGroupName = await azure.getResourceGroupName()
    const storageAccountName = await getStorageAccountName()

    const storageAccountParameters = {
        sku: {
            name: 'Standard_LRS' // Change this to your desired SKU
        },
        kind: 'StorageV2', // Change this to the desired storage kind
        location: azure.env.settings.location // Change this to the desired location
    }

    const storage = await storageClient.storageAccounts.beginCreateAndWait(resourceGroupName, storageAccountName, storageAccountParameters)
    return storage
}

let cachedClient

async function getClient () {
    if (!cachedClient) {
        const subscriptionId = await azure.getSubscriptionId()
        const storageClient = new StorageManagementClient(azure.credentials, subscriptionId)
        cachedClient = storageClient
    }
    return cachedClient
}

async function getStorageAccountKey () {
    const myConString = await getStorageAccountConnectionString()
    const i = myConString.indexOf('AccountKey=') + 11
    const key = myConString.slice(i, myConString.indexOf(';', i))
    return key
}
// getStorageAccountKey()

module.exports = {
    getStorageAccountConnectionString,
    getStorageAccountKey,
    getStorageAccountName
}
