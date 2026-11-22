const assert = require('assert')
const { execFileSync } = require('child_process')

describe('lazy package exports', () => {
  it('loads only requested data and caches it', () => {
    execFileSync(process.execPath, ['-e', `
      const assert = require('assert')
      const data = require('.')
      assert.strictEqual(Object.keys(data).length, 11)
      assert.strictEqual(Object.keys(require.cache).filter(p => p.endsWith('.json')).length, 0)
      const first = data.pca
      assert.strictEqual(first, data.pca)
      assert.deepStrictEqual(Object.keys(require.cache).filter(p => p.endsWith('.json')), [require.resolve('./dist/pca.json')])
      data.pc = null
      assert.strictEqual(data.pc, null)
    `], { cwd: require('path').resolve(__dirname, '..') })
  })

  it('keeps all existing keys enumerable', () => {
    assert.deepStrictEqual(Object.keys(require('..')), ['provinces', 'cities', 'areas', 'streets', 'villages', 'pc', 'pcC', 'pca', 'pcaC', 'pcas', 'pcasC'])
  })
})
