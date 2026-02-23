"use client";

// === 1. Imports (라이브러리 및 컴포넌트 임포트) ===
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from "remark-breaks";
import {
  FileText as FileTextIcon, Terminal, Link2, Menu, X, Search,
  BookOpen, Send, ExternalLink, Settings, Home as HomeIcon, Globe,
  Users, Plus, Wrench, ChevronDown, Copy, Image as ImageIcon,
  Cloud, Zap, Cpu, Sparkles, Check, GraduationCap, FileText,
  Paperclip, Music, Play, FlaskConical
} from 'lucide-react';
import { auth } from '@/service/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

// === 2. Type Definitions (타입 정의) ===
type ModelType = {
  id: string;
  name: string;
  description: string;
  subtext: string;
  icon: React.ReactNode;
  category: 'special' | 'general';
};

type AttachedItem = {
  id: string;
  kind: 'file' | 'text';
  file?: File;
  name: string;
  mimeType?: string;
  textContent?: string;
  thumbUrl?: string;
};

type PreviewType = 'image' | 'video' | 'audio' | 'text';

type PreviewState = {
  itemId: string;
  type: PreviewType;
  url?: string;
  textPreview?: string;
};



// === 4. Helper Functions (파일 포맷팅 및 카테고리 분류 유틸 함수) ===
const formatItemSize = (item: AttachedItem) => {
  if (item.kind === 'file' && item.file) {
    const size = item.file.size;
    if (!size) return '';
    const kb = size / 1024;
    if (kb >= 1024) {
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
  }
  if (item.kind === 'text') {
    const len = item.textContent?.length ?? 0;
    if (!len) return '';
    return `${len}자 텍스트`;
  }
  return '';
};

type FileCategory = 'image' | 'video' | 'audio' | 'model' | 'document' | 'code' | 'archive' | 'other';

const getFileCategory = (ext: string): FileCategory => {
  const e = ext.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tif', 'tiff'].includes(e)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'].includes(e)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(e)) return 'audio';
  if (['obj', 'fbx', 'glb', 'gltf', 'stl', '3ds', 'blend'].includes(e)) return 'model';
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md'].includes(e)) return 'document';
  if (['js', 'ts', 'tsx', 'jsx', 'java', 'py', 'cs', 'cpp', 'c', 'html', 'css', 'json', 'yml', 'yaml'].includes(e)) return 'code';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'archive';
  return 'other';
};

const getFileIconByExt = (ext: string) => {
  const cat = getFileCategory(ext);
  switch (cat) {
    case 'image':
      return <ImageIcon size={18} className="text-blue-500" />;
    case 'video':
      return <Play size={18} />;
    case 'audio':
      return <Music size={18} className="text-blue-500" />;
    case 'model':
      return <Cpu size={16} className="text-purple-500" />;
    case 'document':
      return <FileTextIcon size={16} className="text-blue-500" />;
    case 'code':
      return <Terminal size={16} className="text-gray-700" />;
    case 'archive':
      return <Cloud size={16} className="text-amber-500" />;
    case 'other':
    default:
      return <FileText size={18} className="text-blue-500" />;
  }
};

// === 5. Static Data (정적 데이터: 모델 목록 및 도구 설명) ===
const MODELS: ModelType[] = [
  {
    id: 'hanbat',
    name: 'Hanbat AI',
    description: 'EXAONE Fine-tuned',
    subtext: '현재 개발 중이며 한밭대 전용 모델입니다.',
    icon: <GraduationCap size={16} className="text-blue-600" />,
    category: 'special'
  },
  {
    id: 'standard',
    name: '기본 모드',
    description: 'Gemini 3 Pro',
    subtext: '균형 잡힌 표준 성능',
    icon: <Sparkles size={16} className="text-gray-500" />,
    category: 'general'
  },
  {
    id: 'fast',
    name: '빠른 모드',
    description: 'Gemini 3 Flash',
    subtext: '가장 빠른 응답 속도',
    icon: <Zap size={16} className="text-yellow-500" />,
    category: 'general'
  },
  {
    id: 'deep',
    name: '사고 모드',
    description: 'Gemini 3.1 Pro',
    subtext: '복잡한 문제 해결 및 추론',
    icon: <Cpu size={16} className="text-purple-500" />,
    category: 'general'
  },
];


const GoogleDriveIcon = () => (
  <Image
    src="/googledrive.svg"
    alt="Google Drive"
    width={16}
    height={16}
    className="object-contain"
  />
);

const GoogleKeep = () => (
  <Image
    src="/googlekeep.svg"
    alt="Google Keep"
    width={16}
    height={16}
    className="object-contain"
  />
);

