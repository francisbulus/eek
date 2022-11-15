/* eslint-disable no-console */

const path = require('path')
const fs = require('fs')
const { filter, contains, map } = require('lodash/fp')
const recursiveReadDir = require('recursive-readdir')
const env = require('env-var')
const util = require('util')
const request = require('superagent')

const readDir = util.promisify(recursiveReadDir)
const readFile = util.promisify(fs.readFile)

const SERVICE_BUILD_DIR = `build`
const ROLLBAR_ACCESS_TOKEN = env.get('ROLLBAR_ACCESS_TOKEN').required().asString()
const ROLLBAR_ENV = env.get('ROLLBAR_ENV').default('production').required().asString()
const SHA = env.get('GITHUB_SHA').required().asString()

const sendToRollbar = async (filePath) => {
  const file = await readFile(filePath)
  const filename = filePath.split('/').pop()
  const relativePath = path.relative(path.join(__dirname, '..'), filePath)
  const sourceMapUrl = `/app/build${relativePath
    .replace(__dirname, '')
    .replace(`${SERVICE_BUILD_DIR}`, '')
    .replace('.map', '')}`

  return request
    .post('https://api.rollbar.com/api/1/sourcemap')
    .field('access_token', ROLLBAR_ACCESS_TOKEN)
    .field('environment', ROLLBAR_ENV)
    .field('version', SHA)
    .field('minified_url', sourceMapUrl)
    .attach('source_map', file, filename)
    .then((res) => res.body)
    .catch((res) => Promise.reject(res.error || res))
}
const isSourceMap = contains('.js.map')

const uploadSourceMaps = async () => {
  const files = await readDir(path.join(__dirname, '..', SERVICE_BUILD_DIR))
  const sourceMaps = filter(isSourceMap, files)

  return Promise.all(map(sendToRollbar, sourceMaps))
}
uploadSourceMaps()
  .then(() => console.log('Uploaded source maps'))
  .catch(console.error)
