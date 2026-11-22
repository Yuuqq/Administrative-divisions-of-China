const fs = require('fs/promises')
const path = require('path')
const sqlite3 = require('sqlite3')

const tables = [
  ['province', 'provinces', []],
  ['city', 'cities', ['provinceCode']],
  ['area', 'areas', ['cityCode', 'provinceCode']],
  ['street', 'streets', ['areaCode', 'cityCode', 'provinceCode']],
  ['village', 'villages', ['streetCode', 'areaCode', 'cityCode', 'provinceCode']]
]

function csvCell (value) {
  if (value == null) return ''
  const text = String(value)
  return /[^\x20-\x7e]|[,"\r\n]/.test(text)
    ? '"' + text.replace(/"/g, '""') + '"'
    : text
}

function serialize (rows, columns, format) {
  if (format === 'json') {
    return JSON.stringify(rows.map(row => Object.fromEntries(columns.map(key => [key, row[key]]))))
  }
  if (format !== 'csv') throw new Error('Format must be csv or json')
  return [columns.join(','), ...rows.map(row => columns.map(key => csvCell(row[key])).join(','))].join('\n') + '\n'
}

async function exportData (format, database = path.resolve(__dirname, '../dist/data.sqlite'), directory = path.resolve(__dirname, '../dist')) {
  if (!['csv', 'json'].includes(format)) throw new Error('Format must be csv or json')
  const db = await new Promise((resolve, reject) => {
    const connection = new sqlite3.Database(database, sqlite3.OPEN_READONLY, err => err ? reject(err) : resolve(connection))
  })
  try {
    for (const [table, file, parents] of tables) {
      const columns = ['code', 'name', ...parents]
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT ${columns.join(',')} FROM ${table} ORDER BY code`, (err, rows) => err ? reject(err) : resolve(rows))
      })
      await fs.writeFile(path.join(directory, `${file}.${format}`), serialize(rows, columns, format))
    }
  } finally {
    await new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()))
  }
}

module.exports = { exportData, serialize }

if (require.main === module) {
  exportData(process.argv[2]).catch(err => {
    console.error(err)
    process.exitCode = 1
  })
}