const Gmail = () => (
  <Image
    src="/gmail.svg"
    alt="Gmail"
    width={16}
    height={16}
    className="object-contain"
  />
);

const GoogleCalendar = () => (
  <Image
    src="/googlecalendar.svg"
    alt="Google Calendar"
    width={16}
    height={16}
    className="object-contain"
  />
);

const GoogleDocs = () => (
  <Image
    src="/googledocs.svg"
    alt="Google Docs"
    width={16}
    height={16}
    className="object-contain"
  />
);

const TOOL_DATA: Record<string, { title: string; examples: string[] }> = {
  'hanbat': {
    title: '한밭대학교에 대해 무엇이든 물어보세요',
    examples: [
      '우리 학교 졸업요건 알려줘',
      '수강신청 관련 팁 좀 정리해 줄래?',
      '기숙사 입사/퇴사 절차 알려줘',
    ],
  },
  'search': {
    title: '웹 검색으로 세상의 모든 정보를 탐색해 보세요',
    examples: [
      '오늘 대전 날씨 어때?',
      '대전에서 예쁜 카페 뭐가 있어?',
      '대전에서 친구들과 놀러갈 장소 추천해줘?',
    ],
  },
  'doc': {
    title: '아이디어를 문서로 구체화시켜 보세요',
    examples: [
      '한밭대학교 축제 기획안 초안 작성해줘',
      '여름방학 계획을 세우고 싶어. 표로 정리해줘.',
      '오늘 회의록 요약하고 다음 액션 아이템 뽑아줘',
    ],
  },
  'code': {
    title: '코드를 작성하거나 기존 코드를 분석해 보세요',
    examples: [
      'React로 간단한 투두리스트 앱 만들어줘',
      '피보나치 수열을 계산하는 파이썬 함수 짜줘',
      '이 JavaScript 코드에서 버그 좀 찾아줄래?',
    ],
  },
  'learn': {
    title: '새로운 지식을 배우거나 기존 지식을 정리해 보세요',
    examples: [
      '머신러닝의 기본 개념에 대해 설명해줘',
      '조선시대 왕들의 업적을 순서대로 알려줘',
      '영어 면접에서 자주 나오는 질문과 답변 좀 알려줘',
    ],
  },
  'image': {
    title: '상상하는 모든 것을 이미지로 만들어 보세요',
    examples: [
      '밤하늘의 은하수를 건너는 우주 고래 그려줘',
      '미래 도시의 모습을 사이버펑크 스타일로 그려줘',
      '귀여운 강아지가 노트북으로 코딩하는 모습',
    ],
  },
  'deepdive': {
    title: '하나의 주제에 대해 깊이 있게 탐색해 보세요',
    examples: [
      '대한민국 저출산 문제의 핵심 원인과 해결 방안에 대해 스틸맨 방식으로 분석해줘',
      '기본소득제 도입에 대한 찬성측과 반대측의 핵심 논거를 비교 분석해줘',
      '기후 변화 위기, 정말 인간의 책임일까? 반대 의견을 포함해서 깊이있게 알려줘',
    ],
  },
};


