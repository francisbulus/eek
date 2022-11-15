#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { load } from 'js-yaml'

const version = process.argv[2]
const suffix = process.env.ENV === 'staging' ? '.sta' : ''

const filePath = `./infra/invisible-app/values.process-automation${suffix}.yaml`

const file = readFileSync(filePath, 'utf8')
function setVersion() {
  const data = load(file)

  if (!data?.image?.tag) throw new Error(`no image tag in ${filePath}`)

  const oldTag = data.image.tag
  writeFileSync(filePath, file.replace(`tag: '${oldTag}'`, `tag: '${version}'`))
}

setVersion()
