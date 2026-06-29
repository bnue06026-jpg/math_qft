import { useState } from "react";
import { Question } from "../types";
import { Award, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface PrioritizeQuestionsScreenProps {
  questions: Question[];
  friendsQuestions: Array<{ text: string; type: "OPEN" | "CLOSE"; reason?: string }>;
  onTogglePriority: (id: string) => void;
  onAddFriendQuestion: (text: string, type: "OPEN" | "CLOSE") => void;
  onNext: (priorityTexts: string[]) => void;
  onBack: () => void;
}

export default function PrioritizeQuestionsScreen({
  questions,
  friendsQuestions,
  onTogglePriority,
  onAddFriendQuestion,
  onNext,
  onBack,
}: PrioritizeQuestionsScreenProps) {
  const [justifications, setJustifications] = useState<{ [id: string]: string }>({});

  const selectedQuestions = questions.filter((q) => q.isPrioritized);
  const selectedCount = selectedQuestions.length;

  const handleJustificationChange = (id: string, text: string) => {
    setJustifications((prev) => ({ ...prev, [id]: text }));
  };

  const handleNextClick = () => {
    if (selectedCount !== 3) {
      alert("가장 중요하다고 생각하는 질문을 정확히 3개 골라 주세요!");
      return;
    }
    
    // Pass the list of prioritized texts to the next page
    const priorityTexts = selectedQuestions.map((q) => {
      const reason = justifications[q.id]?.trim() ? ` (이유: ${justifications[q.id]})` : "";
      return `${q.text}${reason}`;
    });

    onNext(priorityTexts);
  };

  const criteriaList = [
    "이번 단원의 중요한 수학 공부 주제와 깊은 연관이 있는 질문인가요?",
    "우리가 직접 탐구하고 행동(조사, 관찰, 실험)해서 답을 찾아낼 수 있는 질문인가요?",
    "수학 공부의 즐거움을 더해주고, 친구들과 활발하게 의견을 나눌 수 있는 질문인가요?",
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 text-slate-800">
      {/* Title & Step header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">4단계: 우선순위 정하기</span>
        <h1 id="prioritize-title" className="text-2xl font-black text-slate-900 mt-1">우리 모둠 최고의 질문 3가지를 골라요 🏆</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
          지금까지 만든 많은 질문 중에서, 아래의 '우선순위 기준'을 참고하여 가장 중요한 질문 딱 <strong className="text-indigo-600">3가지</strong>를 선택해 주세요.
        </p>
      </div>

      {/* Prioritizing Criteria Card */}
      <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold text-amber-850 flex items-center gap-1.5 uppercase tracking-wide">
          <Award className="w-5 h-5 text-amber-500 animate-pulse" />
          질문 선정 기준 3가지
        </h3>
        <ul className="text-[11px] text-amber-950 mt-3 space-y-2 list-decimal list-inside font-semibold leading-relaxed">
          {criteriaList.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      {/* Selector Indicator bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          선택 현황: <span className="text-indigo-600 font-black text-lg">{selectedCount}</span> / 3개 고름
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < selectedCount ? "bg-indigo-600 scale-110 shadow-sm" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Questions list with checking mechanism */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => {
              if (!q.isPrioritized && selectedCount >= 3) {
                alert("질문은 3개만 고를 수 있어요! 이미 고른 질문을 해제하고 다시 선택해 주세요.");
                return;
              }
              onTogglePriority(q.id);
            }}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
              q.isPrioritized
                ? "border-indigo-500 bg-indigo-50/10 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
            }`}
          >
            {/* Checkbox circle indicator */}
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                q.isPrioritized
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {q.isPrioritized && <span className="text-xs font-black">✓</span>}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">질문 {idx + 1}</span>
                {q.type && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      q.type === "OPEN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {q.type === "OPEN" ? "열린 질문" : "닫힌 질문"}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">
                {q.text}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Friends' Questions (Mock pool for peer selection) */}
      {friendsQuestions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-black text-slate-850 text-sm md:text-base uppercase tracking-wide flex items-center gap-1.5 mb-4">
            👥 다른 모둠 친구들의 질문 중에서 골라볼까요?
          </h3>
          <div className="space-y-3">
            {friendsQuestions.map((fq, idx) => {
              // check if already added to my list
              const isAlreadyAdded = questions.some(q => q.text === fq.text);
              if (isAlreadyAdded) return null;
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (selectedCount >= 3) {
                      alert("질문은 3개만 고를 수 있어요! 이미 고른 질문을 해제하고 다시 선택해 주세요.");
                      return;
                    }
                    onAddFriendQuestion(fq.text, fq.type);
                  }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30 transition-all flex items-start gap-4"
                >
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white flex items-center justify-center shrink-0 mt-0.5 transition-all">
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">친구의 질문</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          fq.type === "OPEN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {fq.type === "OPEN" ? "열린 질문" : "닫힌 질문"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">
                      {fq.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Justification section (Show only for selected 3 questions) */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4"
        >
          <h3 className="font-black text-slate-850 text-xs md:text-sm uppercase tracking-wide">
            ✏️ 이 질문들을 선택한 소중한 이유를 적어 보아요
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            질문을 선택한 이유를 짧게 적어두면, 다음 단계에서 더 자세하고 흥미진진한 AI 탐구 미션을 받을 수 있어요!
          </p>

          <div className="space-y-4 pt-2">
            {selectedQuestions.map((q, i) => (
              <div key={q.id} className="space-y-2 border-l-4 border-indigo-500 pl-3">
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  우선순위 {i + 1}: "{q.text}"
                </p>
                <input
                  type="text"
                  value={justifications[q.id] || ""}
                  onChange={(e) => handleJustificationChange(q.id, e.target.value)}
                  placeholder="예: 우리 실생활에서 가장 자주 쓰이는 진짜 궁금한 문제이기 때문이에요."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold text-slate-800"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation footer */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-50 rounded-xl transition-all"
        >
          이전 단계로
        </button>
        <button
          onClick={handleNextClick}
          disabled={selectedCount !== 3}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-3 rounded-2xl text-xs shadow-md hover:shadow-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:pointer-events-none transition-all flex items-center gap-1.5"
        >
          선택한 질문 탐구 계획 세우기 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
