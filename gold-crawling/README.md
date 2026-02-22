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
- **gold-prices.xlsx** – 엑셀 파일 (아래 `npm run excel` 로 생성)

## 엑셀 파일 생성 (통계 포함)

```bash
npm run excel
```

`gold-prices.json`을 읽어 **gold-prices.xlsx**를 만듭니다.

- **시트 "금시세 데이터"**: 날짜, 살 때 가격(3.75g), 팔 때 가격(3.75g), 단위
- **시트 "통계"**: 기간, 유효 데이터 건수, **평균·최소·최대·중앙값·표준편차** (살 때/팔 때 각각)

## 시각화 이미지 생성

```bash
npm run visualize
```

엑셀과 동일한 통계값(평균, 최소, 최대, 중앙값)을 사용해 **막대 차트**를 그리고 `gold-stats.png`로 저장합니다. (살 때 가격 / 팔 때 가격 비교)

## 참고

- 사이트에서 데이터가 API로만 제공되거나 구조가 바뀌면, 수집이 안 될 수 있습니다. 이 경우 스크립트가 샘플 데이터 100건을 생성해 같은 형식으로 저장합니다.
- 크롤링 시 해당 사이트 이용약관 및 robots.txt를 확인해 주세요.
