import { useState } from "react";
import { Question } from "../types";
import { HelpCircle, ChevronRight, RefreshCw, Star, Check, Sparkles, MessageCircle, AlertCircle, ArrowLeft, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImproveQuestionsScreenProps {
  qFocusTitle: string;
  questions: Question[];
  onSetQuestionType: (id: string, type: "OPEN" | "CLOSE") => void;
  onSetQuestionFeedback: (id: string, feedback: any) => void;
  onUpdateQuestionText: (id: string, text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ImproveQuestionsScreen({
  qFocusTitle,
  questions,
  onSetQuestionType,
  onSetQuestionFeedback,
  onUpdateQuestionText,
  onNext,
  onBack,
}: ImproveQuestionsScreenProps) {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [selectedQuestionForConvert, setSelectedQuestionForConvert] = useState<Question | null>(null);
  const [customConvertText, setCustomConvertText] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedHelp, setSuggestedHelp] = useState<{question: string, explanation: string} | null>(null);

  // Quick single-question analysis using server-side Gemini API
  const handleAnalyzeSingle = async (q: Question) => {
    if (analyzingId) return;
    setAnalyzingId(q.id);
    try {
      const res = await fetch("/api/analyze-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qFocus: qFocusTitle, question: q.text }),
      });
      const data = await res.json();
      if (res.ok) {
        onSetQuestionFeedback(q.id, data);
        onSetQuestionType(q.id, data.type);
      } else {
        alert("분석 중 오류가 발생했습니다: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("서버와 통신하는 중 오류가 발생했습니다.");
    } finally {
      setAnalyzingId(null);
    }
  };

  // Bulk analyze all questions using /api/analyze-multiple-questions
  const handleBulkAnalyze = async () => {
    if (questions.length === 0 || isBulkAnalyzing) return;
    setIsBulkAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-multiple-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qFocus: qFocusTitle, questions }),
      });
      const data = await res.json();
      if (res.ok && data.results) {
        data.results.forEach((item: any) => {
          // Find matching question
          const q = questions[item.id - 1];
          if (q) {
            onSetQuestionType(q.id, item.type);
            // Append a partial feedback placeholder
            onSetQuestionFeedback(q.id, {
              question: q.text,
              type: item.type,
              explanation: item.explanation,
              mathScore: 4,
              mathFeedback: "AI 선생님이 대규모 검토로 확인한 멋진 수학 질문이에요! 개별 카드에서 자세한 피드백을 받아볼 수 있어요.",
              convertedQuestion: item.type === "OPEN" ? "이 질문을 닫힌 질문으로 예쁘게 바꿔볼까요?" : "이 질문을 풍부한 열린 질문으로 넓혀볼까요?",
              convertedExplanation: "바꾸기 버튼을 눌러 개별 변환 연습을 진행해 보세요."
            });
          }
        });
      } else {
        alert("일괄 분류 오류: " + (data.error || "결과가 없습니다."));
      }
    } catch (err) {
      console.error(err);
      alert("서버 분석에 오류가 발생했습니다.");
    } finally {
      setIsBulkAnalyzing(false);
    }
  };

  const handleOpenConvertModal = (q: Question) => {
    setSelectedQuestionForConvert(q);
    setSuggestedHelp(null);
    // If we have AI feedback with a suggestion, prefill it!
    setCustomConvertText(q.aiFeedback?.convertedQuestion || "");
  };

  const handleSuggestHelp = async () => {
    if (!selectedQuestionForConvert || isSuggesting) return;
    setIsSuggesting(true);
    setSuggestedHelp(null);
    try {
      const targetType = selectedQuestionForConvert.type === "OPEN" ? "CLOSE" : "OPEN";
      const res = await fetch("/api/suggest-improvement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: selectedQuestionForConvert.text, targetType }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestedHelp({
          question: data.suggestedQuestion,
          explanation: data.explanation
        });
      } else {
        alert("추천 중 오류가 발생했습니다: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("서버와 통신하는 중 오류가 발생했습니다.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplyConversion = () => {
    if (!selectedQuestionForConvert || !customConvertText.trim()) return;
    onUpdateQuestionText(selectedQuestionForConvert.id, customConvertText.trim());
    
    // Swap type of question
    const oldType = selectedQuestionForConvert.type;
    const newType = oldType === "OPEN" ? "CLOSE" : "OPEN";
    onSetQuestionType(selectedQuestionForConvert.id, newType);
    
    // Clear or update feedback
    onSetQuestionFeedback(selectedQuestionForConvert.id, {
      ...selectedQuestionForConvert.aiFeedback,
      question: customConvertText.trim(),
      type: newType,
      explanation: `원래 ${oldType === "OPEN" ? "열린" : "닫힌"} 질문을 성공적으로 ${newType === "OPEN" ? "열린" : "닫힌"} 질문으로 멋지게 바꿨어요! 🎉`,
      convertedQuestion: selectedQuestionForConvert.text,
      convertedExplanation: "이전 질문으로 다시 돌아가거나 다듬을 수 있습니다."
    });

    setSelectedQuestionForConvert(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 space-y-6 text-slate-800">
      {/* Title & Guidance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">3단계: 질문 개선하기 (열린 질문 & 닫힌 질문)</span>
          <h1 id="improve-title" className="text-2xl font-black text-slate-900 mt-1">질문을 분류하고 성격을 바꾸어 봐요 🔄</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
            수학 질문에는 답이 정해진 <strong className="text-emerald-600">닫힌 질문(CLOSE)</strong>과 다양한 정답이 있는 <strong className="text-purple-600">열린 질문(OPEN)</strong>이 있어요. 질문의 모양을 서로 바꿔보는 연습을 해요!
          </p>
        </div>

        {/* AI Auto-Categorize Button */}
        <button
          onClick={handleBulkAnalyze}
          disabled={isBulkAnalyzing || questions.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:pointer-events-none shrink-0"
        >
          {isBulkAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              질문들을 읽는 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 animate-bounce" />
              🤖 AI 선생님께 내 질문 전체 자동분류 받기
            </>
          )}
        </button>
      </div>

      {/* Concept Guide Board (Open vs Closed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Closed Question description */}
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
            닫
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-emerald-800">닫힌 질문 (Closed-ended)</h4>
            <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
              정답이 <strong>'예/아니오'</strong>이거나 <strong>'단 하나의 숫자'</strong> 등으로 정해져 있어 금방 사실을 확인하는 질문이에요.
              <br />
              <span className="opacity-80">예: "피자는 전부 몇 조각인가요?", "예각은 90도보다 작나요?"</span>
            </p>
          </div>
        </div>

        {/* Open Question description */}
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
            열
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-purple-800">열린 질문 (Open-ended)</h4>
            <p className="text-xs text-purple-900 mt-1 leading-relaxed">
              생각을 넓혀주어 <strong>'어떻게', '왜', '만약 ~라면'</strong> 같은 다양한 대답과 수십 가지 탐구 방법이 나오는 질문이에요.
              <br />
              <span className="opacity-80">예: "왜 다리는 사각형이 아닌 삼각형으로 만들까요?", "어떤 방법으로 공평하게 나눌까요?"</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Questions Grid with detailed cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const hasFeedback = !!q.aiFeedback;
          
          return (
            <div
              key={q.id}
              className={`bg-white border rounded-2xl shadow-xs transition-all overflow-hidden ${
                q.type === "OPEN" 
                  ? "border-purple-200 hover:border-purple-300" 
                  : q.type === "CLOSE"
                  ? "border-emerald-200 hover:border-emerald-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Question Header & Action Row */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-850 text-xs md:text-sm leading-relaxed">{q.text}</h3>
                    {hasFeedback && (
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed flex items-center gap-1 font-semibold">
                        <MessageCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {q.aiFeedback.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Switcher & AI feedback triggers */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {/* Manual / AI Classifier switch */}
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                    <button
                      onClick={() => onSetQuestionType(q.id, "CLOSE")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                        q.type === "CLOSE"
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      닫힌 질문 (C)
                    </button>
                    <button
                      onClick={() => onSetQuestionType(q.id, "OPEN")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                        q.type === "OPEN"
                          ? "bg-purple-500 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      열린 질문 (O)
                    </button>
                  </div>

                  {/* Single AI inspection button */}
                  <button
                    onClick={() => handleAnalyzeSingle(q)}
                    disabled={analyzingId === q.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      hasFeedback
                        ? "border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100/50"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    title="AI 선생님의 개별 피드백 받기"
                  >
                    {analyzingId === q.id ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>

                  {/* Convert button */}
                  <button
                    onClick={() => handleOpenConvertModal(q)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-2 rounded-xl text-xs transition-all"
                    title="열린 질문 <-> 닫힌 질문 변환 연습하기"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    성격 바꾸기
                  </button>
                </div>
              </div>

              {/* Collapsible AI 선생님의 따뜻한 풍선 피드백 */}
              {hasFeedback && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      AI
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600">👩‍🏫 AI 선생님의 수학 관찰 기록</span>
                        
                        {/* Star Rating for Mathematical inquiry quality */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (q.aiFeedback.mathScore || 4) ? "fill-current" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-700 leading-relaxed mt-2 whitespace-pre-line">
                        {q.aiFeedback.mathFeedback}
                      </p>

                      {/* Convert suggestion inside block */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50 p-2.5 rounded-xl">
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase block">질문 변환 추천 예시</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">❓ {q.aiFeedback.convertedQuestion}</p>
                          <span className="text-[10px] text-slate-400 block leading-normal mt-0.5">({q.aiFeedback.convertedExplanation})</span>
                        </div>
                        <button
                          onClick={() => {
                            onUpdateQuestionText(q.id, q.aiFeedback.convertedQuestion);
                            onSetQuestionType(q.id, q.type === "OPEN" ? "CLOSE" : "OPEN");
                            // swap feedback type
                            onSetQuestionFeedback(q.id, {
                              ...q.aiFeedback,
                              question: q.aiFeedback.convertedQuestion,
                              type: q.type === "OPEN" ? "CLOSE" : "OPEN",
                              explanation: "질문의 모양이 변환되어 개선되었습니다!"
                            });
                          }}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-extrabold px-3 py-2 rounded-lg text-[11px] shrink-0 transition-all"
                        >
                          이 질문으로 바꾸기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Convert Interactive Popup / Sidebar Overlay */}
      <AnimatePresence>
        {selectedQuestionForConvert && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                    질문 성격 바꾸기 트레이닝 🔄
                  </h3>
                  <button
                    onClick={() => setSelectedQuestionForConvert(null)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  >
                    닫기
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current question status */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-extrabold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                      원래 내 질문 (현재: {selectedQuestionForConvert.type === "OPEN" ? "열린 질문 🔓" : "닫힌 질문 🔒"})
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-2">
                      {selectedQuestionForConvert.text}
                    </p>
                  </div>

                  {/* Transformation Arrow */}
                  <div className="flex justify-center text-indigo-500">
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </div>

                  {/* Conversion Input Form */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-slate-700">
                        ✏️ 새롭게 바꿀 {selectedQuestionForConvert.type === "OPEN" ? "닫힌 질문" : "열린 질문"}을 적어주세요
                      </label>
                      <button
                        onClick={handleSuggestHelp}
                        disabled={isSuggesting}
                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg hover:bg-indigo-100 flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isSuggesting ? (
                          <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        도움 받기
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customConvertText}
                      onChange={(e) => setCustomConvertText(e.target.value)}
                      placeholder={
                        selectedQuestionForConvert.type === "OPEN"
                          ? "정답이 딱 정해지거나 숫자로 대답하는 형식으로 바꿔보세요..."
                          : "어떻게 혹은 왜 등을 활용해 생각을 풍부하게 만드는 질문으로 바꿔보세요..."
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                    />
                  </div>

                  {/* Suggested Help Display */}
                  {suggestedHelp && (
                    <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 space-y-1.5 text-xs text-emerald-900 mt-2">
                      <span className="font-bold flex items-center gap-1">
                        💡 AI 선생님의 변환 추천 예시
                      </span>
                      <p className="font-extrabold text-emerald-800 mt-1">
                        "{suggestedHelp.question}"
                      </p>
                      <p className="text-[11px] text-emerald-700/80 leading-snug">
                        {suggestedHelp.explanation}
                      </p>
                      <button
                        onClick={() => setCustomConvertText(suggestedHelp.question)}
                        className="text-[11px] font-bold underline text-emerald-700 hover:text-emerald-900 block mt-2"
                      >
                        이 추천 내용 그대로 사용하기
                      </button>
                    </div>
                  )}

                  {/* Suggested quick AI conversion option helper */}
                  {selectedQuestionForConvert.aiFeedback?.convertedQuestion && (
                    <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 space-y-1.5 text-xs text-indigo-900">
                      <span className="font-bold flex items-center gap-1">
                        💡 AI 선생님의 추천 변환 힌트
                      </span>
                      <p className="font-extrabold text-indigo-700 mt-1">
                        "{selectedQuestionForConvert.aiFeedback.convertedQuestion}"
                      </p>
                      <button
                        onClick={() => setCustomConvertText(selectedQuestionForConvert.aiFeedback!.convertedQuestion)}
                        className="text-[11px] font-bold underline text-indigo-600 hover:text-indigo-800 block mt-1"
                      >
                        이 추천 내용 그대로 사용하기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedQuestionForConvert(null)}
                  className="flex-1 py-3 text-sm font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                >
                  취소하기
                </button>
                <button
                  onClick={handleApplyConversion}
                  disabled={!customConvertText.trim()}
                  className="flex-1 py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  질문 변환 완료!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-50 rounded-xl transition-all"
        >
          이전 단계로
        </button>
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-3 rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          우선순위 중요 질문 고르기 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
