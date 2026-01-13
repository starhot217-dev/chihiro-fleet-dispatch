
import { GoogleGenAI, Type, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 分析車隊表現並給出營運建議
 */
export const analyzeFleetPerformance = async (stats: any) => {
  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-flash-preview for basic text analysis tasks.
      model: 'gemini-3-flash-preview',
      contents: `
        你是一位專業的派車系統營運顧問。請根據以下高雄 HUB 的即時數據給出 3 點具體的營運優化建議：
        數據：${JSON.stringify(stats)}
        
        請以繁體中文回答，語氣專業且精簡。
      `,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "目前 AI 分析引擎繁忙，請稍後再試。建議檢查當前司機上線人數是否足以應付即時訂單。";
  }
};

/**
 * 啟動地圖總機對話
 */
export const startSwitchboardChat = (systemContext: any): Chat => {
  return ai.chats.create({
    // Maps grounding is only supported in Gemini 2.5 series models.
    model: 'gemini-2.5-flash-latest',
    config: {
      systemInstruction: `你是千尋智能總機。負責協助管理員查詢高雄地理、店家資訊與訂單。Context: ${JSON.stringify(systemContext)}。`,
      tools: [{ googleMaps: {} }]
    },
  });
};
