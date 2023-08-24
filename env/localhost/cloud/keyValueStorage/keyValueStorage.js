const fs = require('fs')
const path = require('path')

const db = {}
const dbFile = path.join(__dirname, 'db.json')
if (fs.existsSync(dbFile)) {
    try {
        Object.assign(db, require(dbFile))
    } catch (err) {}
}

async function saveEntity (entity) {
    const { collection, key } = prepareRecord(entity)
    db[collection] = db[collection] || {}
    db[collection][entity.data[key]] = entity.data
    fs.writeFile(dbFile, JSON.stringify(db), () => {})
    return entity.data
}

function prepareRecord (entity) {
    const collection = entity.meta.collection
    const key = entity.meta.keyField
    return { collection, key }
}

async function getEntity (entity) {
    const { collection, key } = prepareRecord(entity)
    const result = {
        data: db[collection][entity.data[key]]
    }
    result.success = !!result.data
    return result
}

function prepareEntity (collection, keyField, data) {
    return {
        meta: {
            collection,
            keyField
        },
        data
    }
}

module.exports = {
    saveEntity,
    getEntity,
    prepareEntity
}
