"use client";

// === 1. Imports (라이브러리 및 컴포넌트 임포트) ===
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FileText as FileTextIcon, Terminal, Link2, Menu, X, Search,
    BookOpen, Send, ExternalLink, Settings, Home as HomeIcon, Globe,
    Users, Plus, Wrench, ChevronDown, Copy, Image as ImageIcon,
    Cloud, Zap, Cpu, Sparkles, Check, GraduationCap, FileText,
    Paperclip, Music, Play, FlaskConical, RotateCw, Pencil,
    SearchCheck, MoreVertical, Info, AlertOctagon, ThumbsUp, ThumbsDown,
    Flag, IterationCw as Iteration, Loader2
} from 'lucide-react';

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
    kind: FileCategory | 'text';
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

type VerifiedSegment = {
    text: string;
    sourceIds: string[];
};

type SourceInfo = {
    id: string;
    title: string;
    url: string;
    snippet: string;
};

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    files?: AttachedItem[];
    thinkingSteps?: string[];
    showThinking?: boolean;
    lastThought?: string;
    liked?: boolean;
    disliked?: boolean;
    verifiedSegments?: VerifiedSegment[];
    sources?: SourceInfo[];
};

// === 4. Helper Functions (파일 포맷팅 및 카테고리 분류 유틸 함수) ===
const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
};
const isPreviewableExt = (ext: string) => {
    const previewableImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const previewableVideo = ['mp4', 'webm', 'ogg'];
    const previewableAudio = ['mp3', 'wav', 'ogg'];
    return [...previewableImage, ...previewableVideo, ...previewableAudio, 'txt'].includes(ext);
};

