# 🎓 한밭메이트 (Hanbat-Agent)

> **"학교 정보 찾기 왜 이렇게 불편하지?"**
> 한밭대학교 재학생이 심심해서 시작한, 그러나 꽤 진지한 대학 특화 AI 에이전트 프로젝트

- [🌐 웹사이트 접속하기](https://hanbatmate.hicecorp.com) *현재 개발 중이므로 접속은 불가능합니다
- [📖 프로젝트 위키](https://github.com/Hice-Team/Hanbat-Agent/wiki) *현재 개발 중이므로 접속은 불가능합니다
---

## 📌 Overview
**Hanbat-Agent**는 한밭대학교 구성원들을 위한 맞춤형 정보를 제공하고 학습을 보조하는 AI 에이전트입니다.  
공식 학사 정보부터 학생들이 직접 업로드한 학습 자료까지, **Google Gemini 3** 기반의 RAG 아키텍처를 통해 신뢰할 수 있는 답변을 생성합니다.

## 🎯 주요 목표
* **정보 접근성 개선**: 흩어져 있는 학교 정보를 한곳에서 쉽고 빠르게 조회
* **RAG 기반 답변**: 공식 데이터 및 사용자 자료를 활용한 높은 신뢰도의 응답
* **학생 맞춤형 학습 보조**: 족보, 강의자료 등을 활용한 지능형 학습 환경 구축
* **최신 기술 적용**: 대학 특화 AI 에이전트 아키텍처의 설계 및 구현 실습

## 🧠 파운데이션 모델
* **Core Model**: **Google Gemini 3 API**
* **Platform**: **Google AI Studio**를 통한 최신 LLM 연동
* **Architecture**: Retrieval-Augmented Generation (RAG) 구조 적용

## 📚 데이터 소스
* **공식 채널**: 한밭대학교 공식 홈페이지 공지사항, 「한밭대의 모든 것」 사이트
* **사용자 데이터**: PDF 강의자료, 학생 업로드 족보 및 요약본
* *모든 데이터는 공개 정보 또는 사용자 자발적 업로드 자료를 기반으로 합니다.*

## 🎓 학생 중심 핵심 기능 (Student-Centric)
단순한 챗봇을 넘어, 학생들의 실제 성적 향상과 편의를 돕습니다.
* **학습 보조**: 강의자료 요약 및 개념 설명
* **시험 대비**: 학과 족보 기반 예상 문제 생성 및 요약 노트 자동화
* **문서 정리**: 도서 및 PDF 핵심 내용 정리 및 질의응답

## 🔐 인증 및 데이터 관리
보안과 확장성을 위해 검증된 클라우드 솔루션을 활용합니다.
* **Authentication**: **Firebase Auth**를 통한 안전한 사용자 인증 시스템 구축
* **Database & Storage**: **Supabase**를 활용한 실시간 데이터 관리 및 벡터 데이터 저장

## 🏗️ 시스템 아키텍처 & 기술 스택
### Tech Stack
| 구분 | 기술 스택 |
| :--- | :--- |
| **Frontend** | `Next.js` |
| **Auth** | **`Firebase Auth`** |
| **Database** | **`Supabase`** |
| **AI API** | **`Google Gemini 3 API`** |
| **Deployment** | `Cloudflare` |

### Flow
`Data Crawling` → `Embedding` → `Supabase (Vector)` → `Retrieval (RAG)` → `Gemini 3 Inference` → `Web Interface`

## ✨ Philosophy
이 프로젝트는 거창한 시작은 아니었을지 모릅니다.  
하지만, **“우리 학교 안에서 가장 유용한 AI”**를 만든다는 목표 하나로 진지하게 나아갑니다.

## 👥 제작자
본 프로젝트는 한밭대학교 인공지능소프트웨어학과 재학생 **1인**에 의해 기획 및 개발되고 있습니다.

- **Lead Developer**: **Seogo** ([@GitHub ID](https://github.com/ksh6940))
  - **AI Strategy**: Gemini 3 API 파인튜닝 및 최적화
  - **System Architecture**: Supabase & RAG(Retrieval-Augmented Generation) 설계
  - **Full-stack Development**: Next.js 프론트엔드 및 Firebase Auth 인증 시스템 구축
- **Contact**: `gsh6940@naver.com`
  
## 🔒 License & Copyright

본 프로젝트는 부분적 오픈소스 라이선스를 따릅니다.

- **Web Interface & Frontend**: [MIT License](https://opensource.org/licenses/MIT)에 따라 자유롭게 수정 및 배포가 가능합니다.
- **Hanbat AI Model (Fine-tuned)**: 자체 개발한 파인튜닝 모델은 **Closed Source**로 유지되며, 연구 목적을 제외한 무단 복제 및 상업적 이용을 금합니다.
- **Security & Auth Logic**: 로그인, API 게이트웨이 및 보안 관련 핵심 소스코드는 프로젝트 보안 및 사용자 데이터 보호를 위해 비공개(Closed Source)로 운영됩니다.

Copyright © 2026 Hanbat-Mate Team. All rights reserved.
