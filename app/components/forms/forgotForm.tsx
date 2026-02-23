"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, MailCheck } from 'lucide-react';

export default function ForgotPasswordForm() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false); // 재설정 링크 전송 완료 상태

    const handleGoBack = () => {
        if (isSubmitted) {
            setIsSubmitted(false); // 완료 화면에서 뒤로가기 누르면 다시 입력 화면으로
        } else {
            router.back();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!isSubmitDisabled && !isSubmitted) handleResetPassword();
        }
    };

    const handleResetPassword = async () => {
        if (isSubmitDisabled) return;

        try {
            // 실제 Firebase Auth 연동
            const { sendPasswordResetEmail } = await import("firebase/auth");
            const { auth } = await import("@/service/firebase");
            await sendPasswordResetEmail(auth, email);

            console.log("비밀번호 재설정 이메일 전송 완료:", email);

            // 전송 성공 시 완료 화면으로 전환
            setIsSubmitted(true);
        } catch (error) {
            console.error("비밀번호 재설정 이메일 전송 실패:", error);
            alert("등록되지 않은 이메일이거나 오류가 발생했습니다.");
        }
    };

    const isSubmitDisabled = email.length === 0 || !email.includes('@');

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

                    {!isSubmitted ? (
                        // [1] 이메일 입력 화면
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="mb-8 md:mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold leading-tight break-keep">
                                    비밀번호를 잊으셨나요?<br />가입한 이메일을 알려주세요
                                </h2>
                            </header>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-xs font-semibold text-gray-500 md:text-sm">학교 이메일</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoFocus
                                        value={email}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="id@hanbat.ac.kr"
                                        autoComplete="email"
                                        className="w-full text-lg md:text-xl font-semibold bg-transparent outline-none border-b-2 border-gray-100 focus:border-blue-500 transition-all py-2 md:py-2.5 placeholder:text-gray-300 placeholder:font-normal"
                                    />
                                </div>
                                <p className="text-xs md:text-sm text-gray-500 leading-relaxed pt-2">
                                    가입하신 학교 이메일 주소를 입력해주시면, 비밀번호를 재설정할 수 있는 링크를 보내드릴게요.
                                </p>
                            </form>
                        </div>
                    ) : (
                        // [2] 이메일 전송 완료 화면
                        <div className="flex flex-col items-center justify-center pt-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                                <MailCheck size={40} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                                이메일을 확인해주세요!
                            </h2>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                <span className="font-semibold text-gray-900">{email}</span>(으)로<br />
                                비밀번호 재설정 링크를 보냈어요.<br />
                                이메일의 링크를 클릭하여 비밀번호를 변경해주세요.
                            </p>
                        </div>
                    )}

                </div>

                {/* 하단 고정 버튼 구역 */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent flex flex-col items-center z-10 w-full">
                    <div className="w-full max-w-md flex flex-col gap-3">

                        {!isSubmitted ? (
                            <button
                                type="button"
                                disabled={isSubmitDisabled}
                                onClick={handleResetPassword}
                                className={`w-full py-4 md:py-3.5 rounded-2xl md:rounded-xl text-lg md:text-base font-bold transition-all transform active:scale-95 shadow-xl ${!isSubmitDisabled
                                    ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                재설정 링크 받기
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => router.push('/login')} // 로그인 페이지로 이동
                                className="w-full py-4 md:py-3.5 rounded-2xl md:rounded-xl text-lg md:text-base font-bold transition-all transform active:scale-95 shadow-xl bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
                            >
                                로그인하러 가기
                            </button>
                        )}

                        {!isSubmitted && (
                            <div className="text-center pb-2 md:pb-0 animate-in fade-in">
                                <p className="text-sm md:text-xs text-gray-500">
                                    비밀번호가 기억나셨나요?{" "}
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