"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, ChevronRight, Check } from 'lucide-react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 현재 활성화된 단계 관리
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: '',
    huggingFaceKey: '',
    termsAgreed: false,
    privacyAgreed: false
  });

  const handleGoBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      router.push('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 다음 단계로 이동하는 공통 로직
  const moveToNextStep = (currentStep: number) => {
    if (currentStep === 1 && formData.name.length >= 2) {
      setActiveStep(2);
    } else if (currentStep === 2 && formData.department.length >= 2) {
      setActiveStep(3);
    } else if (currentStep === 3) {
      // 이메일은 입력 여부와 상관없이 '다음'이나 '엔터' 시 비밀번호 단계로 이동
      setActiveStep(4);
    } else if (currentStep === 4 && formData.password.length >= 8) {
      setActiveStep(5);
    } else if (currentStep === 5 && formData.password === formData.confirmPassword) {
      setActiveStep(6);
    }
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent, currentStep: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 방지
      moveToNextStep(currentStep);
    }
  };

  // 자동 전환 임계값 (사용자 편의를 위한 보조 로직)
  useEffect(() => {
    if (activeStep === 1 && formData.name.length >= 5) setActiveStep(2);
    if (activeStep === 2 && formData.department.length >= 8) setActiveStep(3);
  }, [formData.name, formData.department]);

  const isStep2Visible = activeStep >= 2 || formData.department.length > 0;
  const isStep3Visible = activeStep >= 3 || formData.email.length > 0;
  const isStep4Visible = activeStep >= 4 || formData.password.length > 0;
  const isStep5Visible = activeStep >= 5 || formData.confirmPassword.length > 0;

  const isAllAgreed = formData.termsAgreed && formData.privacyAgreed;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-6 relative text-gray-900 overflow-x-hidden">
      {/* 왼쪽 상단 뒤로가기/홈으로 네비게이션 */}
      <div className="w-full max-w-md flex items-center mb-8">
        <button 
          onClick={handleGoBack} 
          className="flex items-center gap-2 p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{activeStep === 1 ? '홈으로' : '이전으로'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <header className="mb-12">
          <h2 className="text-2xl font-bold leading-tight transition-all duration-500">
            {activeStep === 1 ? "이름을 알려주세요" : 
             activeStep === 2 ? "학과를 입력해주세요" :
             activeStep === 3 ? "학교 메일을 입력해주세요" :
             activeStep === 4 ? "비밀번호를 설정해주세요" :
             activeStep === 5 ? "거의 다 끝났어요!" : "가입 준비가 끝났어요!"}
          </h2>
        </header>

        <form className="space-y-12 pb-40" onSubmit={(e) => e.preventDefault()}>
          {/* 1단계: 이름 */}
          <div className="space-y-2 animate-in fade-in duration-500">
            <label className="text-xs font-semibold text-gray-400">이름</label>
            <input
              name="name"
              type="text"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              placeholder="홍길동"
              className="w-full text-xl font-medium bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2"
            />
          </div>

          {/* 2단계: 학과 */}
          {isStep2Visible && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <label className="text-xs font-semibold text-gray-400">학과</label>
              <input
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                placeholder="컴퓨터공학과"
                className="w-full text-xl font-medium bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2"
              />
            </div>
          )}

          {/* 3단계: 이메일 */}
          {isStep3Visible && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex justify-between items-end">
                <label className="text-xs font-semibold text-gray-400">학교 이메일</label>
                <button 
                  type="button" 
                  onClick={() => setActiveStep(4)}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  인증하기
                </button>
              </div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 3)}
                placeholder="id@hanbat.ac.kr"
                className="w-full text-xl font-medium bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2"
              />
            </div>
          )}

          {/* 4~5단계: 비밀번호 세트 */}
          {isStep4Visible && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">비밀번호</label>
                <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 transition-all py-2">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 4)}
                    placeholder="8자 이상 입력"
                    className="w-full text-xl font-medium bg-transparent outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isStep5Visible && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <label className="text-xs font-semibold text-gray-400">비밀번호 확인</label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 5)}
                    placeholder="다시 한번 입력"
                    className={`w-full text-xl font-medium bg-transparent outline-none border-b-2 transition-all py-2 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-500' 
                      : 'border-gray-100 focus:border-blue-500'
                    }`}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-medium mt-1 animate-in fade-in duration-300">비밀번호가 일치하지 않아요</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 6단계: HuggingFace Key (선택) & 약관 동의 */}
          {activeStep >= 5 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-400">Hugging Face API Key</label>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">선택</span>
                </div>
                <input
                  name="huggingFaceKey"
                  type="text"
                  value={formData.huggingFaceKey}
                  onChange={handleChange}
                  placeholder="hf_..."
                  className="w-full text-xl font-medium bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2"
                />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-gray-900 px-1">마지막 단계에요</h3>
                <div className="bg-gray-50 rounded-3xl p-6 space-y-5">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${formData.privacyAgreed ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Check size={14} className="text-white" />
                      </div>
                      <input type="checkbox" name="privacyAgreed" checked={formData.privacyAgreed} onChange={handleChange} className="hidden" />
                      <span className="text-sm font-medium text-gray-600">개인정보 이용 및 활용 동의 (필수)</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${formData.termsAgreed ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Check size={14} className="text-white" />
                      </div>
                      <input type="checkbox" name="termsAgreed" checked={formData.termsAgreed} onChange={handleChange} className="hidden" />
                      <span className="text-sm font-medium text-gray-600">서비스 이용약관 동의 (필수)</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 하단 고정 버튼 구역 */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-center z-10">
            <div className="w-full max-w-md">
              <button
                type="button"
                onClick={() => {
                  if (activeStep < 5) moveToNextStep(activeStep);
                  else if (isAllAgreed) console.log("가입 완료", formData);
                }}
                className={`w-full py-5 rounded-2xl text-lg font-bold transition-all transform active:scale-95 shadow-xl ${
                  (activeStep < 5) || isAllAgreed
                  ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                }`}
              >
                {activeStep < 5 ? "다음" : "가입 완료하기"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}