// === 6. Main Component (메인 애플리케이션 컴포넌트) ===
export default function App() {
  const router = useRouter();

  // --- 상태(State) 선언부 ---
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Authentication Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [selectedModel, setSelectedModel] = useState<ModelType>(MODELS[1]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isHanbatToolsActive, setIsHanbatToolsActive] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  // [Refactor] 기존에 7개나 되던 Tool 활성화 boolean 변수들을 제거하고 selectedTool로 통합관리
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isModelSwitchModalOpen, setIsModelSwitchModalOpen] = useState(false);
  const [toolToActivate, setToolToActivate] = useState<string | null>(null);
  const [isConnectorMenuOpen, setIsConnectorMenuOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 파일 첨부 상태
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([]);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const plusMenuRef = useRef<HTMLDivElement>(null);
  const toolMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // 파일 첨부 핸들러
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      const now = Date.now();
      const newItems: AttachedItem[] = files.map((file, idx) => {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg'].includes(ext);
        const thumbUrl = isImage ? URL.createObjectURL(file) : undefined;
        return {
          id: `file_${now}_${idx}`,
          kind: 'file',
          file,
          name: file.name,
          mimeType: file.type,
          thumbUrl,
        };
      });
      setAttachedItems(prev => [...prev, ...newItems]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedItems(prev => {
      const target = prev[index];
      if (target?.thumbUrl) {
        URL.revokeObjectURL(target.thumbUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
    setPreview(prevState => {
      if (!prevState) return prevState;
      const removedItem = attachedItems[index];
      if (removedItem && prevState.itemId === removedItem.id) {
        if (prevState.url) {
          URL.revokeObjectURL(prevState.url);
        }
        return null;
      }
      return prevState;
    });
  };

  const addTextAttachment = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 50) return;
    const id = `text_${Date.now()}`;
    const name = '복사된 텍스트';
    const newItem: AttachedItem = {
      id,
      kind: 'text',
      name,
      mimeType: 'text/plain',
      textContent: trimmed,
    };
    setAttachedItems(prev => [...prev, newItem]);
  };

  const handlePasteToAttachment = (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const items = Array.from(e.clipboardData.items || []);
    const imageItem = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        const now = Date.now();
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg'].includes(ext);
        const thumbUrl = isImage ? URL.createObjectURL(file) : undefined;
        const newItem: AttachedItem = {
          id: `file_paste_${now}`,
          kind: 'file',
          file,
          name: file.name || '붙여넣은 이미지',
          mimeType: file.type,
          thumbUrl,
        };
        setAttachedItems((prev) => [...prev, newItem]);
      }
      return;
    }

    const text = e.clipboardData.getData('text');
    if (text && text.length >= 50) {
      e.preventDefault();
      addTextAttachment(text);
    }
  };

  const getFileExtension = (name: string) => {
    const parts = name.split('.');
    if (parts.length <= 1) return '';
    return parts.pop()!.toLowerCase();
  };

  const isPreviewableExt = (ext: string) => {
    const cat = getFileCategory(ext);
    // 이미지/영상/음원/텍스트(txt)만 오버레이 미리보기 허용
    return cat === 'image' || cat === 'video' || cat === 'audio' || ext === 'txt';
  };

  // --- 파일 다운로드 및 미리보기 관련 함수 ---
  const handleDownload = (item: AttachedItem) => {
    let filename = item.name || 'download';

    if (item.kind === 'file' && item.file) {
      const url = URL.createObjectURL(item.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    const text = item.textContent ?? '';
    const blob = new Blob([text], { type: item.mimeType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openPreviewForItem = (item: AttachedItem) => {
    if (item.kind === 'text') {
      setPreview({
        itemId: item.id,
        type: 'text',
        textPreview: item.textContent ?? '',
      });
      return;
    }
    if (!item.file) return;
    const ext = getFileExtension(item.name);
    if (!isPreviewableExt(ext)) {
      handleDownload(item);
      return;
    }

    setPreview(prevState => {
      if (prevState?.url) {
        URL.revokeObjectURL(prevState.url);
      }
      return prevState;
    });

    const cat = getFileCategory(ext);

    if (cat === 'image') {
      const url = URL.createObjectURL(item.file);
      setPreview({
        itemId: item.id,
        type: 'image',
        url,
      });
    } else if (cat === 'video') {
      const url = URL.createObjectURL(item.file);
      setPreview({
        itemId: item.id,
        type: 'video',
        url,
      });
    } else if (cat === 'audio') {
      const url = URL.createObjectURL(item.file);
      setPreview({
        itemId: item.id,
        type: 'audio',
        url,
      });
    } else if (ext === 'txt') {
      item.file.text().then(content => {
        setPreview({
          itemId: item.id,
          type: 'text',
          textPreview: content.slice(0, 50),
        });
      }).catch(() => {
        setPreview(null);
      });
    }
  };

  const handleNewChat = () => {
    router.push('/');
  };

  const openTermsModal = async () => {
    if (!termsContent) {
      try {
        const res = await fetch('/docs/terms_of_service.md');
        const text = await res.text();
        setTermsContent(text);
      } catch {
        setTermsContent('이용약관을 불러오는 데 실패했습니다.');
      }
    }
    setIsTermsOpen(true);
  };

  const openPrivacyModal = async () => {
    if (!privacyContent) {
      try {
        const res = await fetch('/docs/privacy_policy.md');
        const text = await res.text();
        setPrivacyContent(text);
      } catch {
        setPrivacyContent('개인정보 처리방침을 불러오는 데 실패했습니다.');
      }
    }
    setIsPrivacyOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (plusMenuRef.current && !plusMenuRef.current.contains(target)) {
        setIsPlusMenuOpen(false);
        setIsConnectorMenuOpen(false);
      }
      if (toolMenuRef.current && !toolMenuRef.current.contains(target)) setIsToolMenuOpen(false);
      if (modelMenuRef.current && !modelMenuRef.current.contains(target)) setIsModelMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) setIsProfileMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (input.trim() || attachedItems.length > 0) {
      sessionStorage.setItem('hanbat_chat_state', JSON.stringify({
        input,
        selectedModelId: selectedModel.id,
        selectedTool,
        hasFiles: attachedItems.length > 0,
        // attachedItems 자체를 전달하려면 파일 객체 처리가 복잡하므로 간단히 메타데이터만 포함하거나,
        // 필요시 직렬화 가능한 데이터만 필터링하여 저장할 수 있습니다. 
        // 여기선 요구사항에 맞게 '파일 유무', '메시지 내용' 등을 이전 페이지에서 상속받도록 합니다.
        attachedItems: attachedItems.map(item => ({
          id: item.id,
          kind: item.kind,
          name: item.name,
          mimeType: item.mimeType,
          textContent: item.textContent,
          thumbUrl: item.thumbUrl
        }))
      }));
      router.push('/chat');
    }
  };

  // --- 액션 및 도구(Tool) 선택 핸들러 ---
  const handleToolClick = (toolName: string) => {
    if (selectedModel.id === 'hanbat' && toolName !== 'hanbat') {
      setToolToActivate(toolName);
      setIsModelSwitchModalOpen(true);
      return;
    }
    activateTool(toolName);
  }

  const activateTool = (toolName: string) => {
    // Toggle behavior
    if (selectedTool === toolName) {
      setSelectedTool(null);
    } else {
      setSelectedTool(toolName);
    }
    setIsToolMenuOpen(false);
  }

  const handleConfirmSwitch = () => {
    setSelectedModel(MODELS[1]); // Set to '기본' model
    if (toolToActivate) {
      activateTool(toolToActivate);
    }
    setIsModelSwitchModalOpen(false);
    setToolToActivate(null);
  }

  const handleCancelSwitch = () => {
    setIsModelSwitchModalOpen(false);
    setToolToActivate(null);
  }

  // --- 서브 UI 컴포넌트: 파일첨부 및 드롭다운 메뉴용 버튼 ---
  const MenuButton = ({ icon: Icon, label, onClick, active = false, color = "blue", badge }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors w-full ${active ? `bg-${color}-50 text-${color}-600` : 'hover:bg-gray-100 text-gray-700'
        }`}
    >
      <span className="flex items-center gap-3">
        <Icon size={18} />
        <div className="flex flex-col items-start gap-1">
          <span>{label}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-600 font-semibold">
              {badge}
            </span>
          )}
        </div>
      </span>
      {active && (
        <Check size={16} className={`text-${color}-600`} />
      )}
    </button>
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#f8f9fa] text-gray-800 font-sans selection:bg-blue-100">

      {isModelSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full m-4 animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-gray-900">모델 전환 필요</h3>
            <p className="text-sm text-gray-600 mt-2">
              해당 도구는 '기본' 모드에서만 사용할 수 있습니다.
              <br />
              기본 모드로 전환하시겠습니까?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelSwitch}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                전환하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이용약관 모달 */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsTermsOpen(false)}>
          <div
            className="bg-white/95 w-full sm:max-w-2xl sm:w-[90%] sm:rounded-[32px] rounded-t-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500 max-h-[85vh] flex flex-col border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100/50">
              <div>
                <h2 className="text-[19px] font-bold text-gray-900 tracking-tight font-[family-name:var(--font-nanum-gothic)]">이용약관</h2>
                <p className="text-[12px] text-gray-400 mt-1 font-medium font-[family-name:var(--font-nanum-gothic)]">한밭메이트 서비스 이용을 위한 정책입니다.</p>
              </div>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-8 py-8 custom-scrollbar">
              <div className="prose prose-sm prose-blue max-w-none text-gray-600 leading-relaxed text-[14px] font-[family-name:var(--font-nanum-gothic)] antialiased prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight prose-p:mb-4 prose-li:my-1 prose-strong:text-blue-600 prose-strong:font-bold">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {termsContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 이용 및 활용 모달 */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsPrivacyOpen(false)}>
          <div
            className="bg-white/95 w-full sm:max-w-2xl sm:w-[90%] sm:rounded-[32px] rounded-t-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500 max-h-[85vh] flex flex-col border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100/50">
              <div>
                <h2 className="text-[19px] font-bold text-gray-900 tracking-tight font-[family-name:var(--font-nanum-gothic)]">개인정보 이용 및 활용</h2>
                <p className="text-[12px] text-gray-400 mt-1 font-medium font-[family-name:var(--font-nanum-gothic)]">데이터 보호를 위한 개인정보 정책입니다.</p>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-8 py-8 custom-scrollbar">
              <div className="prose prose-sm prose-blue max-w-none text-gray-600 leading-relaxed text-[14px] font-[family-name:var(--font-nanum-gothic)] antialiased prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight prose-p:mb-4 prose-li:my-1 prose-strong:text-blue-600 prose-strong:font-bold">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {privacyContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 숨겨진 다중 파일 입력 */}
      {/* iOS/iPadOS 파일 앱 호환성 향상을 위해 accept 추가 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="*/*"
      />

      {/* --- 사이드바 영역 --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#f9f9f9] border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            {isSearchMode ? (
              <div className="flex-1 ml-2 relative animate-in fade-in slide-in-from-right-2 duration-300">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="대화 검색..."
                  className="w-full px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onBlur={() => !searchQuery && setIsSearchMode(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchMode(false);
                  }}
                />
                <button
                  onClick={() => { setIsSearchMode(false); setSearchQuery(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchMode(true)}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                aria-label="Search History"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 w-full p-3 mb-6 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors border border-gray-200 bg-white shadow-sm active:scale-[0.98]"
          >
            <Plus size={18} />
            <span className="text-sm font-semibold">새 채팅</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-[11px] font-bold text-gray-400 px-3 mb-2 uppercase tracking-wider">최근 대화</div>
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-gray-400">이전 대화 기록이 없습니다.</p>
            </div>
          </div>

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
                target="_blank"
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

      {/* --- 메인 콘텐츠 영역 --- */}
      <div className={`flex-1 flex flex-col relative overflow-hidden bg-white md:rounded-l-[24px] shadow-2xl border-l border-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-50">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu size={20} />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {/* 한밭메이트: 24px, 400웨이트, 시각적 보정을 위해 pt-1 추가 */}
              <h1 className="text-[24px] font-normal leading-none tracking-[0.05em] text-gray-900 font-[family-name:var(--font-black-han-sans)] pt-[2px]">
                <span className="text-blue-600">한밭</span>메이트
              </h1>

              {/* With EXAONE: 나눔고딕 적용, 텍스트 높이 균형을 위해 leading-none 유지 */}
              <span className="text-[10px] font-normal text-gray-400 uppercase tracking-[0.2em] font-[family-name:var(--font-nanum-gothic)] leading-none">
                With GEMINI
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthLoading && (
              user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center rounded-full border border-gray-200 shadow-sm overflow-hidden hover:brightness-95 transition-all w-10 h-10"
                    aria-label="Toggle Profile Menu"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg font-[family-name:var(--font-nanum-gothic)]">
                        {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden font-[family-name:var(--font-nanum-gothic)]">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || "사용자"}</p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 group">
                          <Users size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="font-medium">계정관리</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 group">
                          <Settings size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="font-medium">서비스 설정</span>
                        </button>
                        <div className="h-px bg-gray-100 my-1 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 group-hover:text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                          <span className="font-medium">로그아웃</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 transition-all">
                  <Link href="/signup" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors font-[family-name:var(--font-nanum-gothic)]">회원가입</Link>
                  <Link href="/login" className="px-6 py-2 text-sm font-bold bg-[#1a73e8] text-white rounded-full hover:bg-blue-700 shadow-md transition-all active:scale-95  font-[family-name:var(--font-nanum-gothic)]">로그인</Link>
                </div>
              )
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative scrollbar-hide flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
            <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 로고 이미지: 직접 rounded-2xl 적용 */}
              {!selectedTool && (
                <Image
                  src="/logo.png"
                  alt="한밭메이트 로고"
                  width={64}
                  height={64}
                  className="rounded-2xl object-contain shadow-sm"
                />
              )}

              {/* 타이틀: 로고와의 간격을 위해 mt-6 추가 */}
              <h2 className="mt-6 text-xl md:text-2xl font-semibold text-gray-800 text-center font-[family-name:var(--font-nanum-gothic)]">
                {selectedTool && TOOL_DATA[selectedTool]
                  ? TOOL_DATA[selectedTool].title
                  : '개인 AI 어시스턴트, 한밭메이트를 만나 보세요'}
              </h2>
            </div>

            <div className="w-full max-w-3xl">
              {selectedTool && TOOL_DATA[selectedTool] && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {TOOL_DATA[selectedTool].examples.map((q: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="p-4 bg-white rounded-2xl text-left text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="bg-[#f0f4f9] rounded-[32px] p-4 border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all shadow-sm focus-within:shadow-md">

                {/* 첨부 파일 카드 - Apple 스타일 */}
                {attachedItems.length > 0 && (
                  <div className="flex items-end gap-2 overflow-x-auto pb-1 custom-scrollbar px-2 pt-1">
                    {attachedItems.map((item, index) => {
                      const ext = item.kind === 'file' ? getFileExtension(item.name) : 'txt';
                      const cat = getFileCategory(ext);
                      const isImage = cat === 'image';
                      const isVideo = cat === 'video';
                      const isAudio = cat === 'audio';
                      const isText = item.kind === 'text';
                      const extLabel = ext.toUpperCase() || 'FILE';

                      // 이미지: 정사각형 썸네일
                      if (isImage && item.thumbUrl) {
                        return (
                          <div key={index} className="relative flex-shrink-0 group cursor-pointer" onClick={() => openPreviewForItem(item)}>
                            <img
                              src={item.thumbUrl}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm group-hover:brightness-90 transition-all"
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                              type="button"
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500"
                            >
                              <X size={10} strokeWidth={3} />
                            </button>
                          </div>
                        );
                      }

                      // 파일/텍스트/오디오/비디오: pill 카드
                      const iconBg = isAudio ? 'bg-blue-50 text-blue-500' : isText ? 'bg-gray-100 text-gray-500' : isVideo ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500';
                      const fileIcon = isAudio ? <Music size={14} /> : isText ? <FileTextIcon size={14} /> : isVideo ? <Play size={14} /> : <FileTextIcon size={14} />;
                      const fileLabel = isText ? '복사된 텍스트' : isAudio ? 'AUDIO' : isVideo ? 'VIDEO' : extLabel;

                      return (
                        <div
                          key={index}
                          className="relative flex-shrink-0 flex items-center gap-2 pl-2 pr-8 py-2 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-all cursor-pointer max-w-[180px] group"
                          onClick={() => openPreviewForItem(item)}
                          title={item.name}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                            {fileIcon}
                          </div>
                          <div className="flex flex-col overflow-hidden min-w-0">
                            <span className="text-[12px] font-semibold text-gray-700 truncate leading-tight">{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium leading-tight">{fileLabel}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            type="button"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="한밭메이트에게 궁금하신 내용을 물어보세요"
                  className="w-full bg-transparent border-none outline-none text-medium px-4 py-2 resize-none placeholder-gray-400 min-h-[50px] custom-scrollbar"
                  onPaste={handlePasteToAttachment}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />

                <div className="flex items-center justify-between px-2 mt-2">
                  <div className="flex items-center gap-2">
                    {/* + 버튼: 파일 첨부 + 구글 드라이브 */}
                    <div className="relative" ref={plusMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${isPlusMenuOpen ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                      >
                        <Plus size={22} className={isPlusMenuOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
                      </button>

                      {isPlusMenuOpen && (
                        <div className="absolute left-0 bottom-full mb-3 py-2 px-1.5 bg-white border border-gray-200 rounded-2xl z-50 min-w-[240px] shadow-xl animate-in fade-in zoom-in-95 duration-200 font-[family-name:var(--font-nanum-gothic)]">

                          {/* 1. 파일 업로드 (Lucide: Paperclip) */}
                          <MenuButton
                            icon={Paperclip}
                            label="파일 업로드"
                            onClick={() => { handleAttachmentClick(); setIsPlusMenuOpen(false); }}
                          />

                          {/* 2. Google Drive (SVG) */}
                          <MenuButton
                            icon={GoogleDriveIcon}
                            label="Google Drive에서 가져오기"
                            onClick={() => setIsPlusMenuOpen(false)}
                          />

                          <div className="h-px bg-gray-100 my-1 mx-2" />

                          {/* 3. 커넥터 연결 (Lucide: Link2) - click 방식 */}
                          <div>
                            <MenuButton
                              icon={Link2}
                              label="커넥터 연결"
                              onClick={() => setIsConnectorMenuOpen(!isConnectorMenuOpen)}
                              active={isConnectorMenuOpen}
                            />
                            {isConnectorMenuOpen && (
                              <div className="ml-3 mt-1 mb-1 pl-3 border-l-2 border-gray-100 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                <MenuButton icon={GoogleCalendar} label="Google 캘린더" onClick={() => { setIsConnectorMenuOpen(false); setIsPlusMenuOpen(false); }} />
                                <MenuButton icon={GoogleDocs} label="Google 독스" onClick={() => { setIsConnectorMenuOpen(false); setIsPlusMenuOpen(false); }} />
                                <MenuButton icon={GoogleKeep} label="Google Keeps" onClick={() => { setIsConnectorMenuOpen(false); setIsPlusMenuOpen(false); }} />
                                <MenuButton icon={Gmail} label="Google 메일" onClick={() => { setIsConnectorMenuOpen(false); setIsPlusMenuOpen(false); }} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 도구 메뉴 영역 */}
                      <div className="relative" ref={toolMenuRef}>
                        <button
                          type="button"
                          onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                          className={`flex items-center justify-center h-10 rounded-full px-3 transition-all ${isToolMenuOpen || selectedTool ? 'text-blue-600' : 'hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                          <Wrench size={20} />
                          {!selectedTool && !isToolMenuOpen && (
                            <span className="ml-2 text-sm font-medium">
                              도구
                            </span>
                          )}
                        </button>

                        {isToolMenuOpen && (
                          <div className="absolute left-0 bottom-full mb-3 py-2 px-1.5 bg-white border border-gray-200 rounded-2xl z-50 min-w-[190px] shadow-xl animate-in fade-in zoom-in-95 duration-200 font-[family-name:var(--font-nanum-gothic)]">

                            <MenuButton
                              icon={Wrench} label="Hanbat Tools" active={selectedTool === 'hanbat'}
                              onClick={() => handleToolClick('hanbat')}
                            />

                            <div className="h-px bg-gray-100 my-1 mx-2" />

                            <MenuButton icon={Globe} label="웹 검색" active={selectedTool === 'search'} onClick={() => handleToolClick('search')} />

                            <MenuButton icon={FlaskConical} label="심층 조사" active={selectedTool === 'deepdive'} onClick={() => handleToolClick('deepdive')} />

                            <MenuButton icon={FileTextIcon} label="문서 작성" active={selectedTool === 'doc'} onClick={() => handleToolClick('doc')} />

                            <MenuButton icon={Terminal} label="코드 작성" active={selectedTool === 'code'} onClick={() => handleToolClick('code')} />

                            <MenuButton icon={BookOpen} label="학습하기" active={selectedTool === 'learn'} onClick={() => handleToolClick('learn')} />

                            <MenuButton icon={Sparkles} label="이미지 생성" badge="Nano Banana Pro" active={selectedTool === 'image'} onClick={() => handleToolClick('image')} />
                          </div>
                        )}
                      </div>

                      {/* 활성화된 도구 배지 (단일 배지만 표시됨) */}
                      <div className="flex flex-wrap gap-2">
                        {selectedTool === 'hanbat' && <ActiveBadge label="Hanbat Tools" icon={Wrench} onClick={() => setSelectedTool(null)} />}
                        {selectedTool === 'deepdive' && <ActiveBadge label="심층 조사" icon={FlaskConical} onClick={() => setSelectedTool(null)} />}
                        {selectedTool === 'search' && <ActiveBadge label="웹 검색" icon={Globe} onClick={() => setSelectedTool(null)} />}
                        {selectedTool === 'doc' && <ActiveBadge label="문서 작성" icon={FileTextIcon} onClick={() => setSelectedTool(null)} />}
                        {selectedTool === 'code' && <ActiveBadge label="코드 작성" icon={Terminal} onClick={() => setSelectedTool(null)} />}
                        {selectedTool === 'learn' && <ActiveBadge label="학습하기" icon={BookOpen} onClick={() => setSelectedTool(null)} />}
                        {selectedTool === 'image' && <ActiveBadge label="이미지 생성" icon={Sparkles} onClick={() => setSelectedTool(null)} />}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 모델 선택 */}
                    <div className="relative" ref={modelMenuRef}>
                      <button
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 hover:bg-gray-200 rounded-full text-[13px] font-bold transition-colors ring-1 ring-inset ${isModelMenuOpen ? 'bg-white text-blue-600 ring-blue-200 shadow-sm' : 'bg-gray-200/50 text-gray-700 ring-transparent'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {selectedModel.id === 'hanbat' && <GraduationCap size={14} />}
                          {selectedModel.name}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ml-0.5 ${selectedModel.id === 'hanbat' ? 'bg-blue-600 animate-pulse'
                          : selectedModel.id === 'fast' ? 'bg-yellow-400'
                            : selectedModel.id === 'deep' ? 'bg-purple-500'
                              : 'bg-gray-400'
                          }`} />
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isModelMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-3 py-2 bg-white border border-gray-200 rounded-[24px] z-50 min-w-[300px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                          <button
                            disabled
                            className={`w-full flex items-center justify-between px-4 py-4 transition-colors text-left opacity-60 cursor-not-allowed ${selectedModel.id === 'hanbat' ? 'bg-blue-50/70' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100">
                                {MODELS[0].icon}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-black text-gray-900">{MODELS[0].name}</span>
                                <span className="text-[11px] text-gray-500 mt-0.5 font-medium">{MODELS[0].subtext}</span>
                              </div>
                            </div>
                            {selectedModel.id === 'hanbat' && <Check size={18} className="text-blue-600 mr-1" strokeWidth={3} />}
                          </button>
                          <div className="mx-4 my-1 border-t border-gray-100" />
                          {MODELS.slice(1).map((model) => (
                            <button
                              key={model.id}
                              onClick={() => { setSelectedModel(model); setIsModelMenuOpen(false); }}
                              className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left ${selectedModel.id === model.id ? 'bg-gray-50' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">{model.icon}</div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700">{model.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-600 font-semibold">{model.description}</span>
                                  </div>
                                  <span className="text-[11px] text-gray-400 mt-0.5">{model.subtext}</span>
                                </div>
                              </div>
                              {selectedModel.id === model.id && <Check size={16} className="text-gray-900 mr-1" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {(input.trim() || attachedItems.length > 0) && (
                      <button
                        onClick={handleSend}
                        className="flex items-center justify-center w-10 h-10 bg-[#1a73e8] text-white rounded-full hover:bg-blue-700 transition-all shadow-md animate-in fade-in slide-in-from-left-2 duration-300 active:scale-90"
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 첨부 미리보기 오버레이 */}
        {preview && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="max-w-2xl w-[90%] md:w-[70%] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    {preview.type === 'image' && <ImageIcon size={18} />}
                    {preview.type === 'video' && <Play size={16} />}
                    {preview.type === 'audio' && <Music size={16} />}
                    {preview.type === 'text' && <FileTextIcon size={16} />}
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[220px]">
                    {attachedItems.find((it) => it.id === preview.itemId)?.name ?? '첨부 미리보기'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (preview?.url) {
                      URL.revokeObjectURL(preview.url);
                    }
                    setPreview(null);
                  }}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ff5f57] border border-[#e0483c] shadow-sm hover:brightness-105 transition"
                  aria-label="미리보기 닫기"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>

              <div className="bg-gray-50 px-4 py-4 flex items-center justify-center">
                {preview.type === 'image' && preview.url && (
                  <img
                    src={preview.url}
                    alt="attachment-preview"
                    className="max-h-[60vh] w-full object-contain rounded-xl bg-white"
                  />
                )}
                {preview.type === 'video' && preview.url && (
                  <video
                    src={preview.url}
                    controls
                    className="max-h-[60vh] w-full rounded-xl bg-black"
                  />
                )}
                {preview.type === 'audio' && preview.url && (
                  <audio
                    src={preview.url}
                    controls
                    className="w-full"
                  />
                )}
                {preview.type === 'text' && (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words max-h-[50vh] w-full overflow-y-auto custom-scrollbar px-1">
                    {preview.textPreview}
                  </p>
                )}
              </div>

              <div className="flex justify-end px-4 py-3 border-t border-gray-100">
                {(() => {
                  const item = attachedItems.find((it) => it.id === preview.itemId);
                  if (!item) return null;
                  const isCopiedText = item.kind === 'text';
                  if (isCopiedText) {
                    return (
                      <button
                        type="button"
                        onClick={async () => {
                          if (item.textContent) {
                            try {
                              await navigator.clipboard.writeText(item.textContent);
                            } catch {
                              // ignore
                            }
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 rounded-full bg-blue-50 hover:bg-blue-100"
                      >
                        <Copy size={14} />
                        <span>클립보드 복사</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 rounded-full bg-blue-50 hover:bg-blue-100"
                    >
                      <FileTextIcon size={14} />
                      <span>다운로드</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <footer className="py-6 pb-8 px-6 text-center w-full max-w-3xl mx-auto">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            AI 챗봇 한밭메이트에 메시지를 보냄으로써,
            <button onClick={openTermsModal} className="hover:text-blue-500 underline cursor-pointer mx-1 transition-colors">이용약관</button>에 동의하고
            <button onClick={openPrivacyModal} className="hover:text-blue-500 underline cursor-pointer mx-1 transition-colors">개인정보 이용 및 활용</button>에 동의하신 것으로 간주합니다.
            <br />
            한밭메이트는 틀린 정보를 생성할 수 있습니다. 중요한 정보는 직접 확인해 주세요.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

// === 7. Sub Components (메인 밖에서 선언된 하위 컴포넌트) ===
function ActiveBadge({ label, icon: Icon, onClick }: { label: string, icon: any, onClick: () => void }) {
  const isHanbat = label === "Hanbat Tools";

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center transition-all active:scale-95 animate-in fade-in zoom-in-90 font-[family-name:var(--font-nanum-gothic)] group"
    >
      {isHanbat ? (
        /* Hanbat Tools: 상시 그라데이션 보더 스타일 */
        <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm">
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white rounded-full">
            <span className="text-blue-700 text-[14px] font-bold tracking-tight">{label}</span>
            <X size={16} className="text-blue-500 hidden group-hover:inline-block ml-2" />
          </div>
        </div>
      ) : (
        /* 일반 도구: 아이콘 -> X 아이콘 교체 */
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-full border border-blue-200">
          <Icon size={16} strokeWidth={2.5} className="group-hover:hidden" />
          <X size={16} className="hidden group-hover:inline-block" />
          <span className="text-[14px] font-medium">{label}</span>
        </div>
      )}
    </button>
  );
}
