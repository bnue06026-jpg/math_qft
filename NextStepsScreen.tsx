import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, BookOpen, CheckSquare, Lightbulb, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface NextStepsScreenProps {
  qFocusTitle: string;
  priorityQuestions: string[];
  investigationPlans: any; // from parent state
  onSetInvestigationPlans: (plans: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function NextStepsScreen({
  qFocusTitle,
  priorityQuestions,
  investigationPlans,
  onSetInvestigationPlans,
  onNext,
  onBack,
}: NextStepsScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch investigation plans if not already loaded
    if (!investigationPlans) {
      fetchPlans();
    }
  }, [investigationPlans]);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest-investigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qFocus: qFocusTitle,
          priorityQuestions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSetInvestigationPlans(data);
      } else {
        setError(data.error || "수학 탐구 계획을 가져오는 도중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버 연결 실패: 인터넷 연결이나 서버 상태를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="inline-block bg-indigo-100 text-indigo-600 p-6 rounded-full shadow-md"
        >
          <Compass className="w-16 h-16" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 animate-pulse">
            🗺️ 수학 탐험 계획서 설계 중...
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-semibold">
            AI 탐험 대장 선생님이 여러분이 뽑은 최고의 질문 3가지를 해결하기 위해 신나는 탐구 미션과 수학 비밀을 설계하고 있어요. 잠시만 기다려 주세요!
          </p>
        </div>

        {/* Fun mathematical loading facts for 4th graders */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-sm mx-auto text-xs text-slate-500 leading-relaxed font-medium">
          <strong>수학 상식 한 꼬집:</strong> 피자가 둥근 이유는 도우를 회전시킬 때 '원심력' 때문이며, 사각형 상자에 넣는 이유는 상자를 제작하고 보관하기에 가장 경제적인 입체도형이기 때문이랍니다!
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 bg-white border border-slate-200 shadow-xl rounded-3xl">
        <div className="text-red-500 font-extrabold text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800">죄송해요, 미션을 불러오지 못했어요</h2>
        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
        <button
          onClick={fetchPlans}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 mx-auto shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> 다시 로드하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-6 text-slate-800">
      {/* Step Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">5단계: 질문 해결을 위한 탐구 계획 세우기</span>
        <h1 id="nextsteps-title" className="text-2xl font-black text-slate-900 mt-1">🔭 우리가 고른 질문으로 수학 탐험을 시작해요!</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
          우리가 모은 최고의 핵심 질문들을 직접 해결해보기 위한 구체적인 방법과 꿀팁을 AI 선생님이 정리해 주었어요.
        </p>
      </div>

      {/* Exploration Introductory Speech block */}
      {investigationPlans && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-5 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg shadow-indigo-500/20">
            🗺️
          </div>
          <div className="text-center md:text-left space-y-1">
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">수학 탐험단 임명식</span>
            <h3 className="font-black text-base md:text-lg text-white">
              🎉 {investigationPlans.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              "{investigationPlans.introduction}"
            </p>
          </div>
        </div>
      )}

      {/* Investigation Plans Bento Grid */}
      {investigationPlans && investigationPlans.plans && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {investigationPlans.plans.map((plan: any, idx: number) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header Number badge */}
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-3 py-1 rounded-full">
                    미션 {idx + 1}
                  </span>
                  <Compass className="w-4.5 h-4.5 text-slate-300" />
                </div>

                {/* Question Text */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">우리가 던진 질문</span>
                  <p className="text-xs font-black text-slate-800 mt-1.5 leading-snug">
                    "{plan.question}"
                  </p>
                </div>

                {/* What to Find (Math concept) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" />
                    알아야 할 수학 개념
                  </span>
                  <p className="text-[11px] font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                    {plan.whatToFind}
                  </p>
                </div>

                {/* How to Solve (Actions) */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 uppercase tracking-wide">
                    <CheckSquare className="w-3.5 h-3.5" />
                    이렇게 해결해요 (액션 미션)
                  </span>
                  <p className="text-[11px] font-semibold text-emerald-900 leading-relaxed whitespace-pre-line">
                    {plan.howToSolve}
                  </p>
                </div>
              </div>

              {/* Fun Fact or Hint */}
              <div className="pt-3 border-t border-slate-150 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 uppercase tracking-wide">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  미션 해결을 돕는 수학 꿀팁
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                  "{plan.funFactOrHint}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Navigation Footer */}
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
          학습 보고서 & 성찰 작성하기 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
