# 한밭메이트 (Hanbat-Agent)

> 한밭대학교 재학생이 심심해서 시작한,  
> 그러나 꽤 진지한 AI 프로젝트

## 📌 Overview
**Hanbat-Agent**는 한밭대학교 데이터를 기반으로 동작하는 AI 에이전트입니다.

한밭대학교 인공지능소프트웨어학과 재학생이 “학교 정보 찾기 왜 이렇게 불편하지?”라는 생각에서 출발한 프로젝트로,  
학교 관련 정보를 더 빠르고 직관적으로 제공하는 것을 목표로 합니다.

본 프로젝트는 파운데이션 모델 LG AI연구원에서 개발한 **EXAONE (엑사원)**을 기반으로 하며,  
공식 데이터와 사용자 업로드 자료를 활용해 신뢰 가능한 답변을 생성합니다.

---

## 🎯 Purpose

- 한밭대학교 정보 접근성 개선
- 공식 데이터 기반 AI 질의응답 시스템 구축
- 학생 맞춤형 학습 보조 AI 실험
- 대학 특화 AI 에이전트 아키텍처 설계 및 구현

---

## 🧠 Foundation Model

- **EXAONE**
- PyTorch 기반 LLM 인퍼런스
- RAG (Retrieval-Augmented Generation) 구조 적용
- 허깅페이스에 공개된 모델의 API 활용

---

## 📚 Data Sources

- 한밭대학교 「한밭대의 모든 것」 사이트
- 한밭대학교 공식 홈페이지 공지사항 
- 학생 업로드 자료 (PDF, 족보, 강의자료 등)

모든 데이터는 공개 정보 또는 사용자가 직접 업로드한 자료를 기반으로 활용됩니다.

---

## 🎓 Student-Centric Features

Hanbat-Agent는 단순 정보 챗봇을 넘어,  
학생들의 학습을 돕는 기능을 목표로 합니다.

### 📂 파일 업로드 기반 학습 보조

학생이 직접 자료를 업로드하면:

- 학과 족보 기반 예상 문제 정리
- 강의자료 요약
- 도서 PDF 핵심 정리
- 개념 설명 및 질의응답
- 시험 대비 요약 노트 자동 생성

즉,

> “학교 정보 AI + 학과 전용 학습 도우미”

를 지향합니다.

---

## 🔐 Authentication & API

Hanbat-Agent는 **Hugging Face API**를 사용합니다.

- (필수) **Hugging Face 계정으로 로그인**
- 로그인 시 사용자 토큰을 등록하여야 사용 가능 

이를 통해:
- 사용자별 API 사용 관리
- 보안성 확보
- 개인 모델 확장 가능성 확보

---

## 🏗️ Architecture

- Data Crawling / Parsing
- Embedding & Vector Database
- Retrieval System (RAG)
- LLM Inference (EXAONE, PyTorch)
- Hugging Face API 연동
- Web Interface (Next.js)
- Deployment: Cloudflare

---

## 🛠️ Tech Stack

- **Frontend**: Next.js
- **Backend**: Python
- **Deep Learning**: PyTorch
- **LLM API**: Hugging Face API
- **Vector DB**: FAISS (예정)
- **Deployment**: Cloudflare

---

## 🔒 License

This project is licensed under the **MIT License**.

---

## ✨ Philosophy

이 프로젝트는 거창한 스타트업이 아니라,  
한 명의 한밭대 재학생이 시작한 실험입니다.

하지만,

> “학교 안에서 가장 유용한 AI”

가 되는 것을 목표로 합니다.
