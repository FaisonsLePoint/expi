#!/usr/bin/env node
import chalk from 'chalk'
import logSymbols from 'log-symbols'
import figlet from 'figlet'
import boxen from 'boxen'
import path from 'path'
import fs, { ensureDir } from 'fs-extra'
import ora from 'ora'
import inquirer from 'inquirer'
import { spawn } from 'child_process'

import pkg from 'template-file'
const { renderFile } = pkg

import { fileURLToPath } from 'url';

const params = process.argv.slice(2)
const startTime = new Date().getTime()
let details = {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (params.length === 0) {
    console.log(logSymbols.error, chalk.red('Invalid args...'))
    console.log(chalk.blue('Quick start...'))
    console.group()
    console.log(chalk.green('expi .'))
    console.log(`Installs in current directory (${process.cwd()})`)

    console.log('\nOR\n')
    console.log(chalk.green('expi myApp'))
    console.log(
        `Installs in "myApp" directory (${path.join(process.cwd(), 'myApp')})`
    )
    console.groupEnd()
    process.exit(1)
}

const rootDir = path.join(process.cwd(), params[0])

const questions = [
    {
        type: 'list',
        name: 'first',
        message: 'What do you want to generate ?',
        choices: [
            'Simple API',
            'Add resources'
        ]
    },
    {
        type: 'input',
        name: 'resources',
        message: 'Write here your resources separate by coma : ',
        when(answers) {
            if (answers.first == 'Simple API') {
                return false
            }
            return answers.first
        }
    },
    {
        type: 'confirm',
        name: 'auth',
        message: 'Do you want JWT authentication ?',
        default() {
            return false
        }
    }
]

inquirer.prompt(questions)
    .then(async answers => {
        details = answers
        startApp()
    })

/**
 * Simple start function
 */
const startApp = () => {
    figlet('Expi', { font: 'Slant Relief' }, (err, data) => {
        if (err) {
            console.log('Something went wrong...')
            console.log(err)
            return
        }
        console.log(chalk.green(data))
        const channelLink = 'https://www.youtube.com/@FaisonsLePoint'
        const githubLink = 'https://github.com/FaisonsLePoint'
        const youtube = `${chalk.white('📺 Visit @')} ${chalk.red(channelLink)}`
        const github = `${chalk.white('📦 Github @')} ${chalk.blue(githubLink)}`
        const header = `${youtube}\n${github}`
        console.log(
            boxen(header, {
                borderColor: 'yellow',
                borderStyle: 'classic',
                align: 'left',
            })
        )

        createApp()

    })
}

/**
 * Main function to organize and create folders and files
 * according the answers
 */
const createApp = async () => {
    try {

        // If not exists, create app folder
        await ensureDir(rootDir)

        // Check if folder is empty
        const files = await fs.readdir(rootDir)
        if (files.length > 0) {
            console.log(
                logSymbols.error,
                `Path ${chalk.green(rootDir)} ${chalk.red('is not empty')}`
            )
            process.exit(1)
        }

        console.log('🚚 Generating Express API in', chalk.green(rootDir), '\n')

        await installScript(['init', '-y'], 'Creating Package.json')
        await installScript(['i', 'express', 'cors', 'dotenv'], 'Installing dependencies')
        await installScript(['i', '--save-dev', 'nodemon'], 'Installing dev dependencies')

        // If jwt auth us asked
        if(details.auth){
            await installScript(['i', 'jsonwebtoken', 'bcrypt'], 'Installing JsonWebToken')
        }

        await modifyPJS('Add script to Package.json')

        // For asked resource or auth
        if (details.hasOwnProperty('resources') || details.auth) {
            await ensureDir(rootDir+'/controllers')
            await ensureDir(rootDir+'/routers')
        }

        // For asked resource
        if (details.hasOwnProperty('resources')) {
            for (let res of details.resources.split(',')) {
                let name = res.trim()

                await generateResourceFile(name, 'controller')
                await generateResourceFile(name, 'router')

            }            
        }

        await generateServerFile()

        // If JWT Auth asked
        if(details.auth){
            await generateAuthFile()
        }

        await generateEnvFile()

        done()
    } catch (e) {
        console.log(e)
    }
}

/**
 * End function after all generations
 */
const done = () => {
    console.log(chalk.yellow('------------------------------------'))
    console.log('Begin by typing:')
    console.group()
    console.log(chalk.blue('cd'), params[0])
    console.log(chalk.blue('npm run dev'))
    console.group()
    console.log('starts the development server (using nodemon 🧐)')
    console.groupEnd()
    console.log(chalk.blue('npm start'))
    console.group()
    console.log(`starts the server (using node 😁)`)
    console.groupEnd()
    console.groupEnd()
    console.log(chalk.yellow('------------------------------------'))

    const endTime = new Date().getTime()
    const timeDifference = (endTime - startTime) / 1000
    console.log(`✅ Done in ${timeDifference} seconds ✨`)
    console.log('🌈 Happy hacking 🦄')
}

/**
 * Function to initiate npm command
 * @param {array} params - npm commands
 * @param {string} spinnerText - waiting message
 * @returns {Promise}
 */
const installScript = (params, spinnerText) => {
    return new Promise((resolve, reject) => {
        const spinner = ora(spinnerText).start()

        const child = spawn('npm', params, { cwd: rootDir, shell: true })
        child.on('exit', (code, signal) => {
            //console.log(code, signal)
            if (code) {
                spinner.fail()
                reject(`Process exit with code: ${code}`)
            } else if (signal) {
                spinner.fail()
                reject(`Process exit with signal: ${signal}`)
            } else {
                spinner.succeed()
                resolve()
            }
        })
    })
}

/**
 * Function to modify the package.json file
 * @param {string} spinnerText - waiting message
 * @returns {Promise}
 */
const modifyPJS = (spinnerText) => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora(spinnerText).start()

        try {
            // Get package.json file
            const pkgSrc = path.join(rootDir, 'package.json')
            const pkgfile = await fs.readFile(pkgSrc, { encoding: 'utf-8' })

            // Parse in object
            let packageJson = JSON.parse(pkgfile)

            // Add script and license
            packageJson = {
                ...packageJson,
                main: 'server.js',
                scripts: {
                    start: 'node -r dotenv/config server.js',
                    dev: 'nodemon -r dotenv/config server.js',
                },
                license: 'MIT',
            }

            // Save modifications
            await fs.writeFile(pkgSrc, JSON.stringify(packageJson, null, 2))

            spinner.succeed()
            resolve()
        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}

/**
 * Function to generate resource files
 * (controller and router files)
 * @param {string} name - name of resource
 * @param {string} type - controller | router
 * @returns {Promise}
 */
const generateResourceFile = (name, type) => {
    return new Promise(async (resolve, reject) => {
        let uName = name[0].toUpperCase() + name.slice(1)
        const spinner = ora(`Generate ${name} ${type}`).start()

        try {
            await fs.copyFile(
                path.join(__dirname, '..', 'templates', `${type}.tmp`),
                path.join(rootDir + `/${type}s`, `${name}.js`)
            )

            let sourceFile = path.join(rootDir + `/${type}s`, `${name}.js`)
            let render = await renderFile(
                path.join(rootDir + `/${type}s`, `${name}.js`),
                { name: name, uName: uName }
            )
            await fs.writeFile(sourceFile, render)

            spinner.succeed()
            resolve()
        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}

/**
 * Function to generate controller and router for JWT Auth
 * @returns {Promise}
 */
const generateAuthFile = () => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora('Generate Auth files').start()
        try{
            await fs.copyFile(
                path.join(__dirname, '..', 'templates/auth', `controller.tmp`),
                path.join(rootDir + `/controllers`, `auth.js`)
            )

            await fs.copyFile(
                path.join(__dirname, '..', 'templates/auth', `router.tmp`),
                path.join(rootDir + `/routers`, `auth.js`)
            )

            spinner.succeed()
            resolve()
        }catch(e){
            spinner.fail()
            reject(e)
        }
    })
}

/**
 * Function to generate server file with resources
 * @param {string} resources - name of resource
 * @returns {Promise}
 */
const generateServerFile = (resources = null) => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora('Genrate API Server').start()
        try {

            let data = { routers: [], routes: [] }

            // Add auth router if asked
            if(details.auth){
                data.routers.push({ module: `const auth_router = require('./routers/auth')` })
                data.routes.push({ route: `app.use('/auth', auth_router)` })
            }

            // Add resource router if asked
            if (details.hasOwnProperty('resources')) {

                for (let res of details.resources.split(',')) {
                    let name = res.trim()
                    data.routers.push({ module: `const ${name}_router = require('./routers/${name}')` })
                    data.routes.push({ route: `app.use('/${name}', ${name}_router)` })
                }
            }

            await fs.copyFile(
                path.join(__dirname, '..', 'templates', 'server.tmp'),
                path.join(rootDir, `server.js`)
            )

            let sourceFile = path.join(rootDir, 'server.js')
            let render = await renderFile(
                path.join(rootDir, 'server.js'),
                data
            )
            await fs.writeFile(sourceFile, render)

            spinner.succeed()
            resolve()

        } catch (e) {
            spinner.fail()
            reject(e)
        }
    })
}

/**
 * Function to generate .env file according the answers
 * @returns {Promise}
 */
const generateEnvFile = () => {
    return new Promise(async (resolve, reject) => {
        const spinner = ora('Generate .env file')
        try{
            await fs.copyFile(
                path.join(__dirname, '..', 'templates', '.env'),
                path.join(rootDir, '.env')
            )

            // If auth jwt asked, prepare env variable
            let jwtParams = {bcryptsalt: '', jwtsecret: '', jwtduring: ''}
            if(details.auth){
                jwtParams.bcryptsalt = 'BCRYPT_SALT_ROUND=10'
                jwtParams.jwtsecret = 'JWT_SECRET=YOUR_JWT_PASSPHRASE_PLEASE_WRITE_A_LONGER'
                jwtParams.jwtduring = 'JWT_DURING=1h'
            }

           
            let sourceFile = path.join(rootDir + `/.env`)
            let render = await renderFile(
                path.join(rootDir + `/.env`),
                jwtParams
            )
            await fs.writeFile(sourceFile, render)
            

            spinner.succeed()
            resolve()
        }catch(e){
            spinner.fail()
            reject(e)
        }        
    })
}

