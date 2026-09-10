const https = require('https')
const zlib = require('zlib')

const iconv = require('iconv-lite')
const minify = require('html-minifier').minify
const BufferHelper = require('bufferhelper')

/*
 * 命名简写备注
 *
 * 省级（省份，Province）           p
 * 地级（城市，City）               c
 * 县级（区县，Area）               a
 * 乡级（乡镇街道，Street）         s
 * 村级（村委会居委会，Village）    v
 */

const pReg = /<td><a href='(.*?).html'>(.*?)<br><\/a><\/td>/g
const casReg = /<tr class='.*?'><td><a href=.*?>(.*?)<\/a><\/td><td><a href=.*?>(.*?)<\/a><\/td><\/tr>/g
const vReg = /<tr class='.*?'><td>(.*?)<\/td><td>.*?<\/td><td>(.*?)<\/td><\/tr>/g

const host = 'www.stats.gov.cn'
const path = '/sj/tjbz/tjyqhdmhcxhfdm/2023/#{route}.html'

/**
 * 抓取数据
 * @author modood <https://github.com/modood>
 * @datetime 2018-01-31 19:23
 */
exports.fetch = (host, route, regexp, codeLen) =>
  new Promise((resolve, reject) => https.get({
    host,
    path: path.replace('#{route}', route),
    timeout: 3000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  }, res => {
    const bufferHelper = new BufferHelper()
    const statusCode = res.statusCode

    // 302 Move Temporarily
    // 这种情况一般重试就可以了，所以视为超时统一重试处理
    if (statusCode === 302) {
      res.resume()
      return reject(new Error('timeout'))
    }

    if (statusCode !== 200) {
      res.resume()
      return reject(new Error('Request Failed. Status Code: ' + statusCode))
    }

    res.on('data', chunk => bufferHelper.concat(chunk))

    res.on('end', () => {
      let raw = iconv.decode(bufferHelper.toBuffer(), 'UTF-8')
      if (!raw.includes('国家统计局')) {
        try {
          raw = iconv.decode(zlib.gunzipSync(bufferHelper.toBuffer()), 'UTF-8')
        } catch (err) {
          return reject(err)
        }
      }
      const rawData = minify(raw, { collapseWhitespace: true, quoteCharacter: '\'' })

      const result = {}
      let current
      while ((current = regexp.exec(rawData)) !== null) result[current[1].substr(0, codeLen)] = current[2].trim()
      if (Object.keys(result).length === 0) {
        if (raw.includes('请开启JavaScript并刷新该页')) {
          console.log('\n温馨提示：请求过于频繁已被目标网站限制，当前抓取进度已保存，请五分钟后再试...\n')
          return reject(new Error('Rate limited / JS Challenge detected'))
        }
      }

      return resolve(result)
    })
  }).on('error', reject).on('timeout', () => reject(new Error('timeout'))))

/**
 * 抓取省级数据
 * @author modood <https://github.com/modood>
 * @datetime 2018-01-31 19:40
 */
exports.fetchProvinces = async (retries = 3) => {
  try {
    return await exports.fetch(host, 'index', pReg, 2)
  } catch (err) {
    if (retries <= 0) throw err
    if (err.message !== 'timeout') console.log(`抓取省级数据失败（${err}），正在重试...`)
    return exports.fetchProvinces(retries - 1)
  }
}

/**
 * 抓取地级数据
 * @author modood <https://github.com/modood>
 * @datetime 2018-01-31 19:51
 */
exports.fetchCities = async (pCode, retries = 3) => {
  try {
    return await exports.fetch(host, pCode, casReg, 4)
  } catch (err) {
    if (retries <= 0) throw err
    if (err.message !== 'timeout') console.log(`抓取省级（${pCode}）的地级数据失败（${err}），正在重试...`)
    return exports.fetchCities(pCode, retries - 1)
  }
}

/**
 * 抓取县级数据
 * @author modood <https://github.com/modood>
 * @datetime 2018-01-31 20:03
 */
exports.fetchAreas = async (cCode, retries = 3) => {
  cCode = cCode.toString()
  const pCode = cCode.substr(0, 2)

  try {
    return await exports.fetch(host, `${pCode}/${cCode}`, casReg, 6)
  } catch (err) {
    if (retries <= 0) throw err
    if (err.message !== 'timeout') console.log(`抓取地级（${cCode}）的县级数据失败（${err}），正在重试...`)
    return exports.fetchAreas(cCode, retries - 1)
  }
}

/**
 * 抓取乡级数据
 * @author modood <https://github.com/modood>
 * @datetime 2018-01-31 20:08
 */
exports.fetchStreets = async (aCode, route, retries = 3) => {
  aCode = aCode.toString()
  const pCode = aCode.substr(0, 2)
  const cCodeSuffix = aCode.substr(2, 2)
  const _route = route || `${pCode}/${cCodeSuffix}/${aCode}`

  try {
    return await exports.fetch(host, _route, casReg, 9)
  } catch (err) {
    if (retries <= 0) throw err
    if (err.message !== 'timeout') console.log(`抓取县级（${aCode}）的乡级数据失败（${err}），正在重试...`)
    return exports.fetchStreets(aCode, route, retries - 1)
  }
}

/**
 * 抓取村级数据
 * @author modood <https://github.com/modood>
 * @datetime 2018-01-31 20:19
 */
exports.fetchVillages = async (sCode, route, retries = 3) => {
  sCode = sCode.toString()
  const pCode = sCode.substr(0, 2)
  const cCodeSuffix = sCode.substr(2, 2)
  const aCodeSuffix = sCode.substr(4, 2)
  const _route = route || `${pCode}/${cCodeSuffix}/${aCodeSuffix}/${sCode}`

  try {
    return await exports.fetch(host, _route, vReg, 12)
  } catch (err) {
    if (retries <= 0) throw err
    if (err.message !== 'timeout') console.log(`抓取乡级（${sCode}）的村级数据失败（${err}），正在重试...`)
    return exports.fetchVillages(sCode, route, retries - 1)
  }
}
