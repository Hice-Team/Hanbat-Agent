"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Eye, EyeOff, ChevronRight, Check } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/service/firebase';

// 외부에서 활용할 수 있도록 props를 정의해둡니다 (예: 가입 완료 후 특정 동작 실행)
interface SignupFormProps {
    onSuccess?: (formData: any) => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [isSocialLogin, setIsSocialLogin] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        department: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAgreed: false,
        privacyAgreed: false,
        aiDataAgreed: false,
        marketingAgreed: false
    });

    const handleGoBack = () => {
        if (activeStep === 6 && isSocialLogin) {
            setActiveStep(2);
        } else if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const moveToNextStep = (currentStep: number) => {
        if (currentStep === 1 && formData.name.length >= 2) {
            setActiveStep(2);
        } else if (currentStep === 2 && formData.department.length >= 2) {
            if (isSocialLogin) setActiveStep(6);
            else setActiveStep(3);
        } else if (currentStep === 3 && formData.email.length > 0) {
            setActiveStep(4);
        } else if (currentStep === 4 && formData.password.length >= 8) {
            setActiveStep(5);
        } else if (currentStep === 5 && formData.password === formData.confirmPassword) {
            setActiveStep(6);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, currentStep: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!isNextDisabled()) moveToNextStep(currentStep);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("구글 로그인 성공", user);
            const mockName = user.displayName || "구글유저";
            const mockEmail = user.email || "google_user@hanbat.ac.kr";

            setFormData(prev => ({
                ...prev,
                name: mockName,
                email: mockEmail
            }));

            setIsSocialLogin(true);
            setActiveStep(2);
        } catch (error) {
            console.error("구글 로그인 실패:", error);
            alert("구글 로그인 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        if (activeStep === 1 && formData.name.length >= 5) setActiveStep(2);
        if (activeStep === 2 && formData.department.length >= 8) {
            if (isSocialLogin) setActiveStep(6);
            else setActiveStep(3);
        }
    }, [formData.name, formData.department, isSocialLogin, activeStep]);

    const isStep2Visible = activeStep >= 2 || formData.department.length > 0;
    const isStep3Visible = !isSocialLogin && (activeStep >= 3 || formData.email.length > 0);
    const isStep4Visible = !isSocialLogin && (activeStep >= 4 || formData.password.length > 0);
    const isStep5Visible = !isSocialLogin && (activeStep >= 5 || formData.confirmPassword.length > 0);
    const isStep6Visible = activeStep >= 6;

    const isAllAgreed = formData.termsAgreed && formData.privacyAgreed;

    const isNextDisabled = () => {
        if (activeStep === 1) return formData.name.length < 2;
        if (activeStep === 2) return formData.department.length < 2;
        if (activeStep === 3) return formData.email.length === 0;
        if (activeStep === 4) return formData.password.length < 8;
        if (activeStep === 5) return formData.password !== formData.confirmPassword || formData.password === '';
        if (activeStep === 6) return !isAllAgreed;
        return false;
    };

    const handleFinalSubmit = async () => {
        if (!isAllAgreed) return;

        try {
            if (isSocialLogin) {
                console.log("구글 소셜 회원가입 완료:", formData);
                // 소셜 로그인은 이미 인증이 완료되었으므로, 추가 정보 저장을 위해 Firestore 등을 사용하면 됩니다.
            } else {
                console.log("이메일 회원가입 시도:", formData);
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                console.log("이메일 회원가입 완료:", userCredential.user);
            }

            // 컴포넌트 외부로 성공 이벤트를 전달할 수 있습니다.
            if (onSuccess) {
                onSuccess(formData);
            } else {
                router.push("/login");
            }
        } catch (error: any) {
            console.error("회원가입 에러:", error);
            if (error.code === 'auth/email-already-in-use') {
                alert("이미 사용 중인 이메일입니다.");
            } else {
                alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    };

    return (
        // 풀스크린 바탕 화면
        <div className="min-h-screen bg-white flex flex-col items-center py-0 px-0 text-gray-900 font-sans">

            {/* 중앙 컨텐츠 영역 (최대 너비 고정) */}
            <div className="w-full max-w-md flex flex-col relative min-h-screen overflow-x-hidden">

                {/* 내부 여백 및 스크롤 영역 */}
                <div className="flex-1 px-6 py-10 flex flex-col pb-48">

                    {/* 상단 네비게이션 구역 */}
                    <div className="w-full flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            {activeStep > 1 && (
                                <button
                                    onClick={handleGoBack}
                                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                                    aria-label="이전 단계로"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                            )}
                            <Link
                                href="/"
                                className={`flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors group rounded-full hover:bg-gray-50 ${activeStep === 1 ? '-ml-2 p-2 px-3' : 'p-2 px-3'}`}
                            >
                                <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                                <span className="text-sm font-medium hidden sm:inline-block">홈으로 돌아가기</span>
                                <span className="text-sm font-medium sm:hidden">홈</span>
                            </Link>
                        </div>
                    </div>

                    <header className="mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight transition-all duration-500 break-keep">
                            {activeStep === 1 ? "이름을 알려주세요" :
                                activeStep === 2 ? "학과를 입력해주세요" :
                                    activeStep === 3 ? "학교 메일을 입력해주세요" :
                                        activeStep === 4 ? "비밀번호를 설정해주세요" :
                                            activeStep === 5 ? "거의 다 끝났어요!" : "가입 준비가 끝났어요!"}
                        </h2>
                    </header>

                    <form className="space-y-8 md:space-y-10" onSubmit={(e) => e.preventDefault()}>

                        {/* 1단계: 이름 & 소셜 로그인 버튼 */}
                        <div className="space-y-5 animate-in fade-in duration-500">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-xs font-semibold text-gray-500 md:text-sm">이름</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoFocus
                                    value={formData.name}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 1)}
                                    placeholder="홍길동"
                                    autoComplete="name"
                                    disabled={isSocialLogin}
                                    className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2 md:py-2.5 disabled:text-gray-400 placeholder:text-gray-300 placeholder:font-normal"
                                />
                            </div>

                            {activeStep === 1 && !isSocialLogin && (
                                <div className="pt-2 space-y-4 animate-in fade-in duration-500 delay-150">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-px bg-gray-100"></div>
                                        <span className="text-xs font-medium text-gray-400">또는</span>
                                        <div className="flex-1 h-px bg-gray-100"></div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-sm active:scale-95 text-sm md:text-base"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        구글 계정으로 3초만에 시작하기
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2단계: 학과 */}
                        {isStep2Visible && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <label htmlFor="department" className="text-xs font-semibold text-gray-500 md:text-sm">학과</label>
                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    value={formData.department}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 2)}
                                    placeholder="인공지능소프트웨어학과"
                                    className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2 md:py-2.5 placeholder:text-gray-300 placeholder:font-normal"
                                />
                            </div>
                        )}

                        {/* 3단계: 이메일 */}
                        {isStep3Visible && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <div className="flex justify-between items-end">
                                    <label htmlFor="email" className="text-xs font-semibold text-gray-500 md:text-sm">학교 이메일</label>
                                    <button
                                        type="button"
                                        onClick={() => { if (formData.email.length > 0) setActiveStep(4); }}
                                        className="text-xs md:text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        인증하기
                                    </button>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 3)}
                                    placeholder="id@hanbat.ac.kr"
                                    autoComplete="email"
                                    className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2 md:py-2.5 placeholder:text-gray-300 placeholder:font-normal"
                                />
                            </div>
                        )}

                        {/* 4단계: 비밀번호 */}
                        {isStep4Visible && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <label htmlFor="password" className="text-xs font-semibold text-gray-500 md:text-sm">비밀번호</label>
                                <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 transition-all py-2 md:py-2.5">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onKeyDown={(e) => handleKeyDown(e, 4)}
                                        placeholder="8자 이상 입력"
                                        autoComplete="new-password"
                                        className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none placeholder:text-gray-300 placeholder:font-normal"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 hover:text-gray-500 transition-colors">
                                        {showPassword ? <EyeOff size={20} className="md:w-5 md:h-5" /> : <Eye size={20} className="md:w-5 md:h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 5단계: 비밀번호 확인 */}
                        {isStep5Visible && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-500 md:text-sm">비밀번호 확인</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 5)}
                                    placeholder="다시 한번 입력"
                                    className={`w-full text-lg md:text-xl font-semibold bg-transparent outline-none border-b-2 transition-all py-2 md:py-2.5 placeholder:text-gray-300 placeholder:font-normal ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? 'border-red-500'
                                        : 'border-gray-100 focus:border-blue-500'
                                        }`}
                                />
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-[10px] md:text-xs text-red-500 font-medium mt-1 animate-in fade-in duration-300">비밀번호가 일치하지 않아요</p>
                                )}
                            </div>
                        )}

                        {/* 6단계: 약관 동의 */}
                        {isStep6Visible && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                                {isSocialLogin && (
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-shadow">
                                        <div className="bg-white p-2 rounded-full shadow-sm">
                                            <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-0.5">구글 계정 연동 완료</p>
                                            <p className="text-sm md:text-base font-medium text-gray-900">{formData.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-2">
                                    <h3 className="text-sm md:text-base font-bold text-gray-900 px-1">마지막으로 약관에 동의해주세요</h3>
                                    <div className="bg-gray-50 rounded-3xl p-5 space-y-4 shadow-sm border border-gray-100">

                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${formData.privacyAgreed ? 'bg-blue-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                                                    <Check size={12} className="text-white" />
                                                </div>
                                                <input type="checkbox" name="privacyAgreed" checked={formData.privacyAgreed} onChange={handleChange} className="hidden" />
                                                <span className="text-sm md:text-base font-medium text-gray-800">개인정보 이용 및 활용 동의 <span className="text-blue-600 font-bold text-[10px] md:text-xs ml-1">(필수)</span></span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${formData.termsAgreed ? 'bg-blue-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                                                    <Check size={12} className="text-white" />
                                                </div>
                                                <input type="checkbox" name="termsAgreed" checked={formData.termsAgreed} onChange={handleChange} className="hidden" />
                                                <span className="text-sm md:text-base font-medium text-gray-800">서비스 이용약관 동의 <span className="text-blue-600 font-bold text-[10px] md:text-xs ml-1">(필수)</span></span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                                        </label>

                                        <div className="h-px bg-gray-200 w-full my-3"></div>

                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${formData.aiDataAgreed ? 'bg-blue-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                                                    <Check size={12} className="text-white" />
                                                </div>
                                                <input type="checkbox" name="aiDataAgreed" checked={formData.aiDataAgreed} onChange={handleChange} className="hidden" />
                                                <span className="text-sm md:text-base font-medium text-gray-600">AI 학습 데이터 수집 및 활용 동의 <span className="text-gray-400 font-bold text-[10px] md:text-xs ml-1">(선택)</span></span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${formData.marketingAgreed ? 'bg-blue-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                                                    <Check size={12} className="text-white" />
                                                </div>
                                                <input type="checkbox" name="marketingAgreed" checked={formData.marketingAgreed} onChange={handleChange} className="hidden" />
                                                <span className="text-sm md:text-base font-medium text-gray-600">마케팅 정보 수신 동의 <span className="text-gray-400 font-bold text-[10px] md:text-xs ml-1">(선택)</span></span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                                        </label>

                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* 하단 고정 버튼 구역 */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent flex flex-col items-center z-10 w-full">
                    <div className="w-full max-w-md flex flex-col gap-3">
                        <button
                            type="button"
                            disabled={isNextDisabled()}
                            onClick={() => {
                                if (activeStep < 6) moveToNextStep(activeStep);
                                else if (isAllAgreed) handleFinalSubmit();
                            }}
                            className={`w-full py-4 md:py-3.5 rounded-2xl md:rounded-xl text-lg md:text-base font-bold transition-all transform active:scale-95 shadow-xl ${!isNextDisabled()
                                ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {activeStep < 6 ? "다음" : "가입 완료하기"}
                        </button>

                        {activeStep === 1 && (
                            <div className="text-center pb-2 md:pb-0 animate-in fade-in">
                                <p className="text-sm md:text-xs text-gray-500">
                                    이미 계정이 있으신가요?{" "}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-blue-600 hover:text-blue-800 transition-colors underline-offset-4 hover:underline"
                                    >
                                        로그인
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}