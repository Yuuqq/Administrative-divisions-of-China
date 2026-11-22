const path = require('path')

const files = {
  // 省级（省份、直辖市、自治区）
  provinces: 'provinces.json',
  // 地级（城市）
  cities: 'cities.json',
  // 县级（区县）
  areas: 'areas.json',
  // 乡级（乡镇、街道）
  streets: 'streets.json',
  // 村级（村委会、居委会）
  villages: 'villages.json',
  // “省份、城市” 二级联动数据
  pc: 'pc.json',
  // “省份、城市” 二级联动数据（带编码）
  pcC: 'pc-code.json',
  // “省份、城市、区县” 三级联动数据
  pca: 'pca.json',
  // “省份、城市、区县” 三级联动数据（带编码）
  pcaC: 'pca-code.json',
  // “省份、城市、区县、乡镇” 四级联动数据
  pcas: 'pcas.json',
  // “省份、城市、区县、乡镇” 四级联动数据（带编码）
  pcasC: 'pcas-code.json'
}

for (const [key, file] of Object.entries(files)) {
  Object.defineProperty(module.exports, key, {
    enumerable: true,
    configurable: true,
    get () {
      const value = require(path.resolve(__dirname, '../dist', file))
      Object.defineProperty(module.exports, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      })
      return value
    },
    set (value) {
      Object.defineProperty(module.exports, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      })
    }
  })
}
