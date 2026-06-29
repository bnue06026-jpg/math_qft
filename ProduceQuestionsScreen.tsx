import { useState, useRef, FormEvent } from "react";
import { Question } from "../types";
import { Plus, Trash2, Edit3, ArrowLeft, ArrowRight, Lightbulb, AlertCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProduceQuestionsScreenProps {
  qFocusTitle: string;
  qFocusDescription: string;
  qFocusImageUrl?: string;
  questions: Question[];
  onAddQuestion: (text: string) => void;
  onDeleteQuestion: (id: string) => void;
  onEditQuestion: (id: string, text: string) => void;
  onNext: () => void;
  onBack: () => void;
  presetExamples: Array<{ text: string; type: "OPEN" | "CLOSE"; reason: string }>;
}

export default function ProduceQuestionsScreen({
  qFocusTitle,
  qFocusDescription,
  qFocusImageUrl,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onEditQuestion,
  onNext,
  onBack,
  presetExamples,
}: ProduceQuestionsScreenProps) {
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showInspiration, setShowInspiration] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddQuestion(inputText.trim());
    setInputText("");
    inputRef.current?.focus();
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onEditQuestion(id, editText.trim());
    setEditingId(null);
  };

  const handleUsePreset = (presetText: string) => {
    onAddQuestion(presetText);
    setShowInspiration(false);
  };

  // Warning if no questions have been added yet
  const hasNoQuestions = questions.length === 0;

  // Reminder rules for top bar
  const quickRules = [
    "질문 많이 쓰기",
    "판단 금지",
    "말한 그대로 적기",
    "진술문은 질문으로 바꾸기"
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-800">
      {/* LEFT COLUMN: Sticky Q-Focus reference and QFT Rules */}
      <div className="lg:col-span-4 space-y-4">
        {/* Q-Focus Context Panel */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">💡 관찰할 상황 (Q-Focus)</span>
          <h3 className="font-black text-sm text-white mt-1.5">{qFocusTitle}</h3>
          
          {qFocusImageUrl && (
            <div className="mt-3 mb-2 rounded-xl overflow-hidden border border-slate-700/50">
              <img 
                src={qFocusImageUrl} 
                alt="Q-Focus Reference" 
                className="w-full max-h-32 object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed max-h-48 overflow-y-auto pr-1">
            {qFocusDescription}
          </p>
        </div>

        {/* Quick QFT Rule Board */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
            <Lightbulb className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            질문할 때 4대 규칙!
          </h4>
          <ul className="text-[11px] text-amber-950 mt-2 space-y-1.5 font-semibold list-disc list-inside">
            <li>좋고 나쁜 질문 따지지 말고 많이 적기</li>
            <li>대답은 하지 않아요! 오직 질문만!</li>
            <li>마침표(.) 문장은 물음표(?) 질문으로!</li>
          </ul>
        </div>

        {/* Inspiration Tool */}
        <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
          <button
            onClick={() => setShowInspiration(!showInspiration)}
            className="w-full flex items-center justify-between text-xs font-bold text-indigo-700 hover:text-indigo-800 transition-all focus:outline-hidden"
          >
            <span className="flex items-center gap-1.5">💡 어떤 질문을 해야 할지 모르겠나요?</span>
            <span className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md text-[10px]">
              {showInspiration ? "닫기" : "보기"}
            </span>
          </button>

          {showInspiration && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 space-y-2 pt-2 border-t border-indigo-100 overflow-hidden"
            >
              <p className="text-[11px] text-indigo-850 font-semibold">
                아래 예시 질문을 클릭해서 참고하거나, 내 생각대로 조금 바꾸어서 내 질문함에 추가해 보세요!
              </p>
              <div className="space-y-2 mt-2">
                {presetExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUsePreset(ex.text)}
                    className="w-full text-left p-2.5 bg-white border border-indigo-150 rounded-xl text-xs text-slate-700 hover:bg-indigo-100/30 hover:border-indigo-400 transition-all leading-relaxed block"
                  >
                    ❓ {ex.text}
                    <span className="text-[10px] text-indigo-600 font-bold block mt-1">
                      ({ex.type === "OPEN" ? "열린 질문 예시" : "닫힌 질문 예시"})
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Question Input and List */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">2단계: 질문 만들기</span>
                <h2 className="text-base font-black text-slate-800 mt-0.5">내 머릿속 수학 호기심 질문함 💭</h2>
              </div>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                총 {questions.length}개 질문
              </span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="궁금한 수학 질문을 물음표(?)와 함께 입력해 보세요..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold placeholder:text-slate-400 text-slate-800"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all flex items-center gap-1 shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> 추가
              </button>
            </form>

            {/* Questions List */}
            <div className="mt-6 space-y-3 min-h-[250px] max-h-[400px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {hasNoQuestions ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl mb-3 font-bold">
                      ?
                    </div>
                    <p className="text-xs font-bold text-slate-600">아직 등록된 질문이 없어요!</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      상황 설명글을 찬찬히 읽고, 드는 사소한 질문이든 엉뚱한 질문이든 위의 입력창에 적어 주세요.
                    </p>
                  </motion.div>
                ) : (
                  questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 group hover:border-indigo-200 hover:bg-indigo-50/10 transition-all shadow-xs"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>

                        {editingId === q.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(q.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(q.id)}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shrink-0"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-300 shrink-0"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-line break-words">
                            {q.text}
                          </p>
                        )}
                      </div>

                      {editingId !== q.id && (
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={() => handleStartEdit(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="질문 수정하기"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="질문 삭제하기"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Navigation bar inside card */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-50 rounded-xl transition-all"
            >
              이전 단계로
            </button>
            <button
              onClick={onNext}
              disabled={hasNoQuestions}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl text-xs shadow-md hover:shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              질문 분류하고 개선하러 가기 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
