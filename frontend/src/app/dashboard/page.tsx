"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  FolderOpen,
  Layers,
  HelpCircle,
  TrendingUp,
  FileText,
  UploadCloud,
  Send,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LogOut,
  ChevronRight,
  School,
  FileCheck2,
  GraduationCap,
  Award,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/LanguageContext";
import {
  fetchMaterials,
  uploadMaterial,
  deleteMaterial,
  sendStudyChatQuery,
  fetchFlashcards,
  generateFlashcards,
  fetchExitExamQuestions,
  generateQuiz,
  MaterialItem,
  FlashcardItem,
  QuizItem,
} from "../../lib/api";

type ActiveTab = "overview" | "tutor" | "materials" | "quizzes" | "flashcards" | "exit_exam";

export default function DashboardPage() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Materials State
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected Document for Focused Study
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  // AI Tutor Chat state
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "assistant"; text: string; citation?: string; pages?: number[] }>
  >([
    {
      sender: "assistant",
      text:
        locale === "am"
          ? "ሰላም! እኔ የAI የትምህርት ረዳትዎ ነኝ። ስለ ኮርሶችዎ፣ ስለ ሌክቸር ማስታወሻዎችዎ ወይም ስለ ማንኛውም የትምህርት ርዕስ ይጠይቁኝ።"
          : locale === "om"
          ? "Akkam! Ani gargaaraa barumsaa AI keessani. Waa'ee koorsii, noottii ykn mata-duree kamiyyuu na gaafachuu dandeessu."
          : "Hello! I am your AI StudyMate tutor. Ask me any question from your lecture slides or course notes.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
    {
      id: "1",
      front: "What is Database Normalization?",
      back: "The process of organizing data in a database to reduce redundancy and improve data integrity (1NF, 2NF, 3NF, BCNF).",
      source: "Database Systems: Slide 12",
      topic: "Database",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      front: "What is Time Complexity of Binary Search?",
      back: "O(log n) because the search space is divided by half in each iteration.",
      source: "DSA Lecture 4: Page 8",
      topic: "Algorithms",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      front: "Define Polymorphism in OOP",
      back: "The ability of different classes to respond to the same message or method call in their own specific ways.",
      source: "Software Engineering: Page 45",
      topic: "OOP",
      created_at: new Date().toISOString(),
    },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Course Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>([
    {
      id: "0",
      category: "Course Material",
      question: "Which normal form removes partial dependency (functional dependency on part of a composite key)?",
      options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd (BCNF)"],
      correct_index: 1,
      explanation: "2NF requires the table to be in 1NF and that all non-key attributes are fully functionally dependent on the primary key.",
      source_citation: "Database Systems: Slide 14",
    },
    {
      id: "1",
      category: "Course Material",
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
      correct_index: 2,
      explanation: "When the selected pivot is the smallest or largest element repeatedly, QuickSort degrades to O(n²).",
      source_citation: "DSA Lecture 4: Page 22",
    },
  ]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Exit Exam State
  const [exitDept, setExitDept] = useState("all");
  const [exitQuestions, setExitQuestions] = useState<QuizItem[]>([]);
  const [exitSelectedAnswers, setExitSelectedAnswers] = useState<Record<string, number>>({});
  const [exitScore, setExitScore] = useState<number | null>(null);
  const [isLoadingExitExam, setIsLoadingExitExam] = useState(false);

  // Load Initial Data from Backend
  useEffect(() => {
    loadMaterials();
    loadExitExamQuestions("all");
    loadSavedFlashcards();
  }, []);

  const loadMaterials = async () => {
    setIsLoadingMaterials(true);
    const data = await fetchMaterials();
    if (data && data.length > 0) {
      setMaterials(data);
    }
    setIsLoadingMaterials(false);
  };

  const loadSavedFlashcards = async () => {
    const cards = await fetchFlashcards();
    if (cards && cards.length > 0) {
      setFlashcards(cards);
    }
  };

  const loadExitExamQuestions = async (dept: string) => {
    setIsLoadingExitExam(true);
    setExitScore(null);
    setExitSelectedAnswers({});
    const questions = await fetchExitExamQuestions(dept);
    setExitQuestions(questions);
    setIsLoadingExitExam(false);
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newDoc = await uploadMaterial(file);
      setMaterials((prev) => [newDoc, ...prev]);
      setSelectedDocId(newDoc.id);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete handler
  const handleDeleteMaterial = async (id: string) => {
    const ok = await deleteMaterial(id);
    if (ok) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      if (selectedDocId === id) setSelectedDocId("");
    }
  };

  // Generate Flashcards handler
  const handleGenerateFlashcards = async (docId: string) => {
    setIsGeneratingFlashcards(true);
    try {
      const generated = await generateFlashcards(docId, locale);
      if (generated && generated.length > 0) {
        setFlashcards(generated);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setActiveTab("flashcards");
      }
    } catch (err: any) {
      alert("Error generating flashcards: " + err.message);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Generate Quiz handler
  const handleGenerateQuiz = async (docId: string) => {
    setIsGeneratingQuiz(true);
    try {
      const generated = await generateQuiz(docId, locale);
      if (generated && generated.length > 0) {
        setQuizQuestions(generated);
        setSelectedAnswers({});
        setQuizScore(null);
        setActiveTab("quizzes");
      }
    } catch (err: any) {
      alert("Error generating quiz: " + err.message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Chat Send handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const query = inputQuery.trim();
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const res = await sendStudyChatQuery(query, selectedDocId || undefined, locale);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.answer,
          citation: res.citation,
          pages: res.source_pages,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I couldn't reach the AI tutor service at the moment. Please ensure the backend is running at http://localhost:8000.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Course Quiz selection
  const handleAnswerSelect = (qId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_index) {
        score += 1;
      }
    });
    setQuizScore(score);
  };

  // Exit Exam selection
  const handleExitAnswerSelect = (qId: string, optionIndex: number) => {
    setExitSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmitExitExam = () => {
    let score = 0;
    exitQuestions.forEach((q) => {
      if (exitSelectedAnswers[q.id] === q.correct_index) {
        score += 1;
      }
    });
    setExitScore(score);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
        className="hidden"
      />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              SM
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                AI StudyMate
              </h2>
              <span className="text-[10px] text-primary-600 font-semibold tracking-wider uppercase">
                Student Portal 🇪🇹
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t("dashboard.overview")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tutor")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "tutor"
                ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <Brain className="h-4 w-4 text-purple-500" />
            <span>{t("dashboard.aiTutor")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "materials"
                ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <FolderOpen className="h-4 w-4 text-blue-500" />
            <span>{t("dashboard.myMaterials")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "quizzes"
                ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <HelpCircle className="h-4 w-4 text-emerald-500" />
            <span>Course Quizzes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "flashcards"
                ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <Layers className="h-4 w-4 text-amber-500" />
            <span>{t("dashboard.flashcards")}</span>
          </button>

          {/* Dedicated National Exit Exam Prep Mode */}
          <button
            type="button"
            onClick={() => setActiveTab("exit_exam")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "exit_exam"
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <GraduationCap className="h-4 w-4 text-amber-600" />
            <div className="flex items-center gap-1.5">
              <span>Exit Exam Prep</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500 text-white font-bold">MoE</span>
            </div>
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : "S"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {user?.full_name || "Abebe Student"}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.profile?.university || "Addis Ababa University"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Log out"
              className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm">
                  <School className="h-3.5 w-3.5" />
                  {user?.profile?.university || "Addis Ababa University"} • {user?.profile?.department || "Computer Science"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {t("dashboard.welcome")}, {user?.full_name || "Student"}! 🎓
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Your personalized multilingual AI study workspace is ready. Upload lecture slides, ask grounded questions, review flashcards, or take the Ethiopian National Exit Exam prep.
                </p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {t("dashboard.quickActions")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("materials");
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-primary-400 hover:shadow-md transition-all text-left flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("dashboard.uploadAction")}
                    </h3>
                    <p className="text-xs text-gray-500">Upload PDF, DOCX, PPTX</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tutor")}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-purple-400 hover:shadow-md transition-all text-left flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("dashboard.tutorAction")}
                    </h3>
                    <p className="text-xs text-gray-500">Ask questions in EN, AM, OM</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("exit_exam")}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-amber-400 hover:shadow-md transition-all text-left flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Exit Exam Prep
                    </h3>
                    <p className="text-xs text-gray-500">National MoE Exam Blueprints</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("flashcards")}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-emerald-400 hover:shadow-md transition-all text-left flex items-start gap-3 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("dashboard.flashcardAction")}
                    </h3>
                    <p className="text-xs text-gray-500">Spaced Repetition Review</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Course Materials */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-600" />
                  <span>{t("dashboard.recentMaterials")}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("materials")}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  View All Materials ({materials.length})
                </button>
              </div>

              <div className="space-y-3">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100/80 text-blue-700">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {mat.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {mat.page_count} Pages • {mat.file_type.toUpperCase()} • Status: {mat.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocId(mat.id);
                          setActiveTab("tutor");
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                      >
                        Study with AI
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateFlashcards(mat.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        Make Cards
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI TUTOR */}
        {activeTab === "tutor" && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-[700px] shadow-sm overflow-hidden">
            {/* Tutor Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/60 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    {t("dashboard.tutorHeading")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Grounded in uploaded documents • Trilingual Output (EN / AM / OM)
                  </p>
                </div>
              </div>

              {/* Document Filter for Tutor */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Document:</span>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Uploaded Materials</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Online
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl text-sm ${
                      m.sender === "user"
                        ? "bg-primary-600 text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                    {m.citation && (
                      <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-3.5 w-3.5 text-primary-500" />
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          Source Citation:
                        </span>
                        <span>{m.citation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-500" />
                  <span>AI StudyMate is searching course notes and preparing grounded response...</span>
                </div>
              )}
            </div>

            {/* Quick prompt suggestions */}
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setInputQuery("Explain Database Normalization in Amharic")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              >
                Explain Normalization in Amharic
              </button>
              <button
                type="button"
                onClick={() => setInputQuery("What is Time Complexity of Binary Search?")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              >
                Binary Search Big-O
              </button>
              <button
                type="button"
                onClick={() => setInputQuery("What are the key exam concepts in this document?")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              >
                Key Exam Takeaways
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={t("dashboard.inputPlaceholder")}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={isTyping || !inputQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>{t("dashboard.send")}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MY MATERIALS */}
        {activeTab === "materials" && (
          <div className="space-y-6">
            {/* Upload Box */}
            <div className="p-8 rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-950/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900 text-primary-600 flex items-center justify-center mx-auto">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Upload Course Notes & Slides
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Supports PDF, DOCX, PPTX, and TXT (up to 25MB). Notes are automatically segmented and indexed with page citations.
              </p>
              {uploadError && (
                <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg max-w-md mx-auto">
                  {uploadError}
                </div>
              )}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all"
              >
                {isUploading ? "Uploading & Parsing Pages..." : "Select File to Upload"}
              </button>
            </div>

            {/* List of materials */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Uploaded Course Documents ({materials.length})
                </h3>
                <button
                  type="button"
                  onClick={loadMaterials}
                  className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>

              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</h4>
                      <p className="text-xs text-gray-400">
                        {m.page_count} Pages • {m.file_type.toUpperCase()} • Status:{" "}
                        <span className="font-semibold text-emerald-600">{m.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocId(m.id);
                        setActiveTab("tutor");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 text-xs font-semibold hover:bg-primary-100"
                    >
                      AI Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateFlashcards(m.id)}
                      disabled={isGeneratingFlashcards}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100"
                    >
                      Make Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateQuiz(m.id)}
                      disabled={isGeneratingQuiz}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100"
                    >
                      Make Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(m.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COURSE QUIZZES */}
        {activeTab === "quizzes" && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Practice Examination: Course Material
                </h3>
                <p className="text-xs text-gray-500">
                  {quizQuestions.length} Practice Questions • Grounded in Course Documents
                </p>
              </div>
              {quizScore !== null && (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm">
                  Score: {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                </div>
              )}
            </div>

            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {qIdx + 1}. {q.question}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleAnswerSelect(q.id, optIdx)}
                          className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-50 text-primary-800 font-bold dark:bg-primary-950 dark:text-primary-300"
                              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizScore !== null && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                      <div>
                        <strong>Correct Answer:</strong> {q.options[q.correct_index]}
                      </div>
                      <div>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                      {q.source_citation && (
                        <div className="text-gray-500 dark:text-gray-400">
                          Source: {q.source_citation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              Submit Quiz Answers
            </button>
          </div>
        )}

        {/* TAB 5: FLASHCARDS */}
        {activeTab === "flashcards" && (
          <div className="max-w-xl mx-auto space-y-6 py-6 text-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Spaced Repetition Flashcards ({currentCardIndex + 1} of {flashcards.length})
              </h3>
              <p className="text-xs text-gray-500">
                Active Deck: {flashcards[currentCardIndex]?.topic || "Core Definitions"}
              </p>
            </div>

            {/* 3D Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[220px] rounded-3xl border-2 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-900 p-8 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all select-none"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary-600 mb-3">
                {isFlipped ? "Answer / Explanation (Click to flip)" : "Concept / Question (Click to flip)"}
              </span>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
                {isFlipped ? flashcards[currentCardIndex]?.back : flashcards[currentCardIndex]?.front}
              </p>
              {flashcards[currentCardIndex]?.source && (
                <span className="text-xs text-gray-400 mt-4">
                  Source: {flashcards[currentCardIndex]?.source}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold"
              >
                Previous Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
                }}
                className="px-5 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: NATIONAL EXIT EXAM PREP HUB */}
        {activeTab === "exit_exam" && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-gray-900 p-6 space-y-6 shadow-sm">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                  <Award className="h-3.5 w-3.5" />
                  <span>Ministry of Education (MoE) University Exit Exam</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  National University Exit Exam Simulation
                </h3>
                <p className="text-xs text-gray-500">
                  Standardized practice questions aligned with the official national competency blueprints.
                </p>
              </div>

              {exitScore !== null && (
                <div className="px-5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                  Exit Exam Score: {exitScore} / {exitQuestions.length} ({Math.round((exitScore / exitQuestions.length) * 100)}%)
                </div>
              )}
            </div>

            {/* Tech Course Sub-Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "🌟 Full Tech Exam (Comprehensive)" },
                { id: "dsa", label: "⚡ Data Structures & Algorithms" },
                { id: "database_systems", label: "🗄️ Database Systems (DBMS)" },
                { id: "software_engineering", label: "🏗️ Software Engineering" },
                { id: "computer_networks", label: "🌐 Computer Networks" },
                { id: "operating_systems", label: "🖥️ Operating Systems" },
                { id: "cybersecurity", label: "🛡️ Cybersecurity & Web Security" },
              ].map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    setExitDept(dept.id);
                    loadExitExamQuestions(dept.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    exitDept === dept.id
                      ? "bg-amber-500 text-white shadow-sm font-bold scale-[1.02]"
                      : "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {dept.label}
                </button>
              ))}
            </div>

            {/* Questions List */}
            {isLoadingExitExam ? (
              <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                <span>Loading National Exit Exam blueprint questions...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {exitQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
                      <span>Question {idx + 1} of {exitQuestions.length}</span>
                      <span>{q.source_citation || "MoE Competency Blueprint"}</span>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-relaxed">
                      {q.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = exitSelectedAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleExitAnswerSelect(q.id, optIdx)}
                            className={`p-3.5 text-left rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-50 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            <span className="font-bold mr-2 text-gray-400">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {exitScore !== null && (
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <div>
                          <strong>Correct Option:</strong> {String.fromCharCode(65 + q.correct_index)}. {q.options[q.correct_index]}
                        </div>
                        <div>
                          <strong>Official Competency Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleSubmitExitExam}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  Grade Exit Exam Simulation
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
