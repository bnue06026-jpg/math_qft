export interface Chapter {
  id: string;
  semester: 1 | 2;
  number: number;
  name: string;
  description: string;
  presetQFocus: {
    title: string;
    description: string;
    context: string;
    imageUrl?: string;
    examples: Array<{ text: string; type: "OPEN" | "CLOSE"; reason: string }>;
  };
}

export interface Question {
  id: string;
  text: string;
  type?: "OPEN" | "CLOSE"; // OPEN = 열린 질문, CLOSE = 닫힌 질문
  aiFeedback?: {
    type: "OPEN" | "CLOSE";
    explanation: string;
    mathScore: number;
    mathFeedback: string;
    convertedQuestion: string;
    convertedExplanation: string;
  };
  isPrioritized?: boolean;
  priorityOrder?: number;
}

export type QFTStep = 
  | "WELCOME"       // 시작 화면 (단원 선택)
  | "Q_FOCUS"       // 질문 초점 확인하기
  | "PRODUCE"       // 질문 만들기 (질문 생산)
  | "IMPROVE"       // 질문 개선하기 (열린/닫힌 분류 및 변환)
  | "PRIORITIZE"    // 우선순위 정하기 (가장 좋은 질문 3개 고르기)
  | "INVESTIGATE"   // 탐구 계획 세우기 (다음 단계)
  | "REFLECTION";   // 성찰 및 학습 보고서 출력

export interface QFTWorkbook {
  chapter?: Chapter;
  customTopic?: string;
  qFocusTitle: string;
  qFocusDescription: string;
  qFocusImageUrl?: string;
  mathematicalContext: string;
  questions: Question[];
  priorityQuestions: string[]; // top 3 texts
  investigationPlans?: {
    title: string;
    introduction: string;
    plans: Array<{
      question: string;
      whatToFind: string;
      howToSolve: string;
      funFactOrHint: string;
    }>;
  };
  reflection: {
    whatLearned: string;
    howFelt: string;
    whyQuestionsMatter: string;
    thoughtsOnQuestions?: string;
  };
}
