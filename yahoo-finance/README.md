# Yahoo Finance 상승주 크롤링

[Yahoo Finance Top Gainers](https://finance.yahoo.com/markets/stocks/gainers/?guccounter=1&start=0&count=25) 페이지에서 상승주 테이블 데이터를 크롤링해 JSON·엑셀 파일로 저장합니다.

## 사용 방법

```bash
# 의존성 설치 (최초 1회)
npm install

# 1) 크롤링만 실행 → stock-gainers.json 생성
npm run crawl

# 2) JSON을 엑셀으로 변환 → stock-gainers.xlsx 생성
npm run excel

# 한 번에 크롤링 + 엑셀 생성
npm start
```

## 출력 파일

| 파일 | 설명 |
|------|------|
| `stock-gainers.json` | 크롤링한 상승주 원본 데이터 (JSON) |
| `stock-gainers.xlsx` | 엑셀 시트 "Top Gainers" (Symbol, Name, Price, Change, Change %, Volume 등) |

## 컬럼 설명

- **Symbol** – 종목 심볼 (예: RNG, LGN)
- **Name** – 종목명
- **Price** – 현재가
- **Change** – 변동액
- **Change %** – 변동률
- **Volume** – 거래량
- **Avg Vol (3M)** – 3개월 평균 거래량
- **Market Cap** – 시가총액
- **P/E Ratio (TTM)** – 주가수익비율
- **52 Wk Change %** – 52주 변동률
- **52 Wk Range** – 52주 가격 범위
