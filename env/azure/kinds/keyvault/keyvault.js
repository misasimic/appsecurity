const { KeyVaultManagementClient } = require('@azure/arm-keyvault')
const azure = require('../../index')
const shell = require('../../../utils/shell')

let cachedClient
async function getClient () {
    if (!cachedClient) {
        const subscriptionId = await azure.getSubscriptionId()
        const resourceGroupName = await azure.getResourceGroupName()

        const client = new KeyVaultManagementClient(azure.credentials, subscriptionId)
        cachedClient = { client, resourceGroupName }
    }
    return cachedClient
}

let serviceMeta
async function getServiceMeta () {
    if (!serviceMeta) {
        serviceMeta = {
            name: await (await azure.getSubscriptionHash()) + azure.env.settings.projectName.toLowerCase() + 'vault'
        }
        const { client, resourceGroupName } = await getClient()
        try {
            await client.vaults.get(resourceGroupName, serviceMeta.name)
        } catch (err) {
            if (err.statusCode === 404) {
                const params = {
                    location: azure.env.settings.location,
                    properties: {
                        tenantId: (await azure.getAccount()).tenantId,
                        sku: { family: 'A', name: 'standard' },
                        accessPolicies: [],
                        enableRbacAuthorization: true
                    }
                }
                console.log('Creating Vault...')
                await client.vaults.beginCreateOrUpdateAndWait(resourceGroupName, serviceMeta.name, params)
                async function assignVaultRole (cmd, idField) {
                    const shellRez = await shell.executeCmd(cmd)
                    const obj = JSON.parse(shellRez.data[0])
                    await shell.executeCmd(`az role assignment create --role Key1111Space1111Vault1111Space1111Administrator --assignee ${obj[idField]} --scope /subscriptions/${await azure.getSubscriptionId()}/resourcegroups/SecureAppDemoResourceGroup`)
                }
                await assignVaultRole('az ad signed-in-user show', 'id')
                await assignVaultRole(`az identity show --name ${resourceGroupName} --resource-group ${resourceGroupName}`, 'principalId')
            } else {
                throw err
            }
        }
    }
    return serviceMeta
}

module.exports = {
    getServiceMeta
}
