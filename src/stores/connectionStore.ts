import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProviderPreset = 'openai' | 'anthropic' | 'google' | 'custom';

export interface SamplingParams {
  temperature: number;
  top_p: number;
  top_k: number;
  min_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  max_context_tokens: number;
  streaming: boolean;
  seed: number | null;
  stop_sequences: string[];
  thinking: boolean;
  thinkingBudget: number;
}

export interface ConnectionProfile {
  id: string;
  name: string;
  baseUrl: string;
  apiKeys: string[];
  currentKeyIndex: number;
  proxyUrl: string;
  proxyPassword: string;
  provider: ProviderPreset;
  selectedModel: string;
  availableModels: string[];
  sampling: SamplingParams;
  retryCount: number;
  timeoutMs: number;
}

const defaultSampling: SamplingParams = {
  temperature: 0.85,
  top_p: 0.95,
  top_k: 0,
  min_p: 0.05,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 2048,
  max_context_tokens: 8192,
  streaming: true,
  seed: null,
  stop_sequences: [],
  thinking: false,
  thinkingBudget: 10000,
};

const createDefaultProfile = (id?: string): ConnectionProfile => ({
  id: id || crypto.randomUUID(),
  name: 'Default',
  baseUrl: '',
  apiKeys: [],
  currentKeyIndex: 0,
  proxyUrl: '',
  proxyPassword: '',
  provider: 'openai',
  selectedModel: '',
  availableModels: [],
  sampling: { ...defaultSampling },
  retryCount: 3,
  timeoutMs: 30000,
});

interface ConnectionState {
  profiles: ConnectionProfile[];
  activeProfileId: string;
  connectionStatus: 'idle' | 'testing' | 'connected' | 'error';
  connectionLatency: number | null;
  connectionError: string | null;
  scanningModels: boolean;

  // Actions
  getActiveProfile: () => ConnectionProfile;
  setActiveProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<ConnectionProfile>) => void;
  addProfile: (name?: string) => string;
  deleteProfile: (id: string) => void;
  cloneProfile: (id: string) => string;
  rotateKey: (profileId: string) => void;
  setConnectionStatus: (status: ConnectionState['connectionStatus'], error?: string | null, latency?: number | null) => void;
  setScanningModels: (scanning: boolean) => void;
  setAvailableModels: (profileId: string, models: string[]) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => {
      const defaultProfile = createDefaultProfile('default');
      return {
        profiles: [defaultProfile],
        activeProfileId: defaultProfile.id,
        connectionStatus: 'idle',
        connectionLatency: null,
        connectionError: null,
        scanningModels: false,

        getActiveProfile: () => {
          const state = get();
          return state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];
        },

        setActiveProfile: (id) => set({ activeProfileId: id }),

        updateProfile: (id, updates) => set(state => ({
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

        addProfile: (name) => {
          const profile = createDefaultProfile();
          profile.name = name || `Profile ${get().profiles.length + 1}`;
          set(state => ({ profiles: [...state.profiles, profile] }));
          return profile.id;
        },

        deleteProfile: (id) => set(state => {
          if (state.profiles.length <= 1) return state;
          const filtered = state.profiles.filter(p => p.id !== id);
          return {
            profiles: filtered,
            activeProfileId: state.activeProfileId === id ? filtered[0].id : state.activeProfileId,
          };
        }),

        cloneProfile: (id) => {
          const source = get().profiles.find(p => p.id === id);
          if (!source) return '';
          const cloned = { ...source, id: crypto.randomUUID(), name: `${source.name} (Copy)` };
          set(state => ({ profiles: [...state.profiles, cloned] }));
          return cloned.id;
        },

        rotateKey: (profileId) => set(state => ({
          profiles: state.profiles.map(p => {
            if (p.id !== profileId || p.apiKeys.length <= 1) return p;
            return { ...p, currentKeyIndex: (p.currentKeyIndex + 1) % p.apiKeys.length };
          }),
        })),

        setConnectionStatus: (status, error = null, latency = null) =>
          set({ connectionStatus: status, connectionError: error, connectionLatency: latency }),

        setScanningModels: (scanning) => set({ scanningModels: scanning }),

        setAvailableModels: (profileId, models) => set(state => ({
          profiles: state.profiles.map(p =>
            p.id === profileId ? { ...p, availableModels: models } : p
          ),
        })),
      };
    },
    {
      name: 'godsim-connection',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
    }
  )
);
