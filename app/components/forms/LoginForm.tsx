"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Eye, EyeOff } from 'lucide-react';

// 외부에서 활용할 수 있도록 props 정의
interface LoginFormProps {
    onSuccess?: (userData: any) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleGoBack = () => {
        router.back();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!isSubmitDisabled) handleEmailLogin();
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
            const { auth } = await import("@/service/firebase");
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            console.log("구글 로그인 성공:", result.user);

            if (onSuccess) {
                onSuccess(result.user);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("구글 로그인 실패:", error);
            alert("구글 로그인 중 오류가 발생했습니다.");
        }
    };

    const handleEmailLogin = async () => {
        if (isSubmitDisabled) return;

        try {
            const { signInWithEmailAndPassword } = await import("firebase/auth");
            const { auth } = await import("@/service/firebase");
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

            console.log("이메일 로그인 성공:", userCredential.user);

            if (onSuccess) {
                onSuccess(userCredential.user);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("이메일 로그인 실패:", error);
            alert("이메일 또는 비밀번호를 확인해주세요.");
        }
    };

    const isSubmitDisabled = formData.email.length === 0 || formData.password.length < 8;

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
                            <button
                                onClick={handleGoBack}
                                className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                                aria-label="뒤로 가기"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 p-2 px-3 text-gray-500 hover:text-gray-900 transition-colors group rounded-full hover:bg-gray-50"
                            >
                                <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                                <span className="text-sm font-medium hidden sm:inline-block">홈으로 돌아가기</span>
                                <span className="text-sm font-medium sm:hidden">홈</span>
                            </Link>
                        </div>
                    </div>

                    <header className="mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight transition-all duration-500 break-keep animate-in fade-in slide-in-from-bottom-4">
                            환영합니다!<br />로그인해주세요
                        </h2>
                    </header>

                    <form className="space-y-8 md:space-y-10" onSubmit={(e) => e.preventDefault()}>

                        {/* 소셜 로그인 버튼 구역 */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
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
                                구글 계정으로 3초만에 로그인
                            </button>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex-1 h-px bg-gray-100"></div>
                                <span className="text-xs font-medium text-gray-400">또는 이메일로 로그인</span>
                                <div className="flex-1 h-px bg-gray-100"></div>
                            </div>
                        </div>

                        {/* 이메일 및 비밀번호 입력 구역 */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                            {/* 이메일 */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-gray-500 md:text-sm">학교 이메일</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="id@hanbat.ac.kr"
                                    autoComplete="email"
                                    className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2 md:py-2.5 placeholder:text-gray-300 placeholder:font-normal"
                                />
                            </div>

                            {/* 비밀번호 */}
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-xs font-semibold text-gray-500 md:text-sm">비밀번호</label>
                                <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 transition-all py-2 md:py-2.5">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="비밀번호를 입력해주세요"
                                        autoComplete="current-password"
                                        className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none placeholder:text-gray-300 placeholder:font-normal"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 hover:text-gray-500 transition-colors">
                                        {showPassword ? <EyeOff size={20} className="md:w-5 md:h-5" /> : <Eye size={20} className="md:w-5 md:h-5" />}
                                    </button>
                                </div>

                                {/* 비밀번호 찾기 링크 (선택) */}
                                <div className="flex justify-end pt-2">
                                    <Link href="/forgot-password" className="text-[11px] md:text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                                        비밀번호를 잊으셨나요?
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* 하단 고정 버튼 구역 */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent flex flex-col items-center z-10 w-full">
                    <div className="w-full max-w-md flex flex-col gap-3">
                        <button
                            type="button"
                            disabled={isSubmitDisabled}
                            onClick={handleEmailLogin}
                            className={`w-full py-4 md:py-3.5 rounded-2xl md:rounded-xl text-lg md:text-base font-bold transition-all transform active:scale-95 shadow-xl ${!isSubmitDisabled
                                ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            로그인
                        </button>

                        <div className="text-center pb-2 md:pb-0 animate-in fade-in">
                            <p className="text-sm md:text-xs text-gray-500">
                                아직 계정이 없으신가요?{" "}
                                <Link
                                    href="/signup"
                                    className="font-semibold text-blue-600 hover:text-blue-800 transition-colors underline-offset-4 hover:underline"
                                >
                                    회원가입
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}