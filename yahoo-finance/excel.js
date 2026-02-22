/**
 * 크롤링한 Yahoo Finance 상승주 데이터를 엑셀 파일로 저장 (ExcelJS 사용)
 */

import ExcelJS from 'exceljs'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT_JSON = join(__dirname, 'stock-gainers.json')
const OUTPUT_XLSX = join(__dirname, 'stock-gainers.xlsx')

function loadData() {
  if (!existsSync(INPUT_JSON)) {
    throw new Error('stock-gainers.json 이 없습니다. 먼저 npm run crawl 을 실행하세요.')
  }
  const raw = JSON.parse(readFileSync(INPUT_JSON, 'utf-8'))
  return Array.isArray(raw) ? raw : []
}

async function main() {
  const rows = loadData()

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Top Gainers', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  if (rows.length === 0) {
    sheet.addRow(['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Volume', 'Avg Vol (3M)', 'Market Cap', 'P/E Ratio (TTM)', '52 Wk Change %', '52 Wk Range'])
  } else {
    const headers = Object.keys(rows[0])
    sheet.addRow(headers)
    sheet.getRow(1).font = { bold: true }
    rows.forEach((r) => sheet.addRow(headers.map((h) => r[h] ?? '')))
  }

  sheet.columns = [
    { width: 8 },
    { width: 35 },
    { width: 18 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 18 },
  ]

  await workbook.xlsx.writeFile(OUTPUT_XLSX)
  console.log('엑셀 저장:', OUTPUT_XLSX)
  console.log('데이터 행 수:', rows.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
