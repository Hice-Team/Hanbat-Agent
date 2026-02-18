"use client";

import Link from 'next/link';

import React, { useState, useRef } from 'react';
import {
  Menu,
  X,
  Paperclip,
  Search,
  BookOpen,
  Send,
  MessageSquare,
  ExternalLink,
  Settings,
  Home as HomeIcon,
  Globe,
  Users,
  Plus,
  FileText
} from 'lucide-react';

export default function App() {
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // 기능 토글 상태 관리
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLearnActive, setIsLearnActive] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const fileInputRef = useRef(null);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // 파일 다중 첨부 핸들러
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
    }
    // 동일 파일 다시 선택 가능하도록 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800 overflow-hidden font-sans text-base">

      {/* 숨겨진 파일 입력 필드 (multiple 추가) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* --- 사이드바 --- */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#f9f9f9] border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute'
          } ${!isSidebarOpen && 'md:hidden'}`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            {/* 좌측: 햄버거 메뉴 아이콘 (사이드바 내부 - 닫기 역할) */}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            {/* 우측: 검색 아이콘 */}
            <button
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
              aria-label="Search History"
            >
              <Search size={20} />
            </button>
          </div>

          <button className="flex items-center justify-center gap-2 w-full p-3 mb-6 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors border border-gray-200 bg-white shadow-sm">
            <Plus size={18} />
            <span className="text-sm font-semibold">새 채팅</span>
          </button>

          <div className="flex-1 overflow-y-auto">
            <div className="text-[11px] font-bold text-gray-400 px-3 mb-2 uppercase tracking-wider">최근 대화</div>
            {chatHistory.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-gray-400">이전 대화 기록이 없습니다.</p>
              </div>
            ) : (
              <nav className="space-y-1">
                {chatHistory.map((chat, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-left truncate"
                  >
                    <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                    {chat}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* --- 하단 링크 및 설정 --- */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="text-[11px] font-bold text-gray-400 px-3 mb-2 uppercase tracking-wider">제휴 사이트</div>
            <nav className="space-y-0.5">
              <a
                href="https://www.hanbat.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" />
                  <span>공식 홈페이지</span>
                </div>
                <ExternalLink size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="https://www.abouthanbat.com/"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <HomeIcon size={16} className="text-gray-400" />
                  <span>한밭대의 모든 것</span>
                </div>
                <ExternalLink size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-gray-400" />
                  <span>오픈스페이스</span>
                </div>
              </a>
            </nav>

            <div className="px-2 mt-4 pt-4 border-t border-gray-100">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                <Settings size={18} className="text-gray-500" />
                <span>설정</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- 메인 컨텐츠 영역 --- */}
      <div className="flex flex-col flex-1 transition-all duration-300 w-full relative h-screen">
        <header className="flex items-center justify-between px-6 py-3 bg-white sticky top-0 z-30 w-full border-b border-gray-50">
          <div className="flex items-center gap-3">
            {/* 사이드바가 닫혀있을 때만 헤더의 햄버거 메뉴를 표시 */}
            {!isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                aria-label="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <div className={`flex items-center gap-2 h-full select-none ${isSidebarOpen ? 'ml-0' : ''}`}>
              <h1 className="text-xl font-bold tracking-tight text-[#202123] flex items-center">
                <span className="text-blue-600">한밭</span>메이트
              </h1>
              <div className="flex items-center gap-1 self-center ml-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">with</span>
                <span className="text-[10px] font-bold text-gray-500 tracking-tight">K-EXAONE</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-sm">
                로그인
              </button>
            </Link>            
            <Link href="/auth/signup">
              <button className="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-all">회원 가입</button>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto pb-10">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <h2 className="text-3xl font-semibold mb-8 text-gray-800 text-center">안녕하세요, 한밭메이트입니다</h2>

            <div className="w-full border border-gray-200 shadow-lg rounded-[28px] p-4 bg-white focus-within:border-gray-300 transition-all">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 group animate-in fade-in slide-in-from-bottom-1">
                      <FileText size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 max-w-[120px] truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        aria-label="Remove attachment"
                      >
                        <X size={12} className="text-blue-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={(e) => {
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
                placeholder="무엇이든 물어보세요"
                className="w-full resize-none outline-none text-lg px-2 py-1 placeholder-gray-400 min-h-[44px] max-h-[200px]"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ActionButton
                    icon={<Paperclip size={16} />}
                    label={`첨부${attachedFiles.length > 0 ? ` (${attachedFiles.length})` : ''}`}
                    onClick={handleAttachmentClick}
                    active={attachedFiles.length > 0}
                  />
                  <ActionButton
                    icon={<Search size={16} />}
                    label="검색"
                    onClick={() => setIsSearchActive(!isSearchActive)}
                    active={isSearchActive}
                  />
                  <ActionButton
                    icon={<BookOpen size={16} />}
                    label="학습"
                    onClick={() => setIsLearnActive(!isLearnActive)}
                    active={isLearnActive}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {(input.trim() || attachedFiles.length > 0) && (
                    <button className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95">
                      <Send size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="p-6 text-center text-[11px] text-gray-400 leading-relaxed max-w-2xl mx-auto w-full">
          <p>
            AI 챗봇 한밭메이트에 메시지를 보냄으로써, <span className="underline cursor-pointer text-gray-500 hover:text-blue-500 text-nowrap">이용약관</span>에 동의하고
            <span className="underline cursor-pointer text-gray-500 hover:text-blue-500 ml-1 text-nowrap">개인정보 이용 및 활용</span>에 동의하신 것으로 간주합니다.<br />
            한밭메이트는 기술적 한계로 인해 틀린 정보를 생성할 수 있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[13px] font-medium active:scale-95 ${active
          ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
          : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-600'
        }`}
    >
      <span className={active ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}