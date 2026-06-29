import { useState } from "react";
import { Chapter, QFTStep } from "../types";
import { CHAPTERS } from "../data";
import { HelpCircle, Star, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onStart: (chapter?: Chapter, customTopic?: string) => void;
  isLoading: boolean;
}

export default function WelcomeScreen({ onStart, isLoading }: WelcomeScreenProps) {
  const [semester, setSemester] = useState<1 | 2>(1);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const filteredChapters = CHAPTERS.filter((ch) => ch.semester === semester);
  const selectedChapter = CHAPTERS.find((ch) => ch.id === selectedChapterId);

  const handleStartClick = () => {
    if (isCustomMode) {
      if (!customTopic.trim()) {
        alert("궁금한 수학 주제를 적어 주세요!");
        return;
      }
      onStart(undefined, customTopic);
    } else {
      if (!selectedChapterId) {
        alert("공부할 수학 단원을 골라 주세요!");
        return;
      }
      onStart(selectedChapter, undefined);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Hero Welcome Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          초등학교 4학년 수학 놀이터
        </motion.div>
        
        <h1 id="welcome-title" className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mt-2">
          수학 <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">QFT 질문 발전소</span> 🚀
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
          질문형성기법(QFT)을 활용해 수학 개념을 스스로 탐구하는 멋진 생각 발전소에 오신 것을 환영해요!
          선생님, 친구들과 함께 질문을 직접 만들며 진짜 수학의 재미를 느껴 보아요.
        </p>
      </div>

      {/* QFT 6 Steps Overview (Bento style) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
        {[
          { step: "1단계", name: "질문 초점", desc: "상황 관찰하기", color: "bg-indigo-50/70 border-indigo-100 text-indigo-700" },
          { step: "2단계", name: "질문 만들기", desc: "자유롭게 질문하기", color: "bg-purple-50 border-purple-100 text-purple-700" },
          { step: "3단계", name: "질문 개선", desc: "열린/닫힌 질문 바꾸기", color: "bg-pink-50 border-pink-100 text-pink-700" },
          { step: "4단계", name: "우선순위", desc: "가장 좋은 질문 3개", color: "bg-amber-50 border-amber-100 text-amber-700" },
          { step: "5단계", name: "탐구 계획", desc: "스스로 해결책 구상", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          { step: "6단계", name: "학습 성찰", desc: "배운 점 기록", color: "bg-teal-50 border-teal-100 text-teal-700" },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${item.color} text-center flex flex-col justify-between shadow-sm`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">{item.step}</span>
              <h3 className="font-extrabold text-xs mt-1.5">{item.name}</h3>
            </div>
            <p className="text-[11px] opacity-80 mt-2 block font-medium leading-tight">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Topic Selection Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md">
        <div className="flex border-b border-slate-200 pb-4 mb-6 gap-4">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-3 text-center rounded-2xl font-bold transition-all text-sm ${
              !isCustomMode
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            🏫 교과서 단원 고르기
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 py-3 text-center rounded-2xl font-bold transition-all text-sm ${
              isCustomMode
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            ✨ 내 마음대로 주제 정하기
          </button>
        </div>

        {!isCustomMode ? (
          <div>
            {/* Semester Switcher */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => {
                    setSemester(sem as 1 | 2);
                    setSelectedChapterId("");
                  }}
                  className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${
                    semester === sem
                      ? "bg-slate-800 text-white shadow-sm"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  4학년 {sem}학기
                </button>
              ))}
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                    selectedChapterId === ch.id
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl font-bold text-xs shrink-0 ${
                    selectedChapterId === ch.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {ch.number}단원
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{ch.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{ch.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedChapter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-amber-50/50 border border-amber-150 rounded-2xl flex gap-3 items-start"
              >
                <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg font-bold text-[10px] mt-0.5 shrink-0">힌트</div>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                  <strong>{selectedChapter.name} 단원 선택완료!</strong> 이 단원에서는 {selectedChapter.presetQFocus.title}에 관한 재미있는 이야기를 읽고 수학적 탐구 질문을 해볼 거예요.
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">궁금한 수학 주제나 실생활 상황을 적어 주세요</label>
            <textarea
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="예: '친구들과 놀이동산에 가기로 했는데, 자유이용권 할인율 계산법이 궁금해요!' 혹은 '피자 3판을 5명이서 어떻게 하면 똑같이 나눌 수 있을까요?' 등"
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none font-medium text-slate-800"
            />
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
                <strong>AI 선생님의 맞춤 질문 초점(Q-Focus) 생성!</strong> 적어 주신 주제를 바탕으로 초등학교 4학년 수학 과정에 맞는 특별한 질문 초점 시나리오를 AI 선생님이 직접 만들어 드려요.
              </p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleStartClick}
            disabled={isLoading}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-2xl text-base shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                AI 선생님이 상황을 준비하고 있어요...
              </>
            ) : (
              <>
                질문 탐험 시작하기 <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
