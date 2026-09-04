# DH-S-GREAM

상담 리드용 로컬 웹 CRM MVP (Next.js + Prisma + SQLite)

## 설치 및 실행

1. npm install
2. npx prisma db push
3. npm run seed
4. npm run dev
Open http://localhost:3000

## Env
기본: `DATABASE_URL=file:./dev.db` (프로젝트 루트 `dev.db`)

외부 드라이브에 DB·시트 미러를 두려면 `.env` 예시:

```
DATABASE_URL="file:D:/path/to/crm-data/dev.db"
GOOGLE_SOURCE_XLSX="D:/path/to/crm-data/google-source.xlsx"
CRM_DATA_DIR="D:/path/to/crm-data"
```

자세한 설명: [data/README.md](data/README.md)

## Seed
Loads 25 customers from prisma/data/dohyun_2cha_sep.json

## CSV
Import via UI with flexible Korean headers


## 상담단계

신규, 부재, 통화예약, 재상담, 1차서류 안내, 1차 서류 도착, 관리, 내방상담, 출장상담, 계약, 취소, 자격불가, 진행불가, 종료

## CSV 가져오기

앱 UI에서 CSV 가져오기. 헤더: 이름/표시명, 연락처/전화번호, 신청일/날짜, 담당자, 상담단계/상태, 지역, 채무액, 직업, 유입경로/타이틀, 메모/2차상담
## 참고
로컬 MVP, 인증 없음. 개인정보 취급에 유의하세요.

## 구글 시트 동기화 (원클릭)

1. 실장님에게 「시트 동기화」를 요청해 `data/google-source.xlsx` 를 최신으로 받습니다.
2. 앱에서 **「구글 시트에서 가져오기」** 버튼을 누릅니다.
3. `2차` 탭 중 담당자에 `김도현`이 포함된 행이 SQLite에 업서트됩니다.

자세한 설명: [data/README.md](data/README.md)
