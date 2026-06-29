import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI on the server side securely
// Set 'User-Agent' to 'aistudio-build' as required by telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API: Check server health
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Generate a Q-Focus based on 4th grade math chapters
app.post("/api/generate-qfocus", async (req: Request, res: Response) => {
  try {
    const { chapter, customTopic } = req.body;
    
    let prompt = "";
    if (customTopic) {
      prompt = `초등학교 4학년 수학 과정에 맞는 수학적 상황('질문 초점' 또는 'Q-Focus')을 생성해 주세요. 주제/상황은 다음과 같습니다: "${customTopic}". 4학년 학생들이 흥미를 가질 만한 실생활 수학적 상황이어야 합니다.`;
    } else {
      prompt = `초등학교 4학년 수학 단원인 "${chapter || "분수의 덧셈과 뺄셈"}"에 관련된 흥미로운 실생활 상황('질문 초점' 또는 'Q-Focus')을 하나 만들어 주세요. 초등학교 4학년 수학 교과과정(큰 수, 각도, 곱셈과 나눗셈, 평면도형의 이동, 막대그래프, 규칙 찾기, 분수, 소수, 사각형, 다각형 등)과 밀접하게 연관되어야 하며 학생들의 호기심과 다양한 질문을 유도할 수 있는 그림 상황 묘사나 짧은 줄글 상황이어야 합니다.`;
    }

    const systemInstruction = `당신은 초등학교 4학년 수학 교사입니다. 아이들에게 '질문형성기법(QFT)'을 지도하고 있습니다.
아이들이 수학적 호기심을 느끼고 다양한 질문을 만들어낼 수 있는 자극제인 '질문 초점(Q-Focus)'을 만들어 주세요.
반드시 제공된 JSON 스키마 구조에 완벽히 들어맞는 한국어 JSON 형태로 응답하십시오.
설명이나 제목은 친근하고 따뜻한 초등학교 선생님 어조(~해요, ~해보세요 등)로 작성하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["qFocusTitle", "qFocusDescription", "mathematicalContext", "exampleQuestions"],
          properties: {
            qFocusTitle: {
              type: Type.STRING,
              description: "질문 초점의 제목 (예: 피자 파티와 남은 조각, 각도기로 찾는 우리 주변의 비밀 등)",
            },
            qFocusDescription: {
              type: Type.STRING,
              description: "아이들에게 보여줄 상황 설명 줄글 (대화체나 흥미로운 스토리 형태, 3~4문장 내외)",
            },
            mathematicalContext: {
              type: Type.STRING,
              description: "이 상황과 관련된 초등 4학년 수학 개념에 대한 친절한 설명",
            },
            exampleQuestions: {
              type: Type.ARRAY,
              description: "이 Q-Focus에 대해 만들어볼 수 있는 예시 질문 2~3개",
              items: {
                type: Type.OBJECT,
                required: ["text", "type", "reason"],
                properties: {
                  text: { type: Type.STRING, description: "예시 질문 내용" },
                  type: { type: Type.STRING, description: "질문 유형 ('OPEN' 또는 'CLOSE')" },
                  reason: { type: Type.STRING, description: "왜 열린 질문 또는 닫힌 질문인지 친절한 이유 설명" },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating Q-Focus:", error);
    res.status(500).json({ error: error.message || "Q-Focus 생성 중 오류가 발생했습니다." });
  }
});

// API: Analyze student question
app.post("/api/analyze-question", async (req: Request, res: Response) => {
  try {
    const { qFocus, question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "질문을 입력해 주세요." });
    }

    const prompt = `질문 초점 상황: "${qFocus}"
학생이 만든 질문: "${question}"

이 질문이 '닫힌 질문(정답이 한두 개로 딱 정해지거나 예/아니오로 답할 수 있는 질문)'인지, '열린 질문(생각을 넓혀주고 다양한 설명이나 답이 가능한 질문)'인지 판별해 주세요. 
그리고 이 질문이 해당 상황에서 어떤 수학적 의미나 호기심을 담고 있는지 별점(1~5점)과 함께 친절한 초등 선생님의 피드백을 주세요.
마지막으로, 이 질문을 반대 유형(닫힌 질문이면 열린 질문으로, 열린 질문이면 닫힌 질문으로)으로 바꾼 멋진 수학 질문 예시와 그 바꾸는 팁을 알려주세요.`;

    const systemInstruction = `당신은 초등학교 4학년 수학 선생님입니다. 질문형성기법(QFT)을 연습하는 아이들을 격려하고 피드백을 줍니다.
어려운 학술적인 표현은 피하고, 11살 어린이가 읽었을 때 쉽게 이해하고 미소 지을 수 있는 따뜻하고 칭찬 가득한 말투(~해요, ~했네요!, 아주 멋져요!)를 사용하세요.
반드시 제공된 JSON 스키마 형태로 응답하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["question", "type", "explanation", "mathScore", "mathFeedback", "convertedQuestion", "convertedExplanation"],
          properties: {
            question: { type: Type.STRING, description: "원래 학생 질문" },
            type: { type: Type.STRING, description: "질문 유형 ('OPEN' 또는 'CLOSE')" },
            explanation: { type: Type.STRING, description: "왜 열린 질문/닫힌 질문인지 아이들 눈높이에 맞춰서 '예/아니오로 답할 수 있어요' 또는 '다양한 대답이 나와요' 같은 이유를 들어 설명" },
            mathScore: { type: Type.INTEGER, description: "수학적 탐구 가치 점수 (1부터 5까지의 정수)" },
            mathFeedback: { type: Type.STRING, description: "선생님의 칭찬과 수학적 탐구를 돕는 친절한 격려 피드백" },
            convertedQuestion: { type: Type.STRING, description: "반대 성격의 질문으로 바꾼 새 질문" },
            convertedExplanation: { type: Type.STRING, description: "어떤 부분을 바꾸어 열린/닫힌 질문으로 변환했는지 친절히 설명" },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing question:", error);
    res.status(500).json({ error: error.message || "질문 분석 중 오류가 발생했습니다." });
  }
});

// API: Bulk analyze questions (for a list of questions in QFT Step 2 & 3)
app.post("/api/analyze-multiple-questions", async (req: Request, res: Response) => {
  try {
    const { qFocus, questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "질문 배열이 올바르지 않습니다." });
    }

    const prompt = `질문 초점 상황: "${qFocus}"
학생들이 적어낸 질문 리스트:
${questions.map((q, idx) => `${idx + 1}. "${q.text}"`).join("\n")}

각 질문에 대해 '닫힌 질문(CLOSE)'인지 '열린 질문(OPEN)'인지 판별하고, 각각 한 문장으로 친절하고 쉬운 이유를 적어주세요.`;

    const systemInstruction = `당신은 초등학교 4학년 수학 교사입니다. 질문형성기법(QFT)의 분류 단계를 돕고 있습니다.
초등학교 4학년 수준에 맞추어 아주 쉽고 다정한 어조로 분류 결과와 아주 짤막한 이유를 JSON 형식으로 응답해 주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["results"],
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "explanation"],
                properties: {
                  id: { type: Type.INTEGER, description: "질문 리스트의 인덱스 (1부터 시작)" },
                  type: { type: Type.STRING, description: "질문 유형 ('OPEN' 또는 'CLOSE')" },
                  explanation: { type: Type.STRING, description: "한 문장으로 설명하는 왜 열린/닫힌 질문인지에 대한 이유" },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in bulk analyze:", error);
    res.status(500).json({ error: error.message || "일괄 질문 분석 중 오류가 발생했습니다." });
  }
});

// API: Suggest question improvement (Step 3 in QFT)
app.post("/api/suggest-improvement", async (req: Request, res: Response) => {
  try {
    const { question, targetType } = req.body;
    if (!question || !targetType) {
      return res.status(400).json({ error: "질문과 변경하려는 형태를 모두 입력해주세요." });
    }

    const typeName = targetType === "OPEN" ? "열린 질문(정답이 여러 개이거나 상상력을 자극하는 질문)" : "닫힌 질문(정답이 딱 하나로 정해져 있는 질문)";
    const prompt = `현재 질문: "${question}"\n이 질문을 '${typeName}'으로 자연스럽게 바꾸려면 어떻게 해야 할까요? 초등학교 4학년 수준에 맞게 1가지 예시를 만들어주세요.`;

    const systemInstruction = `당신은 친절한 초등학교 선생님입니다. 학생이 닫힌 질문을 열린 질문으로, 혹은 열린 질문을 닫힌 질문으로 바꾸는 것을 돕습니다. 아이들의 눈높이에 맞추어 부드럽고 다정하게 제안해 주세요. JSON 형식으로 응답하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["suggestedQuestion", "explanation"],
          properties: {
            suggestedQuestion: { type: Type.STRING, description: "바뀐 질문 예시" },
            explanation: { type: Type.STRING, description: "왜 이렇게 바꾸면 좋은지 짧은 설명" },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error suggesting improvement:", error);
    res.status(500).json({ error: error.message || "질문 개선 추천 중 오류가 발생했습니다." });
  }
});

