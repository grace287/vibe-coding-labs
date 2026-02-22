/**
 * 크롤링한 금시세 데이터를 엑셀 파일로 저장하고 통계값을 계산해 기록
 */

import XLSX from 'xlsx'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT_JSON = join(__dirname, 'gold-prices.json')
const OUTPUT_XLSX = join(__dirname, 'gold-prices.xlsx')

// 날짜 형식 검사 (YYYY-MM-DD)
function isValidDateStr(s) {
  if (!s || typeof s !== 'string') return false
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim())
}

// 숫자로 파싱 (금 가격은 보통 5자리 이상)
function parseNum(v) {
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : NaN
}

function loadData() {
  if (!existsSync(INPUT_JSON)) {
    throw new Error('gold-prices.json 이 없습니다. 먼저 npm run crawl 을 실행하세요.')
  }
  const raw = JSON.parse(readFileSync(INPUT_JSON, 'utf-8'))
  return Array.isArray(raw) ? raw : []
}

function filterValidRows(rows) {
  return rows.filter((r) => {
    const date = r.date != null ? String(r.date).trim() : ''
    const buy = parseNum(r.buyPrice)
    const sell = parseNum(r.sellPrice)
    return isValidDateStr(date) && Number.isFinite(buy) && Number.isFinite(sell) && buy > 0 && sell > 0
  })
}

function stats(arr) {
  if (!arr.length) return { mean: NaN, min: NaN, max: NaN, median: NaN, std: NaN, count: 0 }
  const sorted = [...arr].sort((a, b) => a - b)
  const sum = arr.reduce((a, b) => a + b, 0)
  const mean = sum / arr.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  const variance = arr.reduce((acc, x) => acc + (x - mean) ** 2, 0) / arr.length
  const std = Math.sqrt(variance)
  return { mean, min, max, median, std, count: arr.length }
}

function formatNum(n) {
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : ''
}

function buildDataSheet(rows) {
  const headers = ['날짜', '살 때 가격(3.75g)', '팔 때 가격(3.75g)', '단위']
  const data = rows.map((r) => [
    r.date,
    parseNum(r.buyPrice),
    parseNum(r.sellPrice),
    r.unit || '3.75g',
  ])
  return [headers, ...data]
}

function buildStatsSheet(rows) {
  const buyPrices = rows.map((r) => parseNum(r.buyPrice)).filter(Number.isFinite)
  const sellPrices = rows.map((r) => parseNum(r.sellPrice)).filter(Number.isFinite)
  const buyStat = stats(buyPrices)
  const sellStat = stats(sellPrices)

  const dates = rows.map((r) => r.date).filter(Boolean)
  const startDate = dates.length ? dates.reduce((a, b) => (a < b ? a : b), dates[0]) : ''
  const endDate = dates.length ? dates.reduce((a, b) => (a > b ? a : b), dates[0]) : ''

  return [
    ['금시세 통계값 계산 결과', ''],
    ['기간', `${startDate} ~ ${endDate}`],
    ['유효 데이터 건수', rows.length],
    [''],
    ['구분', '살 때 가격(3.75g)', '팔 때 가격(3.75g)'],
    ['평균', formatNum(buyStat.mean), formatNum(sellStat.mean)],
    ['최소', formatNum(buyStat.min), formatNum(sellStat.min)],
    ['최대', formatNum(buyStat.max), formatNum(sellStat.max)],
    ['중앙값', formatNum(buyStat.median), formatNum(sellStat.median)],
    ['표준편차', formatNum(buyStat.std), formatNum(sellStat.std)],
    ['데이터 개수', buyStat.count, sellStat.count],
    [''],
    ['※ 위 통계값은 유효한 날짜·가격 데이터만 사용해 계산되었습니다.', ''],
  ]
}

function main() {
  const allRows = loadData()
  const validRows = filterValidRows(allRows)
  const rowsToUse = validRows.length > 0 ? validRows : allRows

  const dataArr = buildDataSheet(rowsToUse)
  const statsArr = buildStatsSheet(rowsToUse)

  const wsData = XLSX.utils.aoa_to_sheet(dataArr)
  const wsStats = XLSX.utils.aoa_to_sheet(statsArr)

  wsData['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 8 }]
  wsStats['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 20 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsData, '금시세 데이터')
  XLSX.utils.book_append_sheet(wb, wsStats, '통계')

  XLSX.writeFile(wb, OUTPUT_XLSX)
  console.log('엑셀 저장:', OUTPUT_XLSX)
  console.log('데이터 시트: 금시세 데이터 (행 수:', rowsToUse.length, ')')
  console.log('통계 시트: 평균, 최소, 최대, 중앙값, 표준편차 기록 완료')
}

main()
