import { useState, useCallback, useRef, useEffect } from "react";

const HISTORY_KEY = "paper_trading_history";
const DATA_KEY = "paper_trading_data";
const MAX_HISTORY = 10;

export interface PaperTradingData {
  cash: number;
  positions: Record<string, { symbol: string; shares: number; avgPrice: number }>;
  trades: any[];
  savedAt: string;
}

function readData(): PaperTradingData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeData(data: PaperTradingData) {
  const json = JSON.stringify(data);
  localStorage.setItem(DATA_KEY, json);

  // Push to history for recovery
  try {
    const histRaw = localStorage.getItem(HISTORY_KEY);
    const hist: PaperTradingData[] = histRaw ? JSON.parse(histRaw) : [];
    hist.unshift(data);
    if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  } catch { /* ignore */ }
}

export function getStorageStats() {
  try {
    const dataSize = (localStorage.getItem(DATA_KEY) || "").length;
    const histSize = (localStorage.getItem(HISTORY_KEY) || "").length;
    const totalBytes = dataSize + histSize;
    const data = readData();
    return {
      tradeCount: data?.trades?.length ?? 0,
      totalKB: (totalBytes / 1024).toFixed(1),
      historyVersions: (() => { try { const h = localStorage.getItem(HISTORY_KEY); return h ? JSON.parse(h).length : 0; } catch { return 0; } })(),
    };
  } catch { return { tradeCount: 0, totalKB: "0", historyVersions: 0 }; }
}

export function getHistoryVersions(): PaperTradingData[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useLocalPersistence() {
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const flashSaved = useCallback(() => {
    setShowSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSaved(false), 2000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const save = useCallback((data: PaperTradingData) => {
    writeData({ ...data, savedAt: new Date().toISOString() });
    flashSaved();
  }, [flashSaved]);

  const load = useCallback((): PaperTradingData | null => readData(), []);

  const restoreVersion = useCallback((index: number): PaperTradingData | null => {
    const versions = getHistoryVersions();
    if (index >= 0 && index < versions.length) {
      const version = versions[index];
      writeData(version);
      flashSaved();
      return version;
    }
    return null;
  }, [flashSaved]);

  const exportData = useCallback(() => {
    const data = readData();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paper_trading_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file: File): Promise<PaperTradingData | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as PaperTradingData;
          if (data.cash !== undefined && data.trades) {
            writeData({ ...data, savedAt: new Date().toISOString() });
            flashSaved();
            resolve(data);
          } else resolve(null);
        } catch { resolve(null); }
      };
      reader.readAsText(file);
    });
  }, [flashSaved]);

  return { save, load, restoreVersion, exportData, importData, showSaved };
}
