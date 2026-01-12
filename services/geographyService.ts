
// 高雄主要行政區中心座標 (用於模擬精準里程)
const KHH_DISTRICTS: Record<string, { lat: number, lng: number }> = {
  "鳳山": { lat: 22.626, lng: 120.359 },
  "苓雅": { lat: 22.622, lng: 120.320 },
  "左營": { lat: 22.678, lng: 120.300 },
  "三民": { lat: 22.645, lng: 120.312 },
  "前鎮": { lat: 22.595, lng: 120.320 },
  "楠梓": { lat: 22.728, lng: 120.312 },
  "鼓山": { lat: 22.639, lng: 120.276 },
  "小港": { lat: 22.565, lng: 120.355 },
  "新興": { lat: 22.631, lng: 120.300 },
  "前金": { lat: 22.627, lng: 120.295 },
  "鹽埕": { lat: 22.623, lng: 120.283 },
  "鳥松": { lat: 22.659, lng: 120.364 },
  "大寮": { lat: 22.605, lng: 120.395 },
  "仁武": { lat: 22.699, lng: 120.348 },
  "橋頭": { lat: 22.757, lng: 120.305 },
  "岡山": { lat: 22.795, lng: 120.295 },
};

/**
 * 計算兩點座標間的距離 (KM)
 */
const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // 地球半徑 KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 真正大約計算里程引擎
 * @param fromAddr 起點地址字串
 * @param toAddr 終點地址字串
 */
export const estimateRealMileage = (fromAddr: string, toAddr: string): number => {
  let startPos = KHH_DISTRICTS["苓雅"]; // 預設中心點
  let endPos = KHH_DISTRICTS["左營"];

  // 掃描關鍵字匹配座標
  Object.keys(KHH_DISTRICTS).forEach(dist => {
    if (fromAddr.includes(dist)) startPos = KHH_DISTRICTS[dist];
    if (toAddr.includes(dist)) endPos = KHH_DISTRICTS[dist];
  });

  const straightLine = calculateHaversine(startPos.lat, startPos.lng, endPos.lat, endPos.lng);
  
  // 如果起終點在同一個區，給予基礎 2.5km 的市區繞行值
  if (straightLine === 0) return 2.5 + (Math.random() * 2);

  // 城市道路繞路係數 (通常為直線距離的 1.25 ~ 1.4 倍)
  const windingFactor = 1.35;
  return Number((straightLine * windingFactor).toFixed(1));
};
