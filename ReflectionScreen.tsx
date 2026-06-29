import { useState } from "react";
import { Chapter, Question } from "../types";
import { Award, Printer, ArrowLeft, RefreshCw, HelpCircle, Heart } from "lucide-react";
import { motion } from "motion/react";

interface ReflectionScreenProps {
  chapter?: Chapter;
  customTopic?: string;
  qFocusTitle: string;
  qFocusDescription: string;
  questions: Question[];
  priorityQuestions: string[];
  investigationPlans: any;
  reflection: {
    whatLearned: string;
    howFelt: string;
    whyQuestionsMatter: string;
  };
  onUpdateReflection: (reflection: any) => void;
  onReset: () => void;
  onBack: () => void;
}

export default function ReflectionScreen({
  chapter,
  customTopic,
  qFocusTitle,
  qFocusDescription,
  questions,
  priorityQuestions,
  investigationPlans,
  reflection,
  onUpdateReflection,
  onReset,
  onBack,
}: ReflectionScreenProps) {
  const [studentName, setStudentName] = useState("");
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  const handleTextChange = (field: string, text: string) => {
    onUpdateReflection({
      ...reflection,
      [field]: text,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-slate-800">
      {/* Reflection Step (Input phase) */}
      {!isReportGenerated ? (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">6단계: 배운 점 기록하기</span>
            <h1 id="reflection-title" className="text-2xl font-black text-slate-900 mt-1">🤔 내 생각 주머니 성찰하기</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              오늘 질문을 직접 설계하고 바꾸어 보면서 느꼈던 내 생각을 솔직하게 적어 보세요. 질문하는 법을 배우면 수학을 공부하는 진짜 주인이 될 수 있어요!
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            {/* Question 1 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center">1</span>
                질문을 마음껏 많이 만들어 보면서 새롭게 느끼거나 발견한 점은 무엇인가요?
              </label>
              <textarea
                value={reflection.whatLearned}
                onChange={(e) => handleTextChange("whatLearned", e.target.value)}
                placeholder="예: 예전에는 선생님이 내주신 수학 문제만 풀었는데, 내가 질문을 만들어보니까 일상 속 모든 것이 수학으로 연결되어 있어서 신기하고 더 적극적이 되었어요!"
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none font-medium text-slate-800"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center">2</span>
                내가 만든 질문 중에서 가장 마음에 들거나 스스로 칭찬해 주고 싶은 멋진 질문은 무엇인가요?
              </label>
              <textarea
                value={reflection.howFelt}
                onChange={(e) => handleTextChange("howFelt", e.target.value)}
                placeholder="예: '피자가 둥근데 왜 네모 박스에 담아 배달될까?'라는 열린 질문이 가장 마음에 들어요. 생활 속 당연한 것에서 수학 모양의 장점을 생각해보게 만들어서 기뻐요."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none font-medium text-slate-800"
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-pink-100 text-pink-700 font-extrabold text-[10px] flex items-center justify-center">3</span>
                수학 문제를 받아 들기 전에 내가 질문을 던져보는 게 수학 공부에 왜 큰 도움이 될까요?
              </label>
              <textarea
                value={reflection.whyQuestionsMatter}
                onChange={(e) => handleTextChange("whyQuestionsMatter", e.target.value)}
                placeholder="예: 미리 질문을 하면 내가 무엇을 궁금해하는지 알게 되고, 정해진 정답을 풀 때 덜 부담스러워요. 수학이 외우는 과목이 아니라 탐구하는 놀이처럼 느껴져요!"
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none font-medium text-slate-800"
              />
            </div>

            {/* Question 4 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 font-extrabold text-[10px] flex items-center justify-center">4</span>
                내가 만든 질문들에 대한 나의 생각이나 느낌을 자유롭게 적어 보세요.
              </label>
              <textarea
                value={reflection.thoughtsOnQuestions || ""}
                onChange={(e) => handleTextChange("thoughtsOnQuestions", e.target.value)}
                placeholder="예: 내가 이런 질문을 만들 수 있다는 게 신기했다. 앞으로는 질문을 더 많이 해봐야겠다."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none font-medium text-slate-800"
              />
            </div>

            {/* Student Name field for reports */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                ✏️ 보고서에 이름을 새길게요. 이름을 적어주세요
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="예: 홍길동 (입력하지 않으면 '우주 최고 수학 탐험가'로 나와요)"
                className="w-full max-w-md px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold text-slate-850"
              />
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={onBack}
              className="px-6 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-50 rounded-xl transition-all"
            >
              이전 단계로
            </button>
            <button
              onClick={() => setIsReportGenerated(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-3.5 rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Award className="w-5 h-5" /> 질문 수학 완료! 보고서 확인하기
            </button>
          </div>
        </div>
      ) : (
        /* Printable Report & Certificate phase */
        <div className="space-y-6">
          {/* Action floating header bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
            <div className="text-left">
              <h3 className="font-extrabold text-slate-900 text-xs">축하합니다! 수학 질문 탐험 완료 🎓</h3>
              <p className="text-[11px] text-slate-500 font-semibold">아래의 보고서를 인쇄하거나 PDF 파일로 내려받아 선생님과 친구들에게 제출하세요!</p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsReportGenerated(false)}
                className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                뒤로가기
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> 인쇄 및 PDF 저장
              </button>
              <button
                onClick={onReset}
                className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-4 h-4" /> 다시 시작
              </button>
            </div>
          </div>

          {/* PRINT-READY PORTFOLIO SHEET */}
          <div id="print-area" className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 shadow-md relative print:border-0 print:p-0 print:shadow-none font-sans text-slate-950">
            {/* Decorative Report Stamp */}
            <div className="absolute top-8 right-8 w-24 h-24 border-4 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-500/40 text-[10px] font-black rotate-12 select-none pointer-events-none uppercase text-center p-2 print:top-0 print:right-0">
              QFT 수학<br />마스터 인증
            </div>

            {/* Worksheet Main Title */}
            <div className="text-center pb-6 border-b-2 border-dashed border-slate-300">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                🏫 수학 QFT 질문형성기법 이수 보고서
              </h1>
              <div className="flex justify-center gap-6 mt-4 text-xs font-bold text-slate-500">
                <span>학습일자: {new Date().toLocaleDateString("ko-KR")}</span>
                <span>학년: 초등학교 4학년</span>
                <span>탐험가명: <span className="text-indigo-600 font-extrabold underline text-xs">{studentName.trim() || "우주 최고 수학 탐험가"}</span></span>
              </div>
            </div>

            {/* Q-Focus Section */}
            <div className="py-6 space-y-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                1. 질문 초점 상황 (Q-Focus)
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-xs text-slate-800">📌 {qFocusTitle}</h4>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed italic whitespace-pre-line font-medium">
                  "{qFocusDescription}"
                </p>
                {chapter && (
                  <p className="text-[9px] text-slate-400 font-extrabold mt-2.5 uppercase tracking-wide">
                    교과 연계 단원: 4학년 {chapter.semester}학기 {chapter.number}단원 「{chapter.name}」
                  </p>
                )}
              </div>
            </div>

            {/* Produced and categorized questions list */}
            <div className="py-6 space-y-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 bg-purple-600 rounded-full"></span>
                2. 생산한 수학 질문 리스트 (분류 결과)
              </h3>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-400 shrink-0">{i + 1}.</span>
                      <p className="font-bold text-slate-850">{q.text}</p>
                    </div>
                    {q.type && (
                      <span className={`px-2 py-0.5 rounded-sm font-black text-[8px] uppercase shrink-0 ${
                        q.type === "OPEN" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {q.type === "OPEN" ? "열린 질문 (O)" : "닫힌 질문 (C)"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chosen top 3 priority list */}
            <div className="py-6 space-y-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                3. 우리가 엄선한 최우선 수학 질문 (Top 3)
              </h3>
              <div className="space-y-2">
                {priorityQuestions.map((qText, i) => (
                  <div key={i} className="p-3 bg-amber-50/30 border border-amber-200 rounded-xl text-xs font-bold text-amber-950 leading-relaxed flex gap-3">
                    <span className="w-5 h-5 rounded bg-amber-500 text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-sm">
                      ★ {i + 1}
                    </span>
                    <p className="flex-1 font-extrabold">"{qText}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflection details */}
            <div className="py-6 space-y-4">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 bg-pink-500 rounded-full"></span>
                4. 나를 성장시킨 수학 성찰 일기
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 bg-slate-50/30 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black text-indigo-600 block uppercase tracking-wide">1. 질문을 통해 배운 것</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-semibold italic">
                    {reflection.whatLearned || "질문을 던지는 방법을 통해 수학이 주입식 암기가 아니라 내 궁금함을 적극적으로 찾아가는 멋진 도구라는 것을 깨달았어요."}
                  </p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50/30 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black text-purple-600 block uppercase tracking-wide">2. 소중한 최고 질문과 마음</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-semibold italic">
                    {reflection.howFelt || "내 최고의 질문에 정성 가득한 AI 선생님의 칭찬을 보니 정말 자부심이 느껴졌고 끝까지 탐구할 용기가 생겼어요."}
                  </p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50/30 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black text-pink-600 block uppercase tracking-wide">3. 수학 질문의 힘</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-semibold italic">
                    {reflection.whyQuestionsMatter || "질문을 먼저 하면 문제를 풀 때 주인의식이 생겨서, 답만 외우지 않고 생각하는 근육이 쑥쑥 발달하는 기분이에요."}
                  </p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50/30 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-wide">4. 내 질문들에 대한 생각</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-semibold italic">
                    {reflection.thoughtsOnQuestions || "처음엔 막막했지만 질문을 만들다 보니 나만의 멋진 질문들이 생겨서 뿌듯했어요."}
                  </p>
                </div>
              </div>
            </div>

            {/* School stamp / signature outline at bottom */}
            <div className="pt-10 mt-6 border-t-2 border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
              <div className="space-y-1 font-semibold">
                <p>위 학생은 초등 수학 QFT 질문 발전소의</p>
                <p>전 과정을 성실하고 창의적으로 이수하였음을 증명합니다.</p>
              </div>
              <div className="text-right font-bold text-slate-800 space-y-1 print:text-right">
                <p>수학 질문 발전소 대장 선생님 👩‍🏫</p>
                <p className="text-[10px] text-slate-400">(서명 또는 날인)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded print css overrides specifically for beautiful print rendering */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
