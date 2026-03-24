# Garlicton Studio Landing Page — Design Spec

## Overview

갈릭톤 스튜디오의 랜딩페이지. 메탈 음악 전문 레코딩/믹싱/마스터링/프로듀싱 스튜디오로, 메인 엔지니어 이주희(15년+ 경력)의 전문성을 전달하는 것이 핵심 목표. 메탈/록 중심이지만 다른 장르도 수용.

## Architecture

```
┌─────────────────────────┐      API      ┌─────────────────────────┐
│   프론트엔드 (Vercel)     │ ◄──────────► │  백엔드 (로컬 서버)       │
│   Next.js 15 App Router  │   REST/fetch  │  Payload CMS v3         │
│   Tailwind CSS v4        │              │  SQLite (db.sqlite)     │
│   next-intl (i18n)       │              │  관리자 대시보드 (/admin) │
│   SSG + ISR              │              │  미디어 파일 저장         │
└─────────────────────────┘              └─────────────────────────┘
```

- **프론트엔드**: Next.js 15 (App Router, TypeScript) + Tailwind CSS v4, Vercel 배포
- **백엔드**: Payload CMS v3, 로컬 서버에서 운영
- **DB**: SQLite (`@payloadcms/db-sqlite`)
- **정적 생성**: 로컬에서 `next build` 실행 → `vercel deploy --prebuilt`로 Vercel에 배포
- **콘텐츠 갱신**: CMS에서 콘텐츠 수정 후 로컬에서 재빌드 & 재배포 (스크립트로 자동화)
- **관리자 접근**: `http://localhost:3001/admin`
- **콘택트 폼 API**: Cloudflare Tunnel로 로컬 Payload API를 외부 노출하여 Vercel 프론트에서 폼 제출 가능. 또는 Vercel Serverless Function에서 이메일만 전송하고, 문의 데이터는 로컬 동기화

### Frontend-Backend Connectivity

Vercel(클라우드)에서 로컬 서버에 직접 접근할 수 없으므로:
- **빌드 시 데이터**: 로컬에서 빌드하므로 문제 없음 (localhost로 Payload API 호출)
- **콘택트 폼**: 두 가지 옵션 중 선택
  - **(A) Cloudflare Tunnel**: 로컬 Payload API를 `api.garlicton.com` 같은 도메인으로 노출 → 프론트에서 직접 API 호출
  - **(B) Vercel API Route + 이메일 전용**: 폼 제출을 Vercel Serverless Function으로 처리, 이메일만 발송. 문의 데이터는 로컬 대시보드에서 별도 확인하지 않음
  - 초기 구현은 **(B)**로 시작, 향후 필요 시 **(A)**로 전환

## Design & Visual

### Color Scheme

| Role | Color | Hex |
|------|-------|-----|
| Background | Near Black | `#0A0A0A` |
| Text | Off White | `#F0F0F0` |
| Accent | Deep Red | `#8B0000` |
| Card/Section | Dark Gray | `#1A1A1A` |

### Typography

- **로고/헤딩**: Oswald Bold 또는 유사 헤비 산세리프
- **본문 (영문)**: Inter 또는 Space Grotesk
- **본문 (한글)**: Pretendard 또는 Noto Sans KR

### Design Tone

- 묵직하고 전문적, 화려하지 않음
- 과도한 메탈 모티프 없이 다크 톤 + 타이포그래피로 장르 정체성 전달
- 인스타그램 사진을 수동 다운로드하여 Gallery 컬렉션에 업로드 (API 연동 불필요)
- 섹션 간 충분한 여백, 미니멀 레이아웃
- 모바일 반응형: 햄버거 메뉴, 단일 컬럼, 터치 친화적 갤러리

## Page Sections

단일 페이지 스크롤 구조:

### 1. Hero
- 전체 화면, 스튜디오 대표 이미지 배경
- 로고 + 태그라인 ("메탈 사운드의 전문가") + CTA ("문의하기")

### 2. Services
- 레코딩 / 믹싱 / 마스터링 / 프로듀싱 4개 카드
- 각 카드: 아이콘 + 간단한 설명 (CMS 편집 가능)

### 3. About
- 이주희 엔지니어 소개
- 프로필 사진, 15년+ 경력 요약
- 경력 목록 (리피터 필드, 향후 추가 예정)

### 4. Portfolio
- 그리드 레이아웃
- YouTube 임베드 + SoundCloud/Spotify 임베드 지원
- CMS에서 항목 추가/삭제/순서 변경

### 5. Studio
- 인스타그램 사진 갤러리 (장비, 공간)
- 라이트박스 뷰

### 6. Contact
- 문의 폼 (이름, 이메일, 전화번호, 관심 서비스, 장르, 메시지)
- 지도: Kakao Map 임베드 (인천 강화군 강화읍 북문길67번길 8-1)
- 전화번호: 0507-1313-6843
- 인스타그램: https://www.instagram.com/garlicton_studio

