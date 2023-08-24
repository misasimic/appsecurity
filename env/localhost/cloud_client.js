async function get_cloud_service (name) {
    return require(`./cloud/${name}/${name}`)
}

module.exports = {
    get_cloud_service
}
