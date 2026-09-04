# DH-S-GREAM

상담 리드용 로컬 웹 CRM MVP (Next.js + Prisma + SQLite)

## 설치 및 실행

1. npm install
2. npx prisma db push
3. npm run seed
4. npm run dev
Open http://localhost:3000

## Env
DATABASE_URL=file:./dev.db

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
