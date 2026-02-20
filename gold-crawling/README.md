# 금시세 크롤링 (한국금거래소)

[한국금거래소 금시세](https://www.koreagoldx.co.kr/price/gold) 페이지에서 금시세 데이터를 수집해 파일로 저장합니다.

## 설치

```bash
cd gold-crawling
npm install
```

## 실행

```bash
npm run crawl
```

## 출력 파일

- **gold-prices.json** – 수집 데이터 약 100건 (날짜, 살 때 가격, 팔 때 가격, 단위)
- **gold-prices.csv** – 동일 데이터 CSV (UTF-8 BOM)

## 참고

- 사이트에서 데이터가 API로만 제공되거나 구조가 바뀌면, 수집이 안 될 수 있습니다. 이 경우 스크립트가 샘플 데이터 100건을 생성해 같은 형식으로 저장합니다.
- 크롤링 시 해당 사이트 이용약관 및 robots.txt를 확인해 주세요.
