# 구글 시트 미러 (data/google-source.xlsx)

로컬 CRM은 구글 시트에 직접 접속하지 않습니다.  
대신 이 폴더의 **`google-source.xlsx`** 파일을 읽어 SQLite에 반영합니다.

## 사용 방법 (원클릭)

1. 보드 화면에서 **「구글 시트에서 가져오기」** 버튼을 누릅니다.
2. CRM이 `data/google-source.xlsx` 의 **「2차」** 시트를 읽고, 기본으로 담당자에 **김도현**이 포함된 행만 업서트합니다.
3. 완료되면 한국어 안내(토스트/알림)로 신규·갱신 건수가 표시됩니다.

## 미러 파일 갱신 (실장님)

로컬 버튼은 **이미 저장된 Excel**만 적용합니다.  
구글 시트의 최신 내용을 받으려면 실장님(Grok)에게 채팅으로 **「시트 동기화」** 라고 요청하세요.  
실장님이 Google Sheet를 내려받아 `data/google-source.xlsx` 를 교체해 드립니다.

원본 시트: 드림V2x내일마케팅컴퍼니 (탭: **2차**)

## 참고

- 파일은 용량이 커서 git에 올리지 않습니다. Windows PC에는 별도로 복사해 주세요.
- CSV 가져오기 기능은 그대로 사용할 수 있습니다.
- 전체 행을 가져오려면 API에 `?all=true` 또는 `assigneeContains=` (빈 값) 을 넘기면 됩니다.

## 외부 경로 (외장/다른 드라이브)

기본은 프로젝트 `data/google-source.xlsx` 입니다.  
Windows 등에서 DB·미러를 다른 폴더에 두려면 프로젝트 루트 `.env` 에 다음을 설정하세요.

```
DATABASE_URL="file:D:/path/to/crm-data/dev.db"
GOOGLE_SOURCE_XLSX="D:/path/to/crm-data/google-source.xlsx"
CRM_DATA_DIR="D:/path/to/crm-data"
```

- `GOOGLE_SOURCE_XLSX` 가 있으면 그 절대 경로를 사용합니다.
- 없으면 `CRM_DATA_DIR/google-source.xlsx` 를 사용합니다.
- 둘 다 없으면 `data/google-source.xlsx` 입니다.
- SQLite DB는 Prisma `DATABASE_URL` 로만 지정합니다 (파일은 같은 `crm-data` 폴더에 두면 관리가 쉽습니다).