// API: Next Step investigation suggestions (Step 5 in QFT)
app.post("/api/suggest-investigation", async (req: Request, res: Response) => {
  try {
    const { qFocus, priorityQuestions } = req.body;
    if (!priorityQuestions || !Array.isArray(priorityQuestions) || priorityQuestions.length === 0) {
      return res.status(400).json({ error: "우선순위 질문이 없습니다." });
    }

    const prompt = `질문 초점 상황: "${qFocus}"
우리가 고른 중요한 질문들:
${priorityQuestions.map((q, idx) => `${idx + 1}. "${q}"`).join("\n")}

이 질문들을 해결하기 위해서 우리가 수학 시간에 무엇을 조사하거나 배워야 할까요? 
각 질문마다 다음 세 가지 요소를 포함한 '탐구 계획서'를 작성해주세요:
1) 알아내야 할 것 (수학적 지식/개념)
2) 해결하기 위한 방법 (직접 세어보기, 계산하기, 각도기 쓰기, 그래프 그리기 등)
3) 예상되는 재미있는 수학 이야기나 힌트`;

    const systemInstruction = `당신은 질문을 들고 수학 탐험을 떠나는 탐험 대장 선생님입니다. 
아이들이 스스로 질문에 답할 수 있는 탐험 계획(다음 단계)을 쉽고 아주 신나게 작성해 줍니다. 
아이들의 눈높이(초4)에 맞춘 다정한 우리말 대화체로 JSON 스키마에 맞춰 답변해주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "introduction", "plans"],
          properties: {
            title: { type: Type.STRING, description: "탐험 계획의 전체 제목 (예: 피자 수학 원정대의 미션!)" },
            introduction: { type: Type.STRING, description: "아이들에게 도전을 북돋아 주는 신나는 격려 인사" },
            plans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "whatToFind", "howToSolve", "funFactOrHint"],
                properties: {
                  question: { type: Type.STRING, description: "질문 내용" },
                  whatToFind: { type: Type.STRING, description: "알아야 할 수학 개념/정보 (예: 분수의 덧셈과 분모의 의미)" },
                  howToSolve: { type: Type.STRING, description: "어떻게 해결하면 되는지 친절한 행동 미션 (예: 실제로 원 모양 종이를 잘라서 대조해 보기)" },
                  funFactOrHint: { type: Type.STRING, description: "이 질문과 연관된 신기한 수학적 힌트나 이야기" },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error suggesting investigation:", error);
    res.status(500).json({ error: error.message || "탐구 제안 생성 중 오류가 발생했습니다." });
  }
});

// Setup Vite Dev Middleware in Development, Static Files in Production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QFT Server] running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

setupServer();