const formatItemSize = (item: AttachedItem) => {
    if (item.kind !== 'text' && item.file) {
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
    const [selectedModel, setSelectedModel] = useState<ModelType>(MODELS[1]);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isHanbatToolsActive, setIsHanbatToolsActive] = useState(false);
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [isModelSwitchModalOpen, setIsModelSwitchModalOpen] = useState(false);
    const [toolToActivate, setToolToActivate] = useState<string | null>(null);
    const [isToolChangeModalOpen, setIsToolChangeModalOpen] = useState(false);
    const [pendingTool, setPendingTool] = useState<string | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [editInput, setEditInput] = useState("");
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
    const [isConnectorMenuOpen, setIsConnectorMenuOpen] = useState(false);
    const [showScrollDownButton, setShowScrollDownButton] = useState(false);
    const [activeNotification, setActiveNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
    const [isVerifying, setIsVerifying] = useState<string | null>(null);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [selectedLegalIssue, setSelectedLegalIssue] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 파일 첨부 상태
    const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([]);
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // 세션 스토리지 기반 초기 상태 로드 (온보딩으로부터 상속)
    useEffect(() => {
        const inheritState = () => {
            try {
                const saved = sessionStorage.getItem('hanbat_chat_state');
                if (saved) {
                    const state = JSON.parse(saved);
                    // 모드 복원
                    if (state.selectedModelId) {
                        const m = MODELS.find(x => x.id === state.selectedModelId);
                        if (m) setSelectedModel(m);
                    }
                    // 툴 복원
                    if (state.selectedTool) {
                        setSelectedTool(state.selectedTool);
                    }
                    // 파일들 및 메시지 내용이 넘어온 경우 로드하여 첫 메시지로 처리
                    if (state.input || (state.attachedItems && state.attachedItems.length > 0)) {
                        setMessages([
                            {
                                id: Date.now().toString(),
                                role: 'user',
                                content: state.input || '',
                                files: state.attachedItems || []
                            },
                            {
                                id: (Date.now() + 1).toString(),
                                role: 'ai',
                                content: '안녕하세요, 한밭메이트입니다! 👋\n\n무엇을 도와드릴까요?',
                            }
                        ]);
                    }
                    sessionStorage.removeItem('hanbat_chat_state'); // 일회성 소비
                }
            } catch (e) { }
        };
        inheritState();
    }, []);

    // 모드 변경 시 -> 대화 내용 유지
    const handleModelChange = (model: ModelType, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedModel(model);
        setIsModelMenuOpen(false);
        // messages 유지 (setMessages([]) 제거)
    };

    const plusMenuRef = useRef<HTMLDivElement>(null);
    const toolMenuRef = useRef<HTMLDivElement>(null);
    const modelMenuRef = useRef<HTMLDivElement>(null);
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
                const cat = getFileCategory(ext);
                const isImage = cat === 'image';
                const thumbUrl = isImage ? URL.createObjectURL(file) : undefined;
                return {
                    id: `file_${now}_${idx}`,
                    kind: cat,
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

    const removeAttachment = (id: string) => {
        setAttachedItems(prev => {
            const target = prev.find(it => it.id === id);
            if (target?.thumbUrl) {
                URL.revokeObjectURL(target.thumbUrl);
            }
            return prev.filter(it => it.id !== id);
        });
        setPreview(prevState => {
            if (!prevState) return prevState;
            if (prevState.itemId === id) {
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
        const imageItem = items.find((item) => item.kind !== 'text' && item.type.startsWith('image/'));
        if (imageItem) {
            e.preventDefault();
            const file = imageItem.getAsFile();
            if (file) {
                const now = Date.now();
                const ext = (file.name.split('.').pop() || '').toLowerCase();
                const cat = getFileCategory(ext);
                const isImage = cat === 'image';
                const thumbUrl = isImage ? URL.createObjectURL(file) : undefined;
                const newItem: AttachedItem = {
                    id: `file_paste_${now}`,
                    kind: cat,
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

        if (item.kind !== 'text' && item.file) {
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
        sessionStorage.removeItem('hanbat_chat_state');
        router.push('/');
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (plusMenuRef.current && !plusMenuRef.current.contains(target)) setIsPlusMenuOpen(false);
            if (toolMenuRef.current && !toolMenuRef.current.contains(target)) setIsToolMenuOpen(false);
            if (modelMenuRef.current && !modelMenuRef.current.contains(target)) setIsModelMenuOpen(false);

            // 메시지 수정 아이콘 외부 클릭 시 해제
            if (activeMessageId && !(event.target as HTMLElement).closest('.user-message-wrapper')) {
                setActiveMessageId(null);
            }

            if (activeMenuId && !(event.target as HTMLElement).closest('.ai-menu-container')) {
                setActiveMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeMessageId, activeMenuId]);

    const handleSend = () => {
        if (editingMessageId) {
            handleUpdateMessage();
            return;
        }

        if (input.trim() || attachedItems.length > 0) {
            const userMsgId = Date.now().toString();
            setMessages(prev => [
                ...prev,
                {
                    id: userMsgId,
                    role: 'user',
                    content: input,
                    files: [...attachedItems]
                }
            ]);
            setInput("");
            setAttachedItems([]);

            // AI 응답 시뮬레이션 시작
            setIsGenerating(true);
            const initialSteps = ['사용자 요청 분석 중...', '한밭대 데이터베이스 검색 중...'];
            setThinkingSteps(initialSteps);

            setTimeout(() => {
                const finalSteps = [...initialSteps, '답변 구성 중...'];
                setThinkingSteps(finalSteps);
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: (Date.now() + 1).toString(),
                            role: 'ai',
                            content: '요청하신 내용을 면밀히 분석했습니다. 추가로 궁금한 점이 있으시다면 언제든지 말씀해 주세요.',
                            thinkingSteps: finalSteps,
                            lastThought: '한밭대학교 데이터베이스를 조회하여 최신 정보를 기반으로 답변을 구성했습니다.',
                            showThinking: false
                        }
                    ]);
                    setIsGenerating(false);
                    setThinkingSteps([]);
                }, 1500);
            }, 1000);
        }
    };

    const toggleThinking = (id: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, showThinking: !msg.showThinking } : msg
        ));
    };

    const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
        setActiveNotification({ message, type });
        setTimeout(() => setActiveNotification(null), 3000);
    };

    const handleLike = (id: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, liked: !msg.liked, disliked: false } : msg
        ));
        showNotification("피드백해주셔서 감사합니다");
    };

    const handleDislike = (id: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, disliked: !msg.disliked, liked: false } : msg
        ));
        showNotification("피드백해주셔서 감사합니다");
    };

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (!showScrollDownButton) {
            scrollToBottom('smooth');
        }
    }, [messages, isGenerating]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
        setShowScrollDownButton(!isAtBottom);
    };

    const handleUpdateMessage = () => {
        if (!editingMessageId) return;

        setMessages(prev => {
            const index = prev.findIndex(msg => msg.id === editingMessageId);
            if (index === -1) return prev;

            // 기존 메시지 업데이트
            const newMessages = prev.slice(0, index + 1);
            newMessages[index] = { ...newMessages[index], content: editInput }; // input 대신 editInput 사용

            // 이후 메시지 및 로딩 상태 처리
            setEditingMessageId(null);
            setEditInput("");

            // 답변 재생성 유도
            setTimeout(() => {
                triggerAIResponse(newMessages, index);
            }, 500);

            return newMessages;
        });
    };

    const triggerAIResponse = (currentMessages: ChatMessage[], editedIndex: number) => {
        setIsGenerating(true);
        const initialSteps = ['사용자 요청 분석 중...', '한밭대 데이터베이스 검색 중...'];
        setThinkingSteps(initialSteps);

        setTimeout(() => {
            const finalSteps = [...initialSteps, '답변 구성 중...'];
            setThinkingSteps(finalSteps);
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: '수정하신 내용을 면밀히 분석했습니다. 새로운 정보를 바탕으로 답변 드립니다. 추가로 궁금한 점이 있으시다면 언제든지 말씀해 주세요.',
                        thinkingSteps: finalSteps,
                        lastThought: '수정된 질문에 맞춰 한밭대학교 데이터베이스를 재조회하여 답변을 구성했습니다.',
                        showThinking: false
                    }
                ]);
                setIsGenerating(false);
                setThinkingSteps([]);
            }, 1500);
        }, 1000);
    };

    const handleRegenerate = (id: string) => {
        showNotification("답변 재생성합니다", "info");
        setMessages(prev => {
            const index = prev.findIndex(msg => msg.id === id);
            if (index === -1) return prev;
            const newMessages = [...prev];
            newMessages[index] = {
                ...newMessages[index],
                content: "답변을 다시 생성하고 있습니다... (Mocking)",
                verifiedSegments: undefined,
                sources: undefined
            };
            return newMessages;
        });

        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === id ? {
                    ...msg,
                    content: "요청하신 내용을 다시 분석하여 드리는 새로운 답변입니다. 한밭대학교의 최신 정보를 바탕으로 구성되었습니다.",
                    lastThought: "최신 데이터베이스를 재검색하여 보다 정확한 결과를 도출했습니다."
                } : msg
            ));
        }, 1500);
    };

    const handleVerifyAnswer = (id: string) => {
        setIsVerifying(id);
        showNotification("답변 재확인 중입니다", "info");

        setTimeout(() => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === id) {
                    return {
                        ...msg,
                        verifiedSegments: [
                            { text: "한밭대학교", sourceIds: ["s1"] },
                            { text: "최신 정보를 바탕으로", sourceIds: ["s2"] }
                        ],
                        sources: [
                            { id: "s1", title: "한밭대학교 공식 홈페이지", url: "https://www.hanbat.ac.kr", snippet: "한밭대학교는 1927년에 설립된 국립 종합대학교입니다." },
                            { id: "s2", title: "학사공지 2024-12", url: "https://www.hanbat.ac.kr/notices/123", snippet: "2024학년도 학사 운영 지침 안내입니다." }
                        ]
                    };
                }
                return msg;
            }));
            setIsVerifying(null);
            showNotification("검증이 완료되었습니다");
        }, 2000);
    };

    // --- 액션 및 도구(Tool) 선택 핸들러 ---
    const handleToolClick = (toolName: string) => {
        // 채팅 중일 때에는 도구 버튼을 클릭하면 새로운 채팅 안내 모달로
        if (messages.length > 0) {
            setPendingTool(toolName);
            setIsToolChangeModalOpen(true);
            return;
        }

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

    const handleConfirmToolSwitch = () => {
        if (pendingTool) {
            // 새 도구 설정을 세션에 저장하고 홈으로 이동하여 초기화된 상태로 새 채팅 유도
            sessionStorage.setItem('hanbat_chat_state', JSON.stringify({
                selectedTool: pendingTool,
                selectedModelId: selectedModel.id
            }));
        }
        setIsToolChangeModalOpen(false);
        setPendingTool(null);
        router.push('/');
    };

    const handleCancelToolSwitch = () => {
        setIsToolChangeModalOpen(false);
        setPendingTool(null);
        setIsToolMenuOpen(false); // 도구 메뉴 닫기
    };

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

            {/* 도구 변경 모달 */}
            {isToolChangeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[24px] shadow-2xl p-6 max-w-[360px] w-[90%] font-[family-name:var(--font-nanum-gothic)]">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">새로운 채팅을 시작하시겠습니까?</h3>
                        <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">
                            다른 도구({pendingTool === 'hanbat' ? 'Hanbat Tools' : pendingTool === 'search' ? '웹 검색' : pendingTool === 'deepdive' ? '심층 조사' : pendingTool === 'image' ? '이미지 생성' : pendingTool === 'doc' ? '문서 작성' : pendingTool === 'code' ? '코드 작성' : pendingTool === 'learn' ? '학습하기' : pendingTool})를 선택하시면 진행 중인 대화가 초기화되고 새로운 채팅방이 열립니다.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancelToolSwitch}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmToolSwitch}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#1a73e8] text-white hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                새 채팅 시작하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 사이드바 backdrop 제거 (흐릿함 제거) */}

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
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('hanbat_chat_state');
                                    router.push('/');
                                }}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1.5 font-[family-name:var(--font-nanum-gothic)]"
                            >
                                <Plus size={16} />
                                새로운 메시지
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-2" />
                            <Link href="/auth/signup" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors font-[family-name:var(--font-nanum-gothic)]">회원가입</Link>
                            <Link href="/auth/login" className="px-6 py-2 text-sm font-bold bg-[#1a73e8] text-white rounded-full hover:bg-blue-700 shadow-md transition-all active:scale-95  font-[family-name:var(--font-nanum-gothic)]">로그인</Link>
                        </div>
                    </div>
                </header>

                <main
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col p-6 scroll-smooth pb-0"
                >
                    {/* 메시지 영역 */}
                    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full pb-[200px]">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-10 text-center opacity-70">
                                <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 font-[family-name:var(--font-nanum-gothic)]">무엇을 도와드릴까요?</h2>
                                <p className="text-sm text-gray-500">궁금한 점을 물어보거나 대화를 시작해 보세요.</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    msg.role === 'user' ? (
                                        <div key={msg.id} className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
                                            <div className="flex flex-col items-end gap-3 max-w-[85%]">
                                                {msg.files && msg.files.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 justify-end mb-1">
                                                        {msg.files.map(f => {
                                                            const ext = getFileExtension(f.name);
                                                            const isImage = getFileCategory(ext) === 'image';
                                                            return (
                                                                <div key={f.id} className={`flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl text-gray-800 shadow-sm transition-all hover:border-blue-200 ${isImage ? 'w-24 h-24 !p-0 overflow-hidden flex-shrink-0' : 'min-w-[160px]'}`}>
                                                                    {isImage && f.thumbUrl ? (
                                                                        <div className="relative w-full h-full group/img">
                                                                            <img src={f.thumbUrl} className="w-full h-full object-cover" alt={f.name} />
                                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <button onClick={() => openPreviewForItem(f)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"><Search size={14} /></button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-3 px-3 w-full">
                                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500">
                                                                                {getFileIconByExt(ext)}
                                                                            </div>
                                                                            <div className="flex flex-col overflow-hidden">
                                                                                <span className="text-[11px] font-bold truncate pr-2">{f.name}</span>
                                                                                <span className="text-[9px] text-gray-400 font-bold uppercase">{ext || 'FILE'}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {!msg.content && msg.files && msg.files.length > 0 ? (
                                                    <button
                                                        onClick={() => {
                                                            setEditingMessageId(msg.id);
                                                            setEditInput(msg.content);
                                                            setInput(msg.content);
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-white border border-gray-100 rounded-full transition-all text-[11px] font-bold shadow-sm"
                                                    >
                                                        <Pencil size={12} />
                                                        수정하기
                                                    </button>
                                                ) : (
                                                    <div
                                                        className={`flex flex-col gap-2 max-w-[85%] user-message-wrapper transition-all duration-300 ${activeMessageId === msg.id ? 'translate-x-0' : ''}`}
                                                        onClick={() => setActiveMessageId(msg.id === activeMessageId ? null : msg.id)}
                                                    >
                                                        <div className="flex items-center gap-2 group relative">
                                                            {/* 수정 아이콘: 왼쪽에 배치, 클릭 시에만 노출 */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingMessageId(msg.id);
                                                                    setEditInput(msg.content);
                                                                }}
                                                                className={`p-2 text-gray-400 hover:text-blue-600 transition-all absolute -left-10 ${activeMessageId === msg.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                                                title="메시지 수정"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>

                                                            <div className="bg-white border border-gray-100 text-gray-800 px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed break-words shadow-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={msg.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                                            <div className="flex gap-3 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-blue-100">
                                                    <Image src="/logo.png" alt="AI" width={20} height={20} className="rounded-full object-cover" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                        한밭메이트
                                                        {selectedModel.id === 'hanbat' && (
                                                            <span className="text-[10px] font-medium text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Hanbat AI</span>
                                                        )}
                                                    </div>

                                                    {msg.thinkingSteps && (
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <span className="text-[12px] text-gray-400 italic flex-1 truncate">"{msg.lastThought}"</span>
                                                            <button
                                                                onClick={() => toggleThinking(msg.id)}
                                                                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors whitespace-nowrap ${msg.showThinking
                                                                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                                                                    : 'bg-gray-100 border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
                                                                    }`}
                                                            >
                                                                <Iteration size={12} />
                                                                {msg.showThinking ? '생각 숨기기' : '생각 보기'}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {msg.showThinking && msg.thinkingSteps && (
                                                        <div className="mb-2 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {msg.thinkingSteps.map((step, idx) => (
                                                                <div key={idx} className="text-[12px] text-gray-400 flex items-start gap-1.5">
                                                                    <span className="mt-0.5 text-gray-300">•</span>
                                                                    <span>{step}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="prose prose-sm prose-slate max-w-none text-gray-700 leading-relaxed font-[family-name:var(--font-nanum-gothic)] prose-p:mb-4 prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-6 prose-headings:mb-3 prose-ul:my-4 prose-li:my-1 prose-strong:text-blue-600 prose-strong:font-bold prose-code:bg-blue-50 prose-code:text-blue-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-5 prose-pre:rounded-2xl prose-pre:shadow-lg prose-pre:my-6">
                                                        {msg.verifiedSegments ? (
                                                            msg.content.split(new RegExp(`(${msg.verifiedSegments.map(s => s.text).join('|')})`, 'g')).map((part, i) => {
                                                                const segment = msg.verifiedSegments?.find(s => s.text === part);
                                                                if (segment) {
                                                                    return (
                                                                        <span key={i} className="bg-blue-50 text-blue-700 border-b-2 border-blue-300 font-bold px-0.5 cursor-help transition-colors hover:bg-blue-100 group/verify relative">
                                                                            {part}
                                                                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/verify:opacity-100 transition-opacity bg-white border border-gray-200 p-2 rounded-lg shadow-xl z-50 min-w-[200px] pointer-events-none">
                                                                                <div className="text-[10px] text-gray-400 font-bold mb-1">출처 확인</div>
                                                                                {segment.sourceIds.map(sid => {
                                                                                    const src = msg.sources?.find(s => s.id === sid);
                                                                                    return src && (
                                                                                        <div key={sid} className="text-xs text-gray-700">
                                                                                            • {src.title}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </span>
                                                                    );
                                                                }
                                                                return (
                                                                    <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                                                                        {part}
                                                                    </ReactMarkdown>
                                                                );
                                                            })
                                                        ) : (
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        )}
                                                    </div>

                                                    {/* 출처 리스트 */}
                                                    {msg.sources && (
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <BookOpen size={12} />
                                                                참조 출처
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {msg.sources.map(src => (
                                                                    <a key={src.id} href={src.url} target="_blank" rel="noreferrer" className="block p-2 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group/src">
                                                                        <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                                                                            {src.title}
                                                                            <ExternalLink size={10} className="text-gray-300 group-hover/src:text-blue-500" />
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-400 truncate">{src.snippet}</div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-0.5 mt-1 -ml-1">
                                                        <button
                                                            onClick={() => handleLike(msg.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${msg.liked ? 'text-black bg-gray-100' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
                                                            title="좋아요"
                                                        >
                                                            <ThumbsUp size={16} fill={msg.liked ? "black" : "none"} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDislike(msg.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${msg.disliked ? 'text-black bg-gray-100' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
                                                            title="싫어요"
                                                        >
                                                            <ThumbsDown size={16} fill={msg.disliked ? "black" : "none"} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerate(msg.id)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="다시 생성"
                                                        >
                                                            <RotateCw size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(msg.content);
                                                                showNotification("답변이 복사되었습니다");
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="복사"
                                                        >
                                                            <Copy size={16} />
                                                        </button>

                                                        {/* 더보기 메뉴 */}
                                                        <div className="relative ai-menu-container">
                                                            <button
                                                                onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${activeMenuId === msg.id ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                                                                title="더보기"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>
                                                            {activeMenuId === msg.id && (
                                                                <div className="absolute left-0 top-full mt-1 py-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[220px] animate-in fade-in zoom-in-95 duration-200 font-[family-name:var(--font-nanum-gothic)]">
                                                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">상세 정보</div>
                                                                    <div className="px-3 py-1.5 flex items-center gap-3 text-sm text-gray-700">
                                                                        <Cpu size={16} className="text-gray-400" />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] text-gray-400">모델</span>
                                                                            <span className="font-bold">{selectedModel.name}</span>
                                                                        </div>
                                                                    </div>
                                                                    {selectedTool && (
                                                                        <div className="px-3 py-1.5 flex items-center gap-3 text-sm text-gray-700">
                                                                            <Wrench size={16} className="text-gray-400" />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[11px] text-gray-400">도구</span>
                                                                                <span className="font-bold">{selectedTool}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="px-3 py-1.5 flex items-center gap-3 text-sm text-gray-700 border-b border-gray-50 pb-3">
                                                                        <Info size={16} className="text-gray-400" />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] text-gray-400">라이선스</span>
                                                                            <span className="font-bold">{selectedModel.description}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-2">
                                                                        <button onClick={() => { setActiveMenuId(null); handleVerifyAnswer(msg.id); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                                            {isVerifying === msg.id ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <SearchCheck size={16} className="text-gray-500" />}
                                                                            <span>대답 재확인</span>
                                                                        </button>
                                                                        <button onClick={() => { setActiveMenuId(null); setIsLegalModalOpen(true); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Flag size={16} className="text-gray-500" /><span>법적 문제 신고</span></button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )))
                                }
                                <div ref={messagesEndRef} />


                                {/* 생각 로직 및 로딩 애니메이션 표시 */}
                                {isGenerating && (
                                    <div className="flex justify-start animate-in fade-in duration-300">
                                        <div className="flex gap-3 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1 ai-loading-logo p-0.5 shadow-sm">
                                                <Image src="/logo.png" alt="AI" width={20} height={20} className="rounded-full object-cover" />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="text-sm font-bold text-gray-800">한밭메이트</div>
                                                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm min-w-[300px]">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                                        <Loader2 size={16} className="animate-spin" />
                                                        지금 생각하는 중...
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 ml-6">
                                                        {thinkingSteps.map((step, idx) => (
                                                            <div key={idx} className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-2 transition-all">
                                                                • {step}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* 알림 토스트 */}
                {activeNotification && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] justify-center text-sm font-bold">
                            {activeNotification.type === 'success' ? <Check size={18} className="text-green-400" /> : <Info size={18} className="text-blue-400" />}
                            {activeNotification.message}
                        </div>
                    </div>
                )}

                {/* 하단 고정 입력 영역 */}
                <div className={`fixed bottom-0 z-30 transition-all duration-300 ${isSidebarOpen
                    ? 'left-72 right-0'
                    : 'left-0 right-0'
                    }`}>
                    {/* 스크롤 다운 버튼 - 입력창 바로 위 */}
                    {showScrollDownButton && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={() => scrollToBottom()}
                                className="flex items-center justify-center w-9 h-9 bg-white text-blue-600 rounded-full shadow-xl border border-gray-200 hover:bg-blue-50 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                            >
                                <ChevronDown size={22} strokeWidth={3} />
                            </button>
                        </div>
                    )}
                    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
                        <div className="bg-[#f0f4f9] rounded-[32px] p-4 border border-transparent focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-xl transition-all duration-300">
                            <div className="flex flex-col gap-2">

                                {/* 첨부된 항목들 표시 라인 - 재구성 */}
                                {attachedItems.length > 0 && (
                                    <div className="flex items-end gap-2 overflow-x-auto pb-1 custom-scrollbar px-1 pt-1">
                                        {attachedItems.map((item) => {
                                            const isImage = item.kind === 'image';
                                            const isVideo = item.kind === 'video';
                                            const isAudio = item.kind === 'audio';
                                            const isText = item.kind === 'text';
                                            const isDoc = ['document', 'model', 'code', 'archive'].includes(item.kind);
                                            const ext = item.name.split('.').pop()?.toUpperCase() || 'FILE';

                                            // 이미지: 정사각형 썸네일
                                            if (isImage && item.thumbUrl) {
                                                return (
                                                    <div key={item.id} className="relative flex-shrink-0 group cursor-pointer" onClick={() => openPreviewForItem(item)}>
                                                        <img
                                                            src={item.thumbUrl}
                                                            alt={item.name}
                                                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm group-hover:brightness-90 transition-all"
                                                        />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeAttachment(item.id); }}
                                                            type="button"
                                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500"
                                                        >
                                                            <X size={10} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            // 파일/텍스트/오디오/비디오: pill 형태 캡슐 카드
                                            const iconBg = isAudio ? 'bg-blue-50 text-blue-500' : isText ? 'bg-gray-100 text-gray-500' : isDoc ? 'bg-orange-50 text-orange-500' : isVideo ? 'bg-purple-50 text-purple-500' : 'bg-gray-100 text-gray-500';
                                            const fileIcon = isAudio ? <Music size={14} /> : isText ? <FileTextIcon size={14} /> : isVideo ? <Play size={14} /> : <FileTextIcon size={14} />;
                                            const fileLabel = isText ? '복사된 텍스트' : isAudio ? 'AUDIO' : isVideo ? 'VIDEO' : ext;

                                            return (
                                                <div
                                                    key={item.id}
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
                                                        onClick={(e) => { e.stopPropagation(); removeAttachment(item.id); }}
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
                                    className="w-full bg-transparent border-none outline-none px-4 py-2 resize-none placeholder-gray-400 min-h-[50px] custom-scrollbar text-[15px]"
                                    onPaste={handlePasteToAttachment}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                />

                                <div className="flex items-center justify-between px-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        {/* + 버튼: 파일 첨부 */}
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

                                                    {/* 1. 파일 업로드 */}
                                                    <MenuButton
                                                        icon={Paperclip}
                                                        label="파일 업로드"
                                                        onClick={() => { handleAttachmentClick(); setIsPlusMenuOpen(false); }}
                                                    />

                                                    {/* 2. Google Drive */}
                                                    <MenuButton
                                                        icon={GoogleDriveIcon}
                                                        label="Google Drive에서 가져오기"
                                                        onClick={() => setIsPlusMenuOpen(false)}
                                                    />

                                                    <div className="h-px bg-gray-100 my-1 mx-2" />

                                                    {/* 3. 커넥터 연결 - 인라인 확장 */}
                                                    <div>
                                                        <MenuButton
                                                            icon={Link2}
                                                            label="커넥터 연결"
                                                            onClick={() => setIsConnectorMenuOpen(!isConnectorMenuOpen)}
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
                                                        <span className="ml-2 text-sm font-medium">도구</span>
                                                    )}
                                                </button>

                                                {isToolMenuOpen && (
                                                    <div className="absolute left-0 bottom-full mb-3 py-2 px-1.5 bg-white border border-gray-200 rounded-2xl z-50 min-w-[190px] shadow-xl animate-in fade-in zoom-in-95 duration-200 font-[family-name:var(--font-nanum-gothic)]">
                                                        <MenuButton icon={Wrench} label="Hanbat Tools" active={selectedTool === 'hanbat'} onClick={() => handleToolClick('hanbat')} />
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

                                            {/* 활성화된 도구 배지 */}
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTool === 'hanbat' && <ActiveBadge label="Hanbat Tools" icon={Wrench} onClick={() => handleToolClick('hanbat')} />}
                                                {selectedTool === 'deepdive' && <ActiveBadge label="심층 조사" icon={FlaskConical} onClick={() => handleToolClick('deepdive')} />}
                                                {selectedTool === 'search' && <ActiveBadge label="웹 검색" icon={Globe} onClick={() => handleToolClick('search')} />}
                                                {selectedTool === 'doc' && <ActiveBadge label="문서 작성" icon={FileTextIcon} onClick={() => handleToolClick('doc')} />}
                                                {selectedTool === 'code' && <ActiveBadge label="코드 작성" icon={Terminal} onClick={() => handleToolClick('code')} />}
                                                {selectedTool === 'learn' && <ActiveBadge label="학습하기" icon={BookOpen} onClick={() => handleToolClick('learn')} />}
                                                {selectedTool === 'image' && <ActiveBadge label="이미지 생성" icon={Sparkles} onClick={() => handleToolClick('image')} />}
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
                                                            onClick={(e) => handleModelChange(model, e)}
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
                    <div className="text-[11px] text-gray-400 text-center pb-4 px-4 font-medium opacity-80">
                        한밭메이트는 틀린 정보를 생성할 수 있습니다. 중요한 정보는 직접 확인해 주세요.
                    </div>
                </div>
            </div>

            {/* 첨부 미리보기 오버레이 */}
            {
                preview && (
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
                )
            }

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

        /* 아이패드/터치기기 호버 대응 */
        @media (hover: none) {
          .message-edit-btn {
            opacity: 1 !important;
          }
        }

        @keyframes ai-logo-pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .ai-loading-logo {
            animation: ai-logo-pulse 2s infinite;
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
        }

        .ai-loading-logo::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                45deg,
                transparent,
                rgba(255, 255, 255, 0.4),
                transparent
            );
            transform: rotate(45deg);
            animation: shine-logo 1.5s infinite;
        }

        @keyframes shine-logo {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>
            {/* 법적 문제 신고 모달 */}
            {isLegalModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300 p-0 sm:p-4" onClick={() => setIsLegalModalOpen(false)}>
                    <div
                        className="bg-white/95 w-full max-w-md rounded-t-[32px] sm:rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500 border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-10 pt-10 pb-6 text-center sm:text-left">
                            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-[22px] flex items-center justify-center mb-6 mx-auto sm:mx-0 shadow-sm border border-red-100">
                                <Flag size={28} />
                            </div>
                            <h3 className="text-[26px] font-black text-gray-900 font-[family-name:var(--font-black-han-sans)] tracking-tight">법적 문제 신고</h3>
                            <p className="text-[14px] text-gray-500 mt-4 font-[family-name:var(--font-nanum-gothic)] leading-relaxed antialiased">
                                AI 대답 중 발견된 법적 문제나 부적절한 내용을 신고해 주세요. 신속히 검토 후 조치하겠습니다.
                            </p>
                        </div>

                        <div className="px-10 py-4 space-y-2.5">
                            {[
                                { id: 'fact', label: '사실 확인 실패 (허위 정보)' },
                                { id: 'copyright', label: '저작권 침해 의심' },
                                { id: 'inappropriate', label: '부적절하거나 유해한 콘텐츠' },
                                { id: 'privacy', label: '개인정보 유출 위험' },
                                { id: 'other', label: '기타 사유' }
                            ].map((issue) => (
                                <button
                                    key={issue.id}
                                    onClick={() => setSelectedLegalIssue(issue.id)}
                                    className={`w-full flex items-center justify-between p-4.5 rounded-[22px] border transition-all duration-200 ${selectedLegalIssue === issue.id
                                        ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-[0_4px_12px_rgba(59,130,246,0.1)]'
                                        : 'border-gray-100 bg-gray-50/50 text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-sm'}`}
                                >
                                    <span className="text-[14px] font-bold tracking-tight">{issue.label}</span>
                                    {selectedLegalIssue === issue.id && <Check size={18} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                                </button>
                            ))}
                        </div>

                        <div className="px-10 pb-10 pt-6 flex flex-col gap-3">
                            <button
                                disabled={!selectedLegalIssue}
                                onClick={() => {
                                    showNotification("신고가 정상적으로 접수되었습니다.");
                                    setIsLegalModalOpen(false);
                                    setSelectedLegalIssue(null);
                                }}
                                className={`w-full py-4.5 text-[15px] font-bold rounded-[22px] transition-all shadow-lg ${selectedLegalIssue
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-[0.98]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                신고 제출하기
                            </button>
                            <button
                                onClick={() => {
                                    setIsLegalModalOpen(false);
                                    setSelectedLegalIssue(null);
                                }}
                                className="w-full py-4.5 text-[15px] font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-[22px] transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
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
