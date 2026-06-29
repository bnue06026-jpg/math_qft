import { Chapter } from "../types";
import { ArrowLeft, ArrowRight, Lightbulb, CheckSquare, Sparkles, BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface QFocusScreenProps {
  chapter?: Chapter;
  customTopic?: string;
  qFocusTitle: string;
  qFocusDescription: string;
  qFocusImageUrl?: string;
  mathematicalContext: string;
  onNext: () => void;
  onBack: () => void;
}

export default function QFocusScreen({
  chapter,
  customTopic,
  qFocusTitle,
  qFocusDescription,
  qFocusImageUrl,
  mathematicalContext,
  onNext,
  onBack,
}: QFocusScreenProps) {
  // QFT 4 Core Rules (질문 생산의 4대 규칙)
  const qftRules = [
    {
      num: "1",
      title: "질문을 아아아주 많이 만들어요!",
      desc: "좋은 질문인지, 나쁜 질문인지 고민하지 말고 떠오르는 생각들을 모조리 질문으로 적어 보세요.",
      color: "bg-pink-50 border-pink-100 text-pink-700",
      numColor: "bg-pink-500",
    },
    {
      num: "2",
      title: "질문을 중간에 고치거나 비판하지 않아요!",
      desc: "내 질문이든 친구 질문이든 비웃거나 도중에 맞고 틀림을 따지지 말고 있는 그대로 인정해 주세요.",
      color: "bg-indigo-50 border-indigo-100 text-indigo-700",
      numColor: "bg-indigo-500",
    },
    {
      num: "3",
      title: "친구들과 모둠 활동 시 말한 그대로 적어요!",
      desc: "내 생각대로 다듬지 말고, 질문을 말한 사람의 생생한 뉘앙스를 그대로 살려 기록해요.",
      color: "bg-purple-50 border-purple-100 text-purple-700",
      numColor: "bg-purple-500",
    },
    {
      num: "4",
      title: "진술문(평서문)은 반드시 질문으로 바꿔요!",
      desc: "마침표(.)로 끝나는 정보 설명 문장은 물음표(?)가 달린 호기심 가득한 질문으로 바꿔서 적어 주세요.",
      color: "bg-amber-50 border-amber-100 text-amber-700",
      numColor: "bg-amber-500",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-slate-800">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> 처음으로 돌아가기
        </button>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
          {chapter ? `4학년 ${chapter.semester}학기 > ${chapter.name}` : "나만의 수학 주제 탐험"}
        </span>
      </div>

      {/* Main Q-Focus Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        {/* Background decorative shine */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -z-10"></div>

        <div className="flex items-center gap-2 text-amber-400 mb-3 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> 1단계: 질문의 핵심 자극제 (질문 초점 - Q-Focus)
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
          📌 {qFocusTitle}
        </h2>

        {qFocusImageUrl && (
          <div className="mt-6 mb-2 rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg">
            <img 
              src={qFocusImageUrl} 
              alt="Q-Focus Reference" 
              className="w-full max-h-64 object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <p className="text-slate-200 mt-4 text-xs md:text-sm leading-relaxed whitespace-pre-line bg-slate-850/80 p-5 rounded-2xl border border-slate-800/80">
          {qFocusDescription}
        </p>

        {/* Mathematical Context accordion/badge */}
        <div className="mt-6 border-t border-slate-800 pt-5">
          <div className="flex items-start gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-300">이 상황과 연결된 4학년 수학 개념</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-semibold">
                {mathematicalContext}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QFT Rules Title */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          잠깐! 질문을 쓰기 전 <span className="text-indigo-600 underline decoration-indigo-250 underline-offset-4 font-black">QFT 4대 규칙</span>을 기억해 봐요
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          질문형성기법(QFT)은 많은 질문들 속에서 보물을 찾는 과정이에요. 아래 규칙들을 다 같이 소리 내어 읽고 시작해요!
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qftRules.map((rule) => (
          <motion.div
            key={rule.num}
            whileHover={{ y: -2 }}
            className={`p-5 rounded-2xl border ${rule.color} flex gap-4 items-start shadow-sm transition-all`}
          >
            <div className={`w-8 h-8 rounded-full ${rule.numColor} text-white font-black flex items-center justify-center shrink-0 shadow-sm`}>
              {rule.num}
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">{rule.title}</h4>
              <p className="text-[11px] opacity-95 mt-1.5 leading-relaxed font-semibold">{rule.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Navigation */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-12 py-4 rounded-2xl text-sm shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          규칙을 다 읽었어요! 질문 쓰러 가기 <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
