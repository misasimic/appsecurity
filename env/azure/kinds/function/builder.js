const fs = require('fs-extra')
const gulp = require('gulp')
// const crypto = require('crypto')
const path = require('path')
const env = require('../../../env')
const _ = require('lodash')

const { hashFolder } = require('../../../utils/hashFolder')

const enums = {
    package_file: 'package.json'
}

async function buildFunction (in_meta) {
    in_meta.build_folder = in_meta.build_folder || path.resolve(__dirname, '../../../../build/', in_meta.name)
    await fs.remove(in_meta.build_folder)
    await fs.ensureDir(in_meta.build_folder)
    const svc_settings = require(path.resolve(in_meta.src_folder, 'service.json'))

    function CopySrc () {
        const excludedFolders = ['node_modules']
        return gulp.src([in_meta.src_folder + '/**/*', '!' + in_meta.src_folder + '/' + excludedFolders.join('/**')])
            .pipe(gulp.dest(path.resolve(in_meta.build_folder, in_meta.name)))
    };

    function CopyVersion () {
        return gulp.src(path.resolve(__dirname, 'templates/**/*'))
            .pipe(gulp.dest(in_meta.build_folder))
    };

    async function cloneFunction_json () {
        const fnjson = require('./templates/version/function.json')
        fnjson.entryPoint = in_meta.name
        fnjson.bindings[0].route = in_meta.name + '/{*path}'
        fnjson.scriptFile = 'azure_http.js'
        await Promise.all([
            fs.outputFile(
                path.resolve(in_meta.build_folder, in_meta.name, 'function.json'),
                JSON.stringify(fnjson)
            ),
            fs.copyFile(
                path.resolve(__dirname, 'templates', 'azure_http.js'),
                path.resolve(in_meta.build_folder, in_meta.name, 'azure_http.js')
            )
        ])
    }

    async function set_package () {
        const pkg = require(path.resolve(in_meta.build_folder, in_meta.name, enums.package_file))

        await fs.outputFile(path.resolve(in_meta.build_folder, enums.package_file), JSON.stringify(pkg))
    }

    async function create_build_json () {
        const build = {
            // build_moment: new Date().toString(),
            version: '1.0.0',
            hash: await hashFolder(in_meta.build_folder)
        }
        await fs.outputFile(path.resolve(in_meta.build_folder, 'build.json'), JSON.stringify(build))
    }

    async function copy_dependencies () {
    // console.log(in_meta, env, svc_settings)
        const provider_folder = path.resolve(__dirname, '../../../', env.settings.provider)
        async function copyCloudClientFile () {
            const cloudClientFile = path.resolve(provider_folder, 'cloud_client.js')
            await Promise.all([
                fs.copyFile(cloudClientFile, path.resolve(in_meta.build_folder, 'cloud_client.js')),
                fs.copyFile(path.resolve(provider_folder, '../', 'settings.json'), path.resolve(in_meta.build_folder, 'settings.json'))

            ])
        }

        async function copyCloudServices () {
            const svc_package_file = path.resolve(in_meta.build_folder, enums.package_file)
            const svc_package = require(svc_package_file)
            async function copyCloudService (svc_name) {
                const settings = env.settings
                const name = settings[settings.provider].client[svc_name]
                const cloud_svc_folder = path.resolve(provider_folder, 'client_services', name)
                const dest_folder = path.resolve(in_meta.build_folder, 'client_services', name, 'src')
                if (!fs.existsSync(dest_folder)) {
                    async function copy_folder () {
                        const src_folder = path.resolve(cloud_svc_folder, 'src')

                        await fs.copy(src_folder, dest_folder)
                    }

                    async function applyDependencies () {
                        const dep_package = require(path.resolve(cloud_svc_folder, enums.package_file))

                        Object.assign(svc_package.dependencies, dep_package.dependencies || {})
                        if (dep_package.serviceMeta) {
                            svc_package.serviceMeta = svc_package.serviceMeta || {}
                            _.merge(svc_package.serviceMeta, dep_package.serviceMeta)
                        }
                    }
                    await Promise.all([applyDependencies(), copy_folder()])
                }
            }

            const tasks = svc_settings.cloud_client_services.map(name => {
                return copyCloudService(name)
            })

            await Promise.all(tasks)

            if (svc_package.serviceMeta?.cloud_client_services && svc_package.serviceMeta?.cloud_client_services.length > 0) {
                const deps = svc_package.serviceMeta?.cloud_client_services.map(k => copyCloudService(k))
                await Promise.all(deps)
            }

            await fs.outputFile(svc_package_file, JSON.stringify(svc_package))
        }
        if (svc_settings.cloud_client_services && svc_settings.cloud_client_services.length > 0) {
            await Promise.all([copyCloudClientFile(), copyCloudServices()])
        }
    }

    const tasks = gulp.series(
        gulp.parallel(CopySrc, CopyVersion),
        gulp.parallel(cloneFunction_json, set_package),
        copy_dependencies,
        create_build_json
    )

    tasks()
}

module.exports = {
    buildFunction
}

if (require.main === module) {
    const in_meta = {
        name: 'main',
        src_folder: path.resolve(__dirname, '../../../../services/main')
    // build_folder: path.resolve(__dirname, '../../../../build', in_meta.name)
    }
    buildFunction(in_meta)
}
