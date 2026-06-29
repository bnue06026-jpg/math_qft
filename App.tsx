import { useState } from "react";
import { Chapter, QFTStep, QFTWorkbook, Question } from "./types";
import WelcomeScreen from "./components/WelcomeScreen";
import QFocusScreen from "./components/QFocusScreen";
import ProduceQuestionsScreen from "./components/ProduceQuestionsScreen";
import ImproveQuestionsScreen from "./components/ImproveQuestionsScreen";
import PrioritizeQuestionsScreen from "./components/PrioritizeQuestionsScreen";
import NextStepsScreen from "./components/NextStepsScreen";
import ReflectionScreen from "./components/ReflectionScreen";
import { Sparkles, Compass, Lightbulb, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [step, setStep] = useState<QFTStep>("WELCOME");
  const [isLoading, setIsLoading] = useState(false);
  const [workbook, setWorkbook] = useState<QFTWorkbook>({
    qFocusTitle: "",
    qFocusDescription: "",
    qFocusImageUrl: "",
    mathematicalContext: "",
    questions: [],
    priorityQuestions: [],
    reflection: {
      whatLearned: "",
      howFelt: "",
      whyQuestionsMatter: "",
      thoughtsOnQuestions: "",
    },
  });

  // Action: Handle starting the session from Welcome screen
  const handleStartSession = async (chapter?: Chapter, customTopic?: string) => {
    if (chapter) {
      // 1. Preset Chapter mode: Instant load, no latency!
      setWorkbook({
        chapter,
        customTopic: undefined,
        qFocusTitle: chapter.presetQFocus.title,
        qFocusDescription: chapter.presetQFocus.description,
        qFocusImageUrl: chapter.presetQFocus.imageUrl,
        mathematicalContext: chapter.presetQFocus.context,
        questions: [],
        priorityQuestions: [],
        reflection: {
          whatLearned: "",
          howFelt: "",
          whyQuestionsMatter: "",
          thoughtsOnQuestions: "",
        },
      });
      setStep("Q_FOCUS");
    } else if (customTopic) {
      // 2. Custom AI Generation mode: fetch from Express server secure API
      setIsLoading(true);
      try {
        const res = await fetch("/api/generate-qfocus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customTopic }),
        });
        const data = await res.json();
        if (res.ok) {
          setWorkbook({
            chapter: undefined,
            customTopic,
            qFocusTitle: data.qFocusTitle,
            qFocusDescription: data.qFocusDescription,
            mathematicalContext: data.mathematicalContext,
            questions: [],
            priorityQuestions: [],
            // Pre-seed some mock preset examples returned by Gemini for help drawer
            chapterPlaceholderExamples: data.exampleQuestions,
            reflection: {
              whatLearned: "",
              howFelt: "",
              whyQuestionsMatter: "",
              thoughtsOnQuestions: "",
            },
          });
          setStep("Q_FOCUS");
        } else {
          alert("질문 초점을 생성하는 데 실패했습니다: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("AI 교실 서버와 연결하는 과정에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Question manipulation handlers
  const handleAddQuestion = (text: string) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      text,
    };
    setWorkbook((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    setWorkbook((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleEditQuestion = (id: string, text: string) => {
    setWorkbook((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, text } : q)),
    }));
  };

  const handleSetQuestionType = (id: string, type: "OPEN" | "CLOSE") => {
    setWorkbook((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, type } : q)),
    }));
  };

  const handleSetQuestionFeedback = (id: string, feedback: any) => {
    setWorkbook((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, aiFeedback: feedback } : q)),
    }));
  };

  const handleTogglePriority = (id: string) => {
    setWorkbook((prev) => {
      // Find currently prioritized count
      const prioritizedCount = prev.questions.filter((q) => q.isPrioritized).length;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id === id) {
            // toggle
            const nextVal = !q.isPrioritized;
            if (nextVal && prioritizedCount >= 3) {
              return q; // cancel toggle if exceeded
            }
            return { ...q, isPrioritized: nextVal };
          }
          return q;
        }),
      };
    });
  };

  const handleUpdateReflection = (reflection: any) => {
    setWorkbook((prev) => ({ ...prev, reflection }));
  };

  const handleReset = () => {
    if (confirm("처음 선택 화면으로 돌아가시겠습니까? 지금까지 쓴 질문들은 지워집니다.")) {
      setStep("WELCOME");
      setWorkbook({
        qFocusTitle: "",
        qFocusDescription: "",
        mathematicalContext: "",
        questions: [],
        priorityQuestions: [],
        reflection: {
          whatLearned: "",
          howFelt: "",
          whyQuestionsMatter: "",
          thoughtsOnQuestions: "",
        },
      });
    }
  };

  // Helper arrays for Step progression tracker
  const stepsList: Array<{ key: QFTStep; label: string; icon: string }> = [
    { key: "WELCOME", label: "시작", icon: "🏫" },
    { key: "Q_FOCUS", label: "질문 초점", icon: "📌" },
    { key: "PRODUCE", label: "질문 만들기", icon: "💭" },
    { key: "IMPROVE", label: "질문 개선", icon: "🔄" },
    { key: "PRIORITIZE", label: "우선순위", icon: "🏆" },
    { key: "INVESTIGATE", label: "탐구 계획", icon: "🗺️" },
    { key: "REFLECTION", label: "학습 성찰", icon: "🎓" },
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans select-none print:bg-white print:pb-0 text-slate-800">
      {/* Top Universal Navbar (Hidden during printing) */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-sm print:hidden shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200 select-none">
            Q
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 leading-none">수학 QFT 질문형성기법 실습</h1>
            <p className="text-xs text-slate-500 mt-1">초등 4학년 수학 질문 발전소 👩‍🏫</p>
          </div>
        </div>

        {/* Global Progress Indicator & Step Meter */}
        {step !== "WELCOME" && (
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-full text-xs">
              {stepsList.map((s, idx) => {
                const isPast = idx < currentStepIndex;
                const isActive = s.key === step;
                return (
                  <div key={s.key} className="flex items-center">
                    <div
                      onClick={() => {
                        if (idx < currentStepIndex) {
                          setStep(s.key);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                          : isPast
                          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/50"
                          : "text-slate-400 pointer-events-none"
                      }`}
                    >
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </div>
                    {idx < stepsList.length - 1 && (
                      <span className="text-slate-300 font-bold px-0.5">·</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">현재 단계</span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold">
                  {currentStepIndex}단계: {stepsList[currentStepIndex]?.label}
                </span>
              </div>
              <div className="w-24 sm:w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(currentStepIndex / (stepsList.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {step !== "WELCOME" && (
            <button
              onClick={handleReset}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              🔄 다시 시작
            </button>
          )}
        </div>
      </header>

      {/* Main Wizard Screens Container */}
      <main className="transition-all duration-300">
        <AnimatePresence mode="wait">
          {step === "WELCOME" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <WelcomeScreen onStart={handleStartSession} isLoading={isLoading} />
            </motion.div>
          )}

          {step === "Q_FOCUS" && (
            <motion.div
              key="qfocus"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <QFocusScreen
                chapter={workbook.chapter}
                customTopic={workbook.customTopic}
                qFocusTitle={workbook.qFocusTitle}
                qFocusDescription={workbook.qFocusDescription}
                qFocusImageUrl={workbook.qFocusImageUrl}
                mathematicalContext={workbook.mathematicalContext}
                onNext={() => setStep("PRODUCE")}
                onBack={() => setStep("WELCOME")}
              />
            </motion.div>
          )}

          {step === "PRODUCE" && (
            <motion.div
              key="produce"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <ProduceQuestionsScreen
                qFocusTitle={workbook.qFocusTitle}
                qFocusDescription={workbook.qFocusDescription}
                qFocusImageUrl={workbook.qFocusImageUrl}
                questions={workbook.questions}
                onAddQuestion={handleAddQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onEditQuestion={handleEditQuestion}
                onNext={() => setStep("IMPROVE")}
                onBack={() => setStep("Q_FOCUS")}
                presetExamples={
                  workbook.chapter
                    ? workbook.chapter.presetQFocus.examples
                    : workbook.chapterPlaceholderExamples || []
                }
              />
            </motion.div>
          )}

          {step === "IMPROVE" && (
            <motion.div
              key="improve"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <ImproveQuestionsScreen
                qFocusTitle={workbook.qFocusTitle}
                questions={workbook.questions}
                onSetQuestionType={handleSetQuestionType}
                onSetQuestionFeedback={handleSetQuestionFeedback}
                onUpdateQuestionText={handleEditQuestion}
                onNext={() => setStep("PRIORITIZE")}
                onBack={() => setStep("PRODUCE")}
              />
            </motion.div>
          )}

          {step === "PRIORITIZE" && (
            <motion.div
              key="prioritize"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <PrioritizeQuestionsScreen
                questions={workbook.questions}
                friendsQuestions={
                  workbook.chapter
                    ? workbook.chapter.presetQFocus.examples
                    : workbook.chapterPlaceholderExamples || []
                }
                onTogglePriority={handleTogglePriority}
                onAddFriendQuestion={(text: string, type: "OPEN" | "CLOSE") => {
                  const newId = Math.random().toString(36).substring(2, 9);
                  setWorkbook((prev) => ({
                    ...prev,
                    questions: [...prev.questions, { id: newId, text, type, isPrioritized: true }]
                  }));
                }}
                onNext={(texts) => {
                  setWorkbook((prev) => ({ ...prev, priorityQuestions: texts }));
                  setStep("INVESTIGATE");
                }}
                onBack={() => setStep("IMPROVE")}
              />
            </motion.div>
          )}

          {step === "INVESTIGATE" && (
            <motion.div
              key="investigate"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <NextStepsScreen
                qFocusTitle={workbook.qFocusTitle}
                priorityQuestions={workbook.questions
                  .filter((q) => q.isPrioritized)
                  .map((q) => q.text)}
                investigationPlans={workbook.investigationPlans}
                onSetInvestigationPlans={(plans) =>
                  setWorkbook((prev) => ({ ...prev, investigationPlans: plans }))
                }
                onNext={() => setStep("REFLECTION")}
                onBack={() => setStep("PRIORITIZE")}
              />
            </motion.div>
          )}

          {step === "REFLECTION" && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <ReflectionScreen
                chapter={workbook.chapter}
                customTopic={workbook.customTopic}
                qFocusTitle={workbook.qFocusTitle}
                qFocusDescription={workbook.qFocusDescription}
                questions={workbook.questions}
                priorityQuestions={workbook.priorityQuestions}
                investigationPlans={workbook.investigationPlans}
                reflection={workbook.reflection}
                onUpdateReflection={handleUpdateReflection}
                onReset={() => {
                  setStep("WELCOME");
                  setWorkbook({
                    qFocusTitle: "",
                    qFocusDescription: "",
                    mathematicalContext: "",
                    questions: [],
                    priorityQuestions: [],
                    reflection: {
                      whatLearned: "",
                      howFelt: "",
                      whyQuestionsMatter: "",
                      thoughtsOnQuestions: "",
                    },
                  });
                }}
                onBack={() => setStep("INVESTIGATE")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
