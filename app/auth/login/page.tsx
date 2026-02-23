"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("로그인 시도:", { email, password });
  };

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] min-h-[520px] bg-gray-50 flex flex-col relative
        px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8
        pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] 
        pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] overflow-hidden"
    >
      {/* 왼쪽 상단 홈으로 버튼 - 터치 영역 44px 이상 */}
      <button
        type="button"
        onClick={handleGoHome}
        className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] 
          flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium 
          text-sm sm:text-base z-10 min-h-[44px] min-w-[44px] sm:min-w-0 justify-center sm:justify-start pl-1"
        aria-label="홈으로"
      >
        <ArrowLeft size={20} className="sm:w-5 sm:h-5 shrink-0" />
        <span className="hidden sm:inline">홈으로</span>
      </button>

      <div className="w-full max-w-[min(26rem,calc(100vw-1.5rem))] mx-auto flex flex-col justify-center gap-4 pt-12 sm:pt-0">
        {/* 헤더 - 최대한 컴팩트하게 */}
        <div className="text-center flex-shrink-0 space-y-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            한밭메이트
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            다시 돌아와주셔서 감사해요! 👋
          </p>
        </div>

        {/* 폼 카드 - 세로 길이 맞추기 위해 패딩/간격 최소화 */}
        <div className="mt-2 sm:mt-4 w-full mx-auto flex flex-col max-w-md">
          <div className="bg-white py-3 px-3 sm:py-4 sm:px-5 shadow-xl border border-gray-100 rounded-xl sm:rounded-2xl flex flex-col min-h-0">
            <form
              className="flex flex-col min-h-0 space-y-2.5 sm:space-y-3"
              onSubmit={handleSubmit}
            >
              <div className="flex-shrink-0">
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 ml-1 mb-0.5"
                >
                  이메일 주소
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-9 pr-3 min-h-[44px] py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm transition-all bg-gray-50/50"
                    placeholder="example@hanbat.ac.kr"
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 ml-1 mb-0.5"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-9 pr-10 min-h-[44px] py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm transition-all bg-gray-50/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center min-w-[44px] justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye size={20} className="sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-0.5 flex-shrink-0 flex-wrap gap-2 min-h-[44px] items-center">
                <div className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-xs sm:text-sm text-gray-600 cursor-pointer"
                  >
                    로그인 유지
                  </label>
                </div>
                <a
                  href="#"
                  className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 py-2"
                >
                  비밀번호를 잊으셨나요?
                </a>
              </div>

              <div className="pt-0.5 flex-shrink-0">
                <button
                  type="submit"
                  className="w-full flex justify-center min-h-[42px] py-2.5 sm:py-3 px-4 border border-transparent rounded-xl sm:rounded-2xl shadow-md text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all active:scale-[0.98]"
                >
                  로그인하기
                </button>
              </div>
            </form>

            <div className="mt-4 sm:mt-5 flex-shrink-0 pt-1">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">
                    처음 오셨나요?
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="w-full flex justify-center min-h-[42px] py-2.5 sm:py-3 px-4 mt-3 sm:mt-4 border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none transition-all"
              >
                회원가입 하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
