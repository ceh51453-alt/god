import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ═══════════════════════════════════════════════════════
   ENRICH STORE — Cấu hình & trạng thái AI Auto-Enrich
   Cho phép AI tự động bổ sung fields cho Xưởng Sáng Thế
   sau mỗi response, dùng proxy riêng hoặc default.
   ═══════════════════════════════════════════════════════ */

export interface EnrichLogEntry {
  entityId: string;
  entityName: string;
  category: string;
  fieldsUpdated: string[];
  timestamp: number;
}

export type EnrichProxySource = 'default' | 'custom';
export type EnrichTrigger = 'after-response' | 'manual';

export interface EnrichSampling {
  temperature: number;
  top_p: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
}

const DEFAULT_SAMPLING: EnrichSampling = {
  temperature: 0.7,
  top_p: 0.95,
  max_tokens: 2000,
  frequency_penalty: 0,
  presence_penalty: 0,
};

interface EnrichState {
  /** Bật/tắt auto-enrich */
  enabled: boolean;
  /** Chế độ kích hoạt */
  trigger: EnrichTrigger;
  /** Nguồn proxy */
  proxySource: EnrichProxySource;
  /** Custom connection settings */
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
  /** Custom proxy settings */
  customProxyUrl: string;
  customProxyPassword: string;
  /** Sampling parameters */
  sampling: EnrichSampling;
  /** Runtime state (not persisted) */
  status: 'idle' | 'running' | 'done' | 'error';
  statusMessage: string;
  /** Log entries */
  enrichLog: EnrichLogEntry[];

  // Actions
  setEnabled: (enabled: boolean) => void;
  setTrigger: (trigger: EnrichTrigger) => void;
  setProxySource: (source: EnrichProxySource) => void;
  setField: (updates: Partial<Pick<EnrichState,
    'customProxyUrl' | 'customProxyPassword' | 'customApiKey' | 'customModel' | 'customBaseUrl'
  >>) => void;
  setSampling: (updates: Partial<EnrichSampling>) => void;
  resetSampling: () => void;
  setStatus: (status: EnrichState['status'], message?: string) => void;
  addLogEntry: (entry: Omit<EnrichLogEntry, 'timestamp'>) => void;
  clearLog: () => void;
}

export const useEnrichStore = create<EnrichState>()(
  persist(
    (set) => ({
      enabled: false,
      trigger: 'after-response',
      proxySource: 'default',
      customBaseUrl: '',
      customApiKey: '',
      customModel: '',
      customProxyUrl: '',
      customProxyPassword: '',
      sampling: { ...DEFAULT_SAMPLING },
      status: 'idle',
      statusMessage: '',
      enrichLog: [],

      setEnabled: (enabled) => set({ enabled }),
      setTrigger: (trigger) => set({ trigger }),
      setProxySource: (source) => set({ proxySource: source }),
      setField: (updates) => set(updates),
      setSampling: (updates) => set(state => ({
        sampling: { ...state.sampling, ...updates },
      })),
      resetSampling: () => set({ sampling: { ...DEFAULT_SAMPLING } }),
      setStatus: (status, message = '') => set({ status, statusMessage: message }),
      addLogEntry: (entry) => set(state => ({
        enrichLog: [{ ...entry, timestamp: Date.now() }, ...state.enrichLog].slice(0, 50),
      })),
      clearLog: () => set({ enrichLog: [] }),
    }),
    {
      name: 'godsim-enrich',
      partialize: (state) => ({
        enabled: state.enabled,
        trigger: state.trigger,
        proxySource: state.proxySource,
        customBaseUrl: state.customBaseUrl,
        customApiKey: state.customApiKey,
        customModel: state.customModel,
        customProxyUrl: state.customProxyUrl,
        customProxyPassword: state.customProxyPassword,
        sampling: state.sampling,
        enrichLog: state.enrichLog,
      }),
    }
  )
);

export { DEFAULT_SAMPLING };
