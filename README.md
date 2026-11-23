# Administrative-divisions-of-China

[![code style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/v/china-division.svg)](https://www.npmjs.com/package/china-division)
[![downloads](https://img.shields.io/npm/dt/china-division.svg)](https://www.npmjs.com/package/china-division)
[![license](https://img.shields.io/badge/license-WTFPL%20--%20Do%20What%20the%20Fuck%20You%20Want%20to%20Public%20License-green.svg)](https://raw.githubusercontent.com/Yuuqq/Administrative-divisions-of-China/master/LICENSE)

中华人民共和国行政区划（五级）：省级、地级、县级、乡级和村级。

## 数据来源

【温馨提醒：本项目数据不再更新】
>
> 根据国务院批复同意的《关于统计上划分城乡的规定》（国函〔2008〕60号）及国家统计局印发的《统计用区划代码和城乡划分代码编制规则》（国统字〔2009〕91号），统计用区划代码和城乡划分代码是开展各项普查、全面统计、抽样调查、专项调查等政府统计工作的基础，属于工作中使用的内部资料，不适用于向全社会公开。根据国家统计局政府信息公开相关要求，**自2024年10月起，国家统计局继续公开《关于统计上划分城乡的规定》《统计用区划代码和城乡划分代码编制规则》等统计标准方法，不再公开具体相关代码。**
>

*   国家统计局：
    * 中华人民共和国国家统计局-统计用区划和城乡划分代码
    * [中华人民共和国国家统计局-统计用区划代码和城乡划分代码编制规则](http://www.stats.gov.cn/sj/tjbz/gjtjbz/202302/t20230213_1902741.html)
*   本项目已更新至：
    * 2023年统计用区划代码和城乡划分代码（截止时间：2023-06-30，发布时间：2023-09-11）

## 数据下载

| 文件列表                     | JSON | CSV |
|:-----------------------------|:-----|:----|
| 省级（省份、直辖市、自治区） | [provinces.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/provinces.json) | [provinces.csv](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/provinces.csv) |
| 地级（城市）                 | [cities.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/cities.json) | [cities.csv](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/cities.csv) |
| 县级（区县）                 | [areas.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/areas.json) | [areas.csv](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/areas.csv) |
| 乡级（乡镇、街道）           | [streets.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/streets.json) | [streets.csv](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/streets.csv) |
| 村级（村委会、居委会）       | [villages.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/villages.json) | [villages.csv](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/villages.csv) |

| 文件列表                                    | 普通 | 带编码 |
|:--------------------------------------------|:-----|:-------|
| “省份、城市” 二级联动数据                   | [pc.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/pc.json) | [pc-code.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/pc-code.json) |
| “省份、城市、区县” 三级联动数据             | [pca.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/pca.json) | [pca-code.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/pca-code.json) |
| “省份、城市、区县、乡镇” 四级联动数据       | [pcas.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/pcas.json) | [pcas-code.json](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/pcas-code.json) |
| “省份、城市、区县、乡镇、村庄” 五级联动数据 | - | - |

> 提示：需要打包下载全部文件，请看 [Releases](https://github.com/Yuuqq/Administrative-divisions-of-China/releases)。

### 数据格式与范围

* 五级平铺 JSON 均为对象数组，字段见下方数据预览。`code` 及各级关联编码均为字符串，省、地、县、乡、村级编码长度分别为 2、4、6、9、12 位。
* CSV 含表头；字段顺序以文件首行为准，乡级为 `code,name,areaCode,cityCode,provinceCode`，村级为 `code,name,streetCode,areaCode,cityCode,provinceCode`。
* 普通联动数据以名称为键，最末级为名称数组；带编码的联动数据为对象数组，节点包含 `code`、`name`，非末级节点另有 `children` 数组。
* 联动数据经过实用性处理，并非严格逐级对应统计层级：二级联动会将“市辖区”“县”“省直辖县级行政区划”“自治区直辖县级行政区划”替换为其下属县级；三级联动中，东莞市、中山市、儋州市、嘉峪关市使用乡级补充第三级。三级和四级联动中的乡级名称会去掉“办事处”。
* 主数据包含大陆 31 个省级行政区。港澳台名称联动数据单独保存在 [HK-MO-TW.json](dist/HK-MO-TW.json)，不包含编码，也不由构建脚本生成；该文件不在 npm 包入口的导出项中，其来源和更新日期未在代码中注明，不应直接套用上述 2023 年统计数据日期。

## Node.js 使用

```sh
npm install china-division
```

```js
const { provinces, cities, areas, streets, villages, pc, pcC, pca, pcaC, pcas, pcasC } = require('china-division')

console.log(provinces[0]) // { code: '11', name: '北京市' }
```

`provinces`、`cities`、`areas`、`streets`、`villages` 对应五级平铺 JSON；`pc`、`pca`、`pcas` 对应普通联动 JSON，`pcC`、`pcaC`、`pcasC` 分别对应 `pc-code.json`、`pca-code.json`、`pcas-code.json`。入口按需读取 JSON；只访问 `provinces` 不会加载村级数据。

## 开发与数据导出

源码位于 `lib/`，测试位于 `test/`，数据库及导出文件位于 `dist/`。在仓库根目录安装开发依赖：

```sh
npm install
```

导出脚本通过 npm 开发依赖 `sqlite3` 读取数据库，不需要安装 `sqlite3` 命令行工具。CI 使用 Node.js 18、20 和 22 运行测试。

| 命令 | 作用 |
|:-----|:-----|
| `npm run csv` | 从 `dist/data.sqlite` 导出五级 CSV（含表头） |
| `npm run json` | 从 `dist/data.sqlite` 导出五级平铺 JSON |
| `npm run format` | 从数据库生成二、三、四级普通及带编码联动 JSON，不是代码格式化命令 |
| `npm run build` | 依次执行 `csv`、`json`、`format`，不抓取网络数据 |
| `npm test` | 先执行 ESLint，再执行 Mocha 测试 |
| `npm run fetch` | 历史抓取入口，目标为国家统计局 2023 年页面，写入 `dist/data.sqlite` |

> 注意：导出和构建会覆盖 `dist/` 中对应文件，操作前请备份数据库和数据文件。抓取脚本保留用于参考；鉴于上文所述国家统计局已停止公开具体代码，不应将 `npm run fetch` 作为获取最新数据的方式。

## 数据库支持

目前本项目数据保存在 sqlite3，数据文件下载：[data.sqlite](https://github.com/Yuuqq/Administrative-divisions-of-China/blob/master/dist/data.sqlite)。

可以自己将数据迁移到其他数据库管理系统中（MySQL, Oracle, MSSQL 等）。

**省级数据预览**

| code | name           |
|:-----|:---------------|
| 13   | 河北省         |
| 14   | 山西省         |
| 15   | 内蒙古自治区   |
| 45   | 广西壮族自治区 |

**地级数据预览**

| code | name       | provinceCode |
|:-----|:-----------|:-------------|
| 1301 | 石家庄市   | 13           |
| 1401 | 太原市     | 14           |
| 1525 | 锡林郭勒盟 | 15           |
| 4503 | 桂林市     | 45           |

**县级数据预览**

| code   | name     | cityCode | provinceCode |
|:-------|:---------|:---------|:-------------|
| 130111 | 栾城区   | 1301     | 13           |
| 140121 | 清徐县   | 1401     | 14           |
| 152527 | 太仆寺旗 | 1525     | 15           |
| 450305 | 七星区   | 4503     | 45           |

**乡级数据预览**

| code      | name           | areaCode | cityCode | provinceCode |
|:----------|:---------------|:---------|:---------|:-------------|
| 130111200 | 南高乡         | 130111   | 1301     | 13           |
| 140121102 | 东于镇         | 140121   | 1401     | 14           |
| 152527201 | 贡宝拉格苏木   | 152527   | 1525     | 15           |
| 450305004 | 漓东街道办事处 | 450305   | 4503     | 45           |

**村级数据预览**

| code         | name           | streetCode | areaCode | cityCode | provinceCode |
|:-------------|:---------------|:-----------|:---------|:---------|:-------------|
| 130111200201 | 南高村委会     | 130111200  | 130111   | 1301     | 13           |
| 140121102001 | 东于社区居委会 | 140121102  | 140121   | 1401     | 14           |
| 152527201206 | 敦达乌苏嘎查   | 152527201  | 152527   | 1525     | 15           |
| 450305004006 | 横塘社区       | 450305004  | 450305   | 4503     | 45           |
