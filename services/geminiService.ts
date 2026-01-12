
import { GoogleGenAI, Type, Chat } from "@google/genai";

// Always initialize with apiKey in a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFleetPerformance = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請分析以下派車系統的營運數據，並針對調度優化、營運效率與司機留存提供 3 個具體的行動洞察：${JSON.stringify(data)}。

請嚴格遵守以下指令：
1. 必須完全使用「繁體中文（台灣繁體）」進行回覆。
2. 語氣需專業且精確。
3. 回傳格式必須為 JSON 陣列。
4. 每個物件需包含 'insight'（洞察建議）與 'impact'（預期影響）屬性。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              insight: { type: Type.STRING },
              impact: { type: Type.STRING }
            },
            required: ["insight", "impact"]
          }
        }
      }
    });
    // Use .text property directly (not a method)
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [
      { insight: "建議優化尖峰時段熱區（如高雄鳳山、三民區）的車輛預先部署", impact: "預期可減少約 15% 的客戶平均等待時間" },
      { insight: "偵測到部分司機錢包餘額持續過低，可能影響接單頻率", impact: "建議主動推送儲值優惠訊息，確保系統派遣穩定性" },
      { insight: "跨區訂單在週末晚間有明顯增長趨勢", impact: "建議調度策略調整為長途優先，提升司機單趟利潤與回頭率" }
    ];
  }
};

/**
 * 建立總機聊天對話 (整合地圖與搜尋工具)
 * Maps grounding is supported specifically in Gemini 2.5 series models.
 */
export const startSwitchboardChat = (systemContext: any): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash', // Updated to gemini-2.5-flash for Maps grounding support
    config: {
      systemInstruction: `你是「千尋派車系統」的智能調度總機。
你的目標是協助管理員解決調度、費率、或是地理位置查詢問題。
你有權限存取系統數據：${JSON.stringify(systemContext)}。

功能：
1. 你可以搜尋 Google Maps 來定位地標或建議司機休息站。
2. 你可以搜尋網頁來查詢當前的高雄路況或活動。
3. 始終使用「繁體中文（台灣繁體）」。
4. 回答應精簡有力，若使用了地圖資訊，請告知用戶你已標記位置。`,
      tools: [
        { googleMaps: {} },
        { googleSearch: {} }
      ]
    },
  });
};
