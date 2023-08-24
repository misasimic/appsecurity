const cloud_client = require('../../cloud_client')

let db
async function getDB () {
    if (!db) {
        db = await cloud_client.get_cloud_service('keyValueStorage')
    }
    return db
}
async function save_user (user) {
    const entity = await getEntityFromUser(user)
    const db = await getDB()
    const rez = await db.saveEntity(entity)
    return rez
};

async function get_user (user) {
    const entity = await getEntityFromUser(user)
    const db = await getDB()
    const rez = await db.getEntity(entity)
    return rez
};

async function getEntityFromUser (user) {
    const entity = (await getDB()).prepareEntity('users', 'email', user)
    return entity
}

module.exports = {
    save_user,
    get_user
}
