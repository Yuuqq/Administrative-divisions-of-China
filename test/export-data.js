const assert = require('assert')
const { serialize, exportData } = require('../lib/export-data')

describe('data exporter', () => {
  const columns = ['code', 'name', 'provinceCode']
  const rows = [{ provinceCode: '01', name: '村,"名"\n\\', code: '001' }]

  it('escapes JSON and preserves column order', () => {
    const result = serialize(rows, columns, 'json')
    assert.deepStrictEqual(JSON.parse(result), rows)
    assert.deepStrictEqual(Object.keys(JSON.parse(result)[0]), columns)
  })

  it('escapes CSV quotes, commas and line breaks', () => {
    assert.strictEqual(serialize(rows, columns, 'csv'), 'code,name,provinceCode\n001,"村,""名""\n\\",01\n')
    assert.strictEqual(serialize([{ code: '1', name: 'plain', provinceCode: null }], columns, 'csv'), 'code,name,provinceCode\n1,plain,\n')
  })

  it('exports empty data', () => {
    assert.strictEqual(serialize([], columns, 'json'), '[]')
    assert.strictEqual(serialize([], columns, 'csv'), 'code,name,provinceCode\n')
  })

  it('rejects invalid formats and missing databases', async () => {
    assert.throws(() => serialize([], columns, 'xml'), /Format/)
    await assert.rejects(exportData('xml'), /Format/)
    await assert.rejects(exportData('json', '/nonexistent/china-division.sqlite'), /SQLITE_CANTOPEN/)
  })
})
