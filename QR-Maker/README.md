# QR Maker

URL 또는 텍스트를 입력하면 QR 코드를 생성하고 PNG로 다운로드할 수 있는 웹 앱입니다.  
브라우저에서만 동작하며, 서버 없이 `index.html`을 열어도 됩니다.

## 사용 방법

### 1) 로컬 서버로 실행 (권장)

```bash
cd QR-Maker
npm start
```

브라우저에서 **http://localhost:3333** 으로 접속합니다.

### 2) HTML 파일 직접 열기

`index.html`을 더블클릭하거나 브라우저로 드래그해서 열 수 있습니다.  
(CDN에서 스크립트를 불러오므로 인터넷 연결이 필요합니다.)

## 기능

- **내용 입력**: URL 또는 아무 텍스트 입력
- **크기 선택**: 작게(128px), 보통(256px), 크게(512px)
- **QR 생성**: "QR 생성" 버튼 또는 입력 후 Enter
- **PNG 다운로드**: 생성된 QR 코드를 `qrcode.png`로 저장
- **다시 만들기**: 내용/크기 변경 후 다시 생성

## 기술

- 순수 HTML / CSS / JavaScript (ES Module)
- [qrcode](https://www.npmjs.com/package/qrcode) (jsDelivr ESM CDN)
- 폰트: [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)

## 요구 사항

- 최신 브라우저 (ES Module 지원)
- 인터넷 연결 (CDN 로드용)
