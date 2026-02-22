/**
 * 금시세 통계값을 이용해 시각화 이미지(PNG) 생성
 */

import puppeteer from 'puppeteer'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT_JSON = join(__dirname, 'gold-prices.json')
const OUTPUT_IMAGE = join(__dirname, 'gold-stats.png')

function parseNum(v) {
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : NaN
}
function isValidDateStr(s) {
  return s && /^\d{4}-\d{2}-\d{2}$/.test(String(s).trim())
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
  if (!arr.length) return { mean: 0, min: 0, max: 0, median: 0, std: 0 }
  const sorted = [...arr].sort((a, b) => a - b)
  const sum = arr.reduce((a, b) => a + b, 0)
  const mean = sum / arr.length
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  const variance = arr.reduce((acc, x) => acc + (x - mean) ** 2, 0) / arr.length
  const std = Math.sqrt(variance)
  return {
    mean: Math.round(mean * 100) / 100,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: Math.round(median * 100) / 100,
    std: Math.round(std * 100) / 100,
  }
}

function buildHTML(buyStat, sellStat, periodLabel) {
  const labels = ['평균', '최소', '최대', '중앙값']
  const buyValues = [buyStat.mean, buyStat.min, buyStat.max, buyStat.median]
  const sellValues = [sellStat.mean, sellStat.min, sellStat.max, sellStat.median]
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; margin: 0; background: #fff; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    .period { color: #666; font-size: 13px; margin-bottom: 20px; }
    #container { width: 800px; height: 450px; }
  </style>
</head>
<body>
  <h1>금시세 통계값 시각화 (3.75g 기준)</h1>
  <p class="period">${periodLabel}</p>
  <div id="container"><canvas id="chart"></canvas></div>
  <script>
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
          {
            label: '살 때 가격',
            data: ${JSON.stringify(buyValues)},
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          },
          {
            label: '팔 때 가격',
            data: ${JSON.stringify(sellValues)},
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.raw.toLocaleString() + '원'; } } }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: { callback: function(v) { return v.toLocaleString() + '원'; } }
          }
        }
      }
    });
  </script>
</body>
</html>`
}

async function main() {
  if (!existsSync(INPUT_JSON)) {
    console.error('gold-prices.json 이 없습니다. 먼저 npm run crawl 을 실행하세요.')
    process.exit(1)
  }
  const raw = JSON.parse(readFileSync(INPUT_JSON, 'utf-8'))
  const rows = Array.isArray(raw) ? raw : []
  const validRows = filterValidRows(rows)
  const rowsToUse = validRows.length > 0 ? validRows : rows

  const buyPrices = rowsToUse.map((r) => parseNum(r.buyPrice)).filter(Number.isFinite)
  const sellPrices = rowsToUse.map((r) => parseNum(r.sellPrice)).filter(Number.isFinite)
  const buyStat = stats(buyPrices)
  const sellStat = stats(sellPrices)

  const dates = rowsToUse.map((r) => r.date).filter(Boolean)
  const startDate = dates.length ? dates.reduce((a, b) => (a < b ? a : b), dates[0]) : '-'
  const endDate = dates.length ? dates.reduce((a, b) => (a > b ? a : b), dates[0]) : '-'
  const periodLabel = `기간: ${startDate} ~ ${endDate}  |  유효 데이터: ${rowsToUse.length}건`

  const html = buildHTML(buyStat, sellStat, periodLabel)
  const htmlPath = join(__dirname, 'chart-temp.html')
  writeFileSync(htmlPath, html, 'utf-8')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 840, height: 520 })
    const fileUrl = pathToFileURL(htmlPath).href
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 10000 })
    await new Promise((r) => setTimeout(r, 800))
    const el = await page.$('#container')
    if (el) {
      await el.screenshot({ path: OUTPUT_IMAGE })
      console.log('시각화 이미지 저장:', OUTPUT_IMAGE)
    } else {
      await page.screenshot({ path: OUTPUT_IMAGE, fullPage: false })
      console.log('시각화 이미지 저장:', OUTPUT_IMAGE)
    }
  } finally {
    await browser.close()
    try {
      unlinkSync(htmlPath)
    } catch (_) {}
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
