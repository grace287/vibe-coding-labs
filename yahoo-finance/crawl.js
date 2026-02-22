/**
 * Yahoo Finance Top Gainers 크롤링
 * https://finance.yahoo.com/markets/stocks/gainers/
 * 테이블 데이터 수집 후 JSON 저장
 */

import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TARGET_URL = 'https://finance.yahoo.com/markets/stocks/gainers/?guccounter=1&start=0&count=25'
const OUTPUT_JSON = join(__dirname, 'stock-gainers.json')

async function crawlGainers() {
  console.log('크롤링 시작:', TARGET_URL)
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  console.log('브라우저 시작됨')

  let rows = []
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    console.log('페이지 로딩 중...')
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await new Promise((r) => setTimeout(r, 5000))
    try {
      await page.waitForSelector('table tbody tr', { timeout: 15000 })
    } catch (_) {}

    console.log('테이블 추출 중...')
    rows = await page.evaluate(() => {
      const result = []
      const table =
        document.querySelector('table[class*="W(100%)"]') ||
        document.querySelector('#fin-scr-res-table table') ||
        document.querySelector('table')
      if (!table) return result

      const headerCells = table.querySelectorAll('thead th, thead td')
      let headers = Array.from(headerCells).map((th) => th.textContent?.replace(/\s+/g, ' ').trim() || '').filter(Boolean)
      if (headers.length === 0)
        headers = [
          'Symbol',
          'Name',
          'Price',
          'Change',
          'Change %',
          'Volume',
          'Avg Vol (3M)',
          'Market Cap',
          'P/E Ratio (TTM)',
          '52 Wk Change %',
          '52 Wk Range',
        ]

      const trs = table.querySelectorAll('tbody tr')
      trs.forEach((tr) => {
        const cells = tr.querySelectorAll('td')
        const values = Array.from(cells).map((td) => {
          const link = td.querySelector('a[href*="/quote/"]')
          if (link && td.querySelectorAll('a').length <= 1) return link.textContent?.trim() || td.textContent?.replace(/\s+/g, ' ').trim() || ''
          return td.textContent?.replace(/\s+/g, ' ').trim() || ''
        })
        if (values.length === 0) return

        const row = {}
        headers.forEach((h, i) => {
          row[h] = values[i] ?? ''
        })
        result.push(row)
      })

      return result
    })
  } catch (e) {
    console.error('크롤링 중 오류:', e.message)
  } finally {
    await browser.close()
  }

  // 헤더가 비어 있으면 기본 컬럼명으로 매핑
  const defaultHeaders = [
    'Symbol',
    'Name',
    'Price',
    'Change',
    'Change %',
    'Volume',
    'Avg Vol (3M)',
    'Market Cap',
    'P/E Ratio (TTM)',
    '52 Wk Change %',
    '52 Wk Range',
  ]

  const normalized = rows.map((row) => {
      const entries = Object.entries(row)
      if (entries.length > 0 && entries.every(([, v]) => typeof v === 'string')) {
        const obj = {}
        entries.forEach(([k, v], i) => {
          const key = k || defaultHeaders[i] || `Col${i}`
          obj[key] = v
        })
        return obj
      }
      const arr = Object.values(row)
      const obj = {}
      defaultHeaders.forEach((h, i) => {
        obj[h] = arr[i] ?? ''
      })
      return obj
  })

  writeFileSync(OUTPUT_JSON, JSON.stringify(normalized, null, 2), 'utf-8')
  console.log('저장:', OUTPUT_JSON, '| 행 수:', normalized.length)
  return normalized
}

crawlGainers().catch((err) => {
  console.error(err)
  process.exit(1)
})
