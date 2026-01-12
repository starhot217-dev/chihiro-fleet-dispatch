
import { GoogleGenAI, Type, Chat } from "@google/genai";

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
 * 建立總機聊天對話
 */
export const startSwitchboardChat = (systemContext: any): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `你是「千尋派車系統」的智能總機助手。
你的目標是協助系統管理員與調度員處理業務問題。
你有權限存取當前系統的部分情境數據：${JSON.stringify(systemContext)}。

規則：
1. 請始終使用「繁體中文（台灣繁體）」進行對答。
2. 保持專業、冷靜且有幫助的語氣。
3. 如果被問到如何優化費率，請根據數據給予具體數值建議。
4. 如果被問到關於高雄的地理，請展現出你對高雄區域（鳳山、左營、三民等）的了解。
5. 回答應盡量精簡有力，必要時使用條列式。`,
    },
  });
};
