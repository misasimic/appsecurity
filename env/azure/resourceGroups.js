const azure = require('./index')
const shell = require('../utils/shell')
const { ResourceManagementClient } = require('@azure/arm-resources')
function constructResourceGroupName () {
    return azure.env.settings.projectName + 'ResourceGroup'
}

async function CreateResourceGroup () {
    const { client, resourceGroupName } = await getGroupSdk()

    const parameters = {
        location: azure.env.settings.location
    }

    try {
        const result = await client.resourceGroups.createOrUpdate(resourceGroupName, parameters)
        console.log(`Resource group "${resourceGroupName}" created successfully.`)
        await shell.executeCmd(`az identity create --resource-group ${resourceGroupName}  --name ${resourceGroupName}`)
        return result
    } catch (error) {
        console.error('An error occurred:', error.message)
        throw error
    }
}

async function getResourceGroup () {
    const { client, resourceGroupName } = await getGroupSdk()

    try {
        const result = await client.resourceGroups.checkExistence(resourceGroupName)
        if (result && result.body) {
            return resourceGroupName
        } else {
            return false
        }
    } catch (error) {
        console.error('An error occurred:', error.message)
    }
}

let group
async function getGroupSdk () {
    if (!group) {
        const subscriptionId = await azure.getSubscriptionId()
        const resourceGroupName = constructResourceGroupName()

        const client = new ResourceManagementClient(azure.credentials, subscriptionId)
        group = { client, resourceGroupName }
    }
    return group
}

let grpName
async function getResourceGroupName () {
    if (!grpName) {
        grpName = await getResourceGroup()
        if (!grpName) {
            const grp = await CreateResourceGroup()
            grpName = grp.name
        }
    }
    return grpName
}

module.exports = {
    getResourceGroupName
}