### Navigation Bar
- 상단 고정, 스크롤 시 반투명 배경
- 섹션 앵커 링크
- 한국어/English 언어 전환 토글

### Footer
- 주소, 전화번호, 인스타그램 링크, 저작권 표기

## CMS Content Model (Payload Collections)

### SiteSettings (Global)
- 로고 (Media)
- 태그라인 (ko/en)
- 전화번호
- 주소 (ko/en)
- 이메일
- 인스타그램 URL
- 카카오 채널 URL (보류, 필드만 준비)
- 메타 타이틀 (ko/en)
- 메타 디스크립션 (ko/en)

### Services (Collection)
- 제목 (ko/en)
- 설명 (ko/en)
- 아이콘
- 정렬 순서 (number)

### About (Global)
- 이름 (ko/en)
- 직함 (ko/en)
- 소개글 (ko/en, richtext)
- 프로필 사진 (Media)
- 경력 목록 (array): 기간, 내용 (ko/en)

### Portfolio (Collection)
- 제목 (ko/en)
- 아티스트명
- 장르
- 설명 (ko/en)
- 미디어 타입 (select: youtube/soundcloud/spotify)
- 임베드 URL
- 커버 이미지 (Media)
- 정렬 순서 (number)

### Gallery (Collection)
- 이미지 (Media)
- 캡션 (ko/en)
- 정렬 순서 (number)

### Inquiries (Collection)
- 이름 (text)
- 이메일 (email)
- 전화번호 (text, optional)
- 관심 서비스 (select, multi: recording/mixing/mastering/producing)
- 장르 (text, optional)
- 메시지 (textarea)
- 읽음 상태 (boolean, default: false)
- 생성일 (date, auto)

### Pages (Collection, 향후 블로그/뉴스 확장용)
- 제목 (ko/en)
- 슬러그
- 본문 (ko/en, richtext)
- 상태 (draft/published)

### Media (Upload Collection)
- 파일
- alt 텍스트 (ko/en)

## i18n (Internationalization)

- 라이브러리: `next-intl`
- URL 구조: `/ko/...` (기본), `/en/...`
- 루트 `/` → `/ko` 리다이렉트
- UI 텍스트: JSON 번역 파일
- 콘텐츠: CMS ko/en 필드
- SEO: 언어별 URL, `hreflang` 태그, 메타 태그 언어별 관리

## Contact Form & Notifications

### Form Fields
- 이름 (필수)
- 이메일 (필수)
- 전화번호 (선택)
- 관심 서비스 (복수 선택: 레코딩/믹싱/마스터링/프로듀싱)
- 장르 (선택)
- 메시지 (필수)

### Spam Protection
- Cloudflare Turnstile (무료, 사용자 친화적 CAPTCHA 대안)
- Honeypot 필드 (숨겨진 입력 필드, 봇 탐지)

### Processing Flow (초기: Vercel API Route 방식)
1. 폼 제출 → Vercel API Route (`/api/contact`)
2. Turnstile 토큰 검증
3. Nodemailer로 이메일 알림 발송 (SMTP, 환경변수로 설정)
4. 성공/실패 UI 피드백 (토스트 메시지)

### Email Configuration
- SMTP 설정: 환경변수 (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`)
- 수신자: `CONTACT_EMAIL` 환경변수로 지정
- 향후 Cloudflare Tunnel 도입 시 Payload Inquiries 컬렉션 저장으로 전환 가능

## SEO

- 정적 생성(SSG)으로 빠른 로딩
- 시맨틱 HTML 구조
- 메타 태그 (title, description) CMS 관리
- `hreflang` 언어 관계 태그
- Open Graph / Twitter Card 메타 태그
- 구조화된 데이터 (JSON-LD: LocalBusiness)
- sitemap.xml 자동 생성

## Studio Info

- **스튜디오명**: 갈릭톤 스튜디오 (Garlicton Studio)
- **메인 엔지니어**: 이주희 (15년+ 메탈 음악 산업 경력)
- **주소**: 인천 강화군 강화읍 북문길67번길 8-1
- **전화**: 0507-1313-6843
- **인스타그램**: https://www.instagram.com/garlicton_studio
- **서비스**: 레코딩, 믹싱, 마스터링, 프로듀싱
- **타겟**: 메탈/록 중심, 다른 장르도 수용

## Deployment

- **프론트엔드**: Vercel (기본 도메인 사용, 향후 커스텀 도메인 가능)
- **백엔드**: 로컬 서버 (Payload CMS + SQLite)
- **이미지 소스**: 인스타그램 사진 수동 다운로드 → CMS Gallery 업로드
- **빌드 & 배포**: `npm run build` (로컬) → `vercel deploy --prebuilt` (자동화 스크립트 제공)

## Future Considerations

- 카카오톡 채널 연동 (한국어 버전, CMS 필드 준비됨)
- 블로그/뉴스 섹션 (Pages 컬렉션 구조 준비됨)
- 커스텀 도메인 연결
- 상세 경력/포트폴리오 콘텐츠 추가
