import { fileURLToPath } from 'url'
import path from 'node:path'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const src = path.join(__dirname, '../data')
const dest = path.join(__dirname, '../dist/data')

fs.copySync(src, dest, { overwrite: true })
console.log('Copied /data to /dist/data')
