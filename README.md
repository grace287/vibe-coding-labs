# Vibe Coding Labs

웹 크롤링·데이터 수집·엑셀/시각화 연습용 랩 프로젝트 모음입니다.  
각 프로젝트는 **Node.js (ESM)** + **Puppeteer** 기반으로 동작합니다.

## 프로젝트 목록

| 프로젝트 | 설명 |
|----------|------|
| [gold-crawling](./gold-crawling/) | 한국금거래소 금시세 크롤링 → JSON/CSV/엑셀, 통계·차트 이미지 생성 |
| [yahoo-finance](./yahoo-finance/) | Yahoo Finance 상승주(Top Gainers) 크롤링 → JSON/엑셀 |

## 공통 실행 흐름

각 폴더로 들어가서 의존성 설치 후 스크립트를 실행합니다.

```bash
cd <프로젝트 폴더>
npm install
npm run crawl   # 크롤링 (JSON 등 생성)
npm run excel   # 엑셀 생성 (해당 스크립트가 있는 경우)
```

## gold-crawling

- **대상**: [한국금거래소 금시세](https://www.koreagoldx.co.kr/price/gold)
- **출력**: `gold-prices.json`, `gold-prices.csv`, `gold-prices.xlsx`, `gold-stats.png`
- **스크립트**: `crawl` → `excel` → `visualize`  
- 자세한 사용법: [gold-crawling/README.md](./gold-crawling/README.md)

## yahoo-finance

- **대상**: [Yahoo Finance Top Gainers](https://finance.yahoo.com/markets/stocks/gainers/)
- **출력**: `stock-gainers.json`, `stock-gainers.xlsx`
- **스크립트**: `crawl`, `excel`, `dev`(크롤링+엑셀 한 번에)  
- 자세한 사용법: [yahoo-finance/README.md](./yahoo-finance/README.md)

## 요구 사항

- **Node.js** 18+ (ESM 사용)
- **npm** 7+

## 참고

- 크롤링 대상 사이트의 이용약관·robots.txt를 확인한 뒤 사용하세요.
- 사이트 구조·API 변경 시 스크립트 수정이 필요할 수 있습니다.
