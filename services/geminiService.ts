
import { GoogleGenAI, Type, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 移除 analyzeFleetPerformance 以確保系統穩定
// 保留 startSwitchboardChat 供管理員手動進行地圖查詢

export const startSwitchboardChat = (systemContext: any): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `你是千尋智能總機。負責協助管理員查詢高雄地理、店家資訊與訂單。Context: ${JSON.stringify(systemContext)}。`,
      tools: [{ googleMaps: {} }]
    },
  });
};
