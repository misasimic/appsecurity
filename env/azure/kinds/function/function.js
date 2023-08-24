const azure = require('../../index')
const storageAccount = require('../../storageAccount')
const builder = require('./builder')
const axios = require('axios')
const shell = require('../../../utils/shell')
const path = require('path')
const api = require('../api/api')

const { WebSiteManagementClient } = require('@azure/arm-appservice')

const fnApp = {
    constructName: async function (in_name) {
        return (await azure.getSubscriptionHash()) + azure.env.settings.projectName + 'FnApp' + in_name
    },
    exists: async function (in_name) {
        const fnAppName = await fnApp.constructName(in_name)
        const { client, resourceGroupName } = await getClient()
        try {
            const fnApp = await client.webApps.get(resourceGroupName, fnAppName)
            return fnApp // Function App name exists
        } catch (error) {
            // console.log(error);
            if (error.statusCode === 404) {
                return false // Function App name does not exist
            }
            throw error // Handle other errors
        }
    },
    getFnApp: async function (name) {
        let myFnApp = await fnApp.exists(name)
        if (!myFnApp) {
            myFnApp = await fnApp.create(name)
        }
        const { client, resourceGroupName } = await getClient()
        const keys = await client.webApps.listHostKeys(resourceGroupName, myFnApp.name)
        myFnApp.key = keys.functionKeys.default
        return myFnApp
    },
    devSlot: async function (functionAppName, serverFarmId) {
        const { client, resourceGroupName } = await getClient()
        const slotName = 'dev'
        if (!serverFarmId) {
            await client.webApps.deleteSlot(
                resourceGroupName,
                functionAppName,
                slotName)
        } else {
            await client.webApps.beginCreateOrUpdateSlotAndWait(
                resourceGroupName,
                functionAppName.toLowerCase(),
                slotName,
                {
                    location: azure.env.settings.location,
                    serverFarmId
                }
            )
        }
    },
    create: async function (in_name) {
        const { client, resourceGroupName } = await getClient()
        const functionAppName = await fnApp.constructName(in_name)
        const identityId = `/subscriptions/${await azure.getSubscriptionId()}/resourceGroups/${resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/${resourceGroupName}`
        const identity = {
            type: 'UserAssigned',
            userAssignedIdentities: {

            }
        }
        identity.userAssignedIdentities[identityId] = {}
        const functionAppParameters = {
            location: azure.env.settings.location,
            // serverFarmId: undefined, // No need to specify, as it's the Consumption Plan
            kind: 'functionapp',
            reserved: true,
            sku: {
                name: 'Y1',
                tier: 'Dynamic'
            },
            siteConfig: {
                appSettings: [
                    {
                        name: 'AzureWebJobsStorage',
                        value: await storageAccount.getStorageAccountConnectionString()
                    },
                    {
                        name: 'FUNCTIONS_EXTENSION_VERSION',
                        value: '~4'
                    },
                    {
                        name: 'FUNCTIONS_WORKER_RUNTIME',
                        value: 'node'
                    },
                    {
                        name: 'StorageAccountName',
                        value: await storageAccount.getStorageAccountName()
                    },
                    {
                        name: 'StorageAccountKey',
                        value: await storageAccount.getStorageAccountKey()
                    },
                    {
                        name: 'KeyVaultName',
                        value: (await azure.getSubscriptionHash()) + azure.env.settings.projectName + 'vault'
                    }

                ],
                linuxFxVersion: 'NODE|18'
            },
            identity: {
                type: 'SystemAssigned'
            },
            keyVaultReferenceIdentity: 'SystemAssigned'
        }
        // console.log(client.webApps)
        const functionAppResponse = await client.webApps.beginCreateOrUpdateAndWait(resourceGroupName, functionAppName, functionAppParameters)
        await shell.executeCmd(`az role assignment create --role Key1111Space1111Vault1111Space1111Administrator --assignee ${functionAppResponse.identity.principalId} --scope /subscriptions/${await azure.getSubscriptionId()}/resourcegroups/SecureAppDemoResourceGroup`)
        console.log(`Created Azure Function App: ${functionAppResponse.name}`)
        await fnApp.devSlot(functionAppName, functionAppResponse.serverFarmId)

        return functionAppResponse
    }

}

let cachedClient
async function getClient () {
    if (!cachedClient) {
        const subscriptionId = await azure.getSubscriptionId()
        const resourceGroupName = await azure.getResourceGroupName()

        const client = new WebSiteManagementClient(azure.credentials, subscriptionId)
        cachedClient = { client, resourceGroupName }
    }
    return cachedClient
}

async function deployService (in_meta) {
    await builder.buildFunction(in_meta)

    async function deployFn () {
        console.log('checking service: ' + in_meta.name)
        const myFnApp = await fnApp.getFnApp(in_meta.name)
        in_meta.fnAppName = myFnApp.name
        in_meta.domain = myFnApp.defaultHostName.slice(myFnApp.defaultHostName.indexOf('.'))
        in_meta.fnAppId = myFnApp.id
        in_meta.fnKey = myFnApp.key
        async function getDeployedVersion () {
            let version = {}

            try {
                const url = 'https://' + in_meta.fnAppName.toLowerCase() + (in_meta.dev ? '-dev' : '') + in_meta.domain + '/api/version'
                const response = await axios.get(url)
                version = response.data || {}
            } catch (e) {
                // console.log('ERORROR! ', e);
            }
            return version
        }

        const deployedVersion = await getDeployedVersion()
        const buildVersion = require(in_meta.build_folder + '/build.json')
        if (buildVersion.hash !== deployedVersion.hash) {
            console.log('deploying service: ' + in_meta.name, deployedVersion, buildVersion)
            const zipFile = in_meta.name + '.zip'
            const zipR = await shell.executeCmd(`zip -r ../${zipFile} . *`, in_meta.build_folder)

            if (zipR.code === 0) {
                const deployFnR = await shell.executeCmd(
                    `az functionapp deployment source config-zip -g SecureAppDemoResourceGroup -n ${in_meta.fnAppName} --src ${zipFile} --build-remote true` + (in_meta.dev ? ' --slot dev' : ''),
                    path.resolve(in_meta.build_folder, '../')
                )
                if (deployFnR.code === 0) {
                    console.log('service: ' + in_meta.name + ' => deployed successfully')
                    api.registerServiceApp(in_meta)
                } else {
                    console.log('ERORROR DEPLOY SERVICE: ', deployFnR)
                    throw new Error('ERORROR ZipDeploy!')
                }
            } else {
                throw new Error('Problem to deploy function (zip): ' + in_meta.name)
            }
        } else {
            console.log('Not Changed')
        }
    }
    await deployFn()
    const svc_package = require(path.resolve(in_meta.build_folder, 'package.json'))
    async function deployCloudService (name) {
        const svc = require(path.resolve(__dirname, '../', name, name))
        await svc.getServiceMeta()
    }
    if (svc_package.serviceMeta?.azure_services && svc_package.serviceMeta.azure_services.length > 0) {
        const cloudServices = svc_package.serviceMeta.azure_services.map(s => deployCloudService(s))
        await Promise.all(cloudServices)
    }

    return in_meta
}
function deployer (service) {
    async function deploy () {
        await deployService(service)
    }
    return deploy
}
module.exports = {
    deployer
}

if (require.main === module) {
    const svc = {
        kind: 'function',
        api: {
            route: '/'
        },
        name: 'main',
        src_folder: '/Users/misasimic/nodeApps/appsecurity/services/main'
    }
    deployService(svc).then(rez => console.log(rez))
}
