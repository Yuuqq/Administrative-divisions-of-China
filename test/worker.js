const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const Sequelize = require('sequelize')

function setup (codes, failure) {
  const calls = []
  const pages = []
  const inserted = []
  const Province = {
    count: async options => options ? codes.length : 1,
    findAll: async options => {
      pages.push(options)
      const after = options.where[Sequelize.Op.and]?.[1].code[Sequelize.Op.gt]
      return codes.filter(code => after === undefined || code > after)
        .slice(0, options.limit).map(code => ({ code, dataValues: { code, name: code } }))
    }
  }
  const City = {
    aggregate: async () => {
      if (failure) throw failure
      return []
    },
    bulkCreate: async rows => inserted.push(...rows)
  }
  const context = {
    exports: {},
    console: { log () {} },
    require: name => {
      if (name === 'sequelize') return Sequelize
      if (name === './sqlite') return { Province, City }
      if (name === './crawler') return { fetchCities: async code => { calls.push(code); return { [code + '01']: 'city' } } }
      throw new Error(name)
    }
  }
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../lib/worker.js'), 'utf8'), context)
  return { worker: context.exports, calls, pages, inserted }
}

describe('worker pagination with native promises', () => {
  it('walks code-ordered pages without duplicates', async () => {
    const codes = Array.from({ length: 201 }, (_, i) => String(i).padStart(3, '0'))
    const { worker, calls, pages, inserted } = setup(codes)
    await worker.fetchCities()
    assert.deepStrictEqual(calls, codes)
    assert.strictEqual(inserted.length, codes.length)
    assert.strictEqual(pages.length, 3)
    for (const page of pages) {
      assert.strictEqual(JSON.stringify(page.order), '[["code","ASC"]]')
      assert.strictEqual(page.limit, 100)
    }
  })

  it('does not fetch when no parents remain', async () => {
    const { worker, pages, calls } = setup([])
    await worker.fetchCities()
    assert.strictEqual(pages.length, 0)
    assert.strictEqual(calls.length, 0)
  })

  it('propagates database errors', async () => {
    const error = new Error('database failed')
    const { worker } = setup([], error)
    await assert.rejects(worker.fetchCities(), err => err === error)
  })
})
