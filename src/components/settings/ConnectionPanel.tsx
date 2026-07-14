import React, { useState, useCallback } from 'react';
import { useConnectionStore, type ProviderPreset } from '@/stores/connectionStore';
import { usePresetStore } from '@/stores/presetStore';
import { useEnrichStore, type EnrichProxySource, type EnrichTrigger, type EnrichSampling, DEFAULT_SAMPLING } from '@/stores/enrichStore';
import { useShallow } from 'zustand/react/shallow';
import { scanModels, testConnection, maskKey } from '@/engine/api/apiClient';
import {
  SettingsIcon, SearchIcon, CheckIcon, AlertIcon, CopyIcon,
  ShowIcon, HideIcon, LoaderIcon, RefreshIcon, CloseIcon,
} from '@/ui/icons';
import './ConnectionPanel.css';

const PROVIDER_OPTIONS: { value: ProviderPreset; label: string }[] = [
  { value: 'openai', label: 'OpenAI Compatible' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google Gemini' },
  { value: 'custom', label: 'Custom' },
];

const SAMPLING_PARAMS = [
  { key: 'temperature', label: 'Temperature', min: 0, max: 2, step: 0.05, default: 0.85 },
  { key: 'top_p', label: 'Top P', min: 0, max: 1, step: 0.05, default: 0.95 },
  { key: 'top_k', label: 'Top K', min: 0, max: 100, step: 1, default: 0 },
  { key: 'min_p', label: 'Min P', min: 0, max: 1, step: 0.01, default: 0.05 },
  { key: 'frequency_penalty', label: 'Frequency Penalty', min: -2, max: 2, step: 0.1, default: 0 },
  { key: 'presence_penalty', label: 'Presence Penalty', min: -2, max: 2, step: 0.1, default: 0 },
  { key: 'max_tokens', label: 'Max Tokens', min: 64, max: 131072, step: 64, default: 8192 },
  { key: 'max_context_tokens', label: 'Max Context', min: 1024, max: 2097152, step: 1024, default: 32768 },
];

/** Auto-expand slider max so preset values aren't clipped */
function getEffectiveMax(param: typeof SAMPLING_PARAMS[number], currentValue: number): number {
  return Math.max(param.max, currentValue);
}

export const ConnectionPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    profiles, activeProfileId, connectionStatus, connectionLatency, connectionError,
    scanningModels, getActiveProfile, setActiveProfile, updateProfile, addProfile,
    deleteProfile, cloneProfile, setConnectionStatus, setScanningModels, setAvailableModels,
  } = useConnectionStore(useShallow(s => ({
    profiles: s.profiles,
    activeProfileId: s.activeProfileId,
    connectionStatus: s.connectionStatus,
    connectionLatency: s.connectionLatency,
    connectionError: s.connectionError,
    scanningModels: s.scanningModels,
    getActiveProfile: s.getActiveProfile,
    setActiveProfile: s.setActiveProfile,
    updateProfile: s.updateProfile,
    addProfile: s.addProfile,
    deleteProfile: s.deleteProfile,
    cloneProfile: s.cloneProfile,
    setConnectionStatus: s.setConnectionStatus,
    setScanningModels: s.setScanningModels,
    setAvailableModels: s.setAvailableModels,
  })));

  const profile = getActiveProfile();
  const { activePreset, loadPreset, clearPreset } = usePresetStore(useShallow(s => ({
    activePreset: s.activePreset,
    loadPreset: s.loadPreset,
    clearPreset: s.clearPreset,
  })));
  const [showKeys, setShowKeys] = useState(false);
  const [modelFilter, setModelFilter] = useState('');
  const [activeSection, setActiveSection] = useState<'connection' | 'proxy' | 'sampling' | 'profiles' | 'preset' | 'enrich' | 'enrich-params'>('connection');
  const [scanMsg, setScanMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleScanModels = useCallback(async () => {
    setScanningModels(true);
    setScanMsg(null);
    try {
      const models = await scanModels(profile);
      setAvailableModels(profile.id, models);
      if (models.length === 0) {
        setScanMsg({ ok: false, text: 'Không tìm thấy model nào. Kiểm tra lại Base URL / API key.' });
      } else {
        setScanMsg({ ok: true, text: `Đã tìm thấy ${models.length} model.` });
        if (!profile.selectedModel) updateProfile(profile.id, { selectedModel: models[0] });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const hint = /failed to fetch|networkerror|cors|load failed/i.test(msg)
        ? ' — có thể do CORS: hãy dùng Proxy hoặc endpoint hỗ trợ gọi từ trình duyệt.'
        : '';
      setScanMsg({ ok: false, text: `Quét thất bại: ${msg}${hint}` });
    } finally {
      setScanningModels(false);
    }
  }, [profile, setScanningModels, setAvailableModels, updateProfile]);

  const handleTestConnection = useCallback(async () => {
    setConnectionStatus('testing');
    const result = await testConnection(profile);
    setConnectionStatus(
      result.ok ? 'connected' : 'error',
      result.error || null,
      result.latency
    );
  }, [profile, setConnectionStatus]);

  const handleCopyKey = useCallback(() => {
    const key = profile.apiKeys[profile.currentKeyIndex];
    if (key) navigator.clipboard.writeText(key);
  }, [profile]);

  const filteredModels = React.useMemo(() => 
    profile.availableModels.filter(m =>
      m.toLowerCase().includes(modelFilter.toLowerCase())
    ),
    [profile.availableModels, modelFilter]
  );

  const canConnect = Boolean(profile.baseUrl || profile.proxyUrl);

  const renderProvider = () => (
    <div className="input-group">
      <label className="input-label">Nhà Cung Cấp</label>
      <select
        className="input"
        value={profile.provider}
        onChange={e => updateProfile(profile.id, { provider: e.target.value as ProviderPreset })}
      >
        {PROVIDER_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderModelSelection = () => (
    <div className="input-group">
      <label className="input-label">Model</label>
      <div className="model-select-row">
        {profile.availableModels.length > 0 ? (
          <>
            <input
              className="input"
              placeholder="Lọc model..."
              value={modelFilter}
              onChange={e => setModelFilter(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="input"
              value={profile.selectedModel}
              onChange={e => updateProfile(profile.id, { selectedModel: e.target.value })}
              style={{ flex: 2 }}
            >
              <option value="">Chọn model...</option>
              {filteredModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </>
        ) : (
          <input
            className="input"
            placeholder="Nhập tên model hoặc bấm Quét"
            value={profile.selectedModel}
            onChange={e => updateProfile(profile.id, { selectedModel: e.target.value })}
            style={{ flex: 1 }}
          />
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleScanModels}
          disabled={scanningModels || !canConnect}
        >
          {scanningModels ? <LoaderIcon size={14} /> : <SearchIcon size={14} />}
          Quét
        </button>
      </div>
      {scanMsg && (
        <div className={`conn-status ${scanMsg.ok ? 'conn-status--ok' : 'conn-status--error'}`} style={{ marginTop: '8px' }}>
          {scanMsg.ok ? <CheckIcon size={14} color="var(--accent-success)" /> : <AlertIcon size={14} color="var(--accent-danger)" />}
          {scanMsg.text}
        </div>
      )}
      {!canConnect && (
        <span className="input-hint" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Nhập Base URL (hoặc Proxy URL) để bật Quét & Kiểm Tra.
        </span>
      )}
    </div>
  );

  const renderRetryConfig = () => (
    <div className="input-group">
      <label className="input-label">Số lần tự thử lại ({profile.retryCount})</label>
      <input
        className="slider"
        type="range"
        min={3}
        max={10}
        value={profile.retryCount}
        onChange={e => updateProfile(profile.id, { retryCount: parseInt(e.target.value) })}
      />
    </div>
  );

  const renderTestAndStatus = () => (
    <div className="conn-actions">
      <button
        className="btn btn-primary"
        onClick={handleTestConnection}
        disabled={connectionStatus === 'testing' || !canConnect}
      >
        {connectionStatus === 'testing' ? <LoaderIcon size={16} /> : <RefreshIcon size={16} />}
        Kiểm Tra Kết Nối
      </button>

      {connectionStatus === 'connected' && (
        <div className="conn-status conn-status--ok">
          <CheckIcon size={14} color="var(--accent-success)" />
          Đã kết nối ({connectionLatency}ms)
        </div>
      )}
      {connectionStatus === 'error' && (
        <div className="conn-status conn-status--error">
          <AlertIcon size={14} color="var(--accent-danger)" />
          {connectionError}
        </div>
      )}
    </div>
  );

  return (
    <div className="conn-panel glass-heavy animate-fadeIn">
      <div className="conn-header">
        <div className="conn-title">
          <SettingsIcon size={18} color="var(--accent-primary)" />
          <h3>Kết Nối AI</h3>
        </div>
        {onClose && (
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* Tab Nav */}
      <div className="conn-tabs">
        {(['connection', 'proxy', 'sampling', 'profiles', 'preset', 'enrich', 'enrich-params'] as const).map(tab => (
          <button
            key={tab}
            className={`conn-tab ${activeSection === tab ? 'conn-tab--active' : ''}`}
            onClick={() => setActiveSection(tab)}
          >
            {tab === 'connection' ? 'Kết Nối' : tab === 'proxy' ? 'Proxy' : tab === 'sampling' ? 'Tham Số' : tab === 'profiles' ? 'Hồ Sơ' : tab === 'preset' ? 'Preset' : tab === 'enrich' ? 'AI Kết Nối' : 'AI Tham Số'}
          </button>
        ))}
      </div>

      <div className="conn-body">
        {/* ── CONNECTION TAB ── */}
        {activeSection === 'connection' && (
          <div className="conn-section animate-fadeIn">
            {/* Profile Selector */}
            <div className="input-group">
              <label className="input-label">Hồ Sơ Đang Dùng</label>
              <select
                className="input"
                value={activeProfileId}
                onChange={e => setActiveProfile(e.target.value)}
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Provider */}
            {renderProvider()}

            {/* Base URL */}
            <div className="input-group">
              <label className="input-label">Base URL</label>
              <input
                className="input"
                type="url"
                placeholder="https://api.example.com/v1"
                value={profile.baseUrl}
                onChange={e => updateProfile(profile.id, { baseUrl: e.target.value })}
              />
            </div>

            {/* API Keys */}
            <div className="input-group">
              <label className="input-label">
                API Key (mỗi dòng một key)
                {profile.apiKeys.length > 1 && (
                  <span className="badge badge-gold" style={{ marginLeft: '8px' }}>
                    Đang dùng: {maskKey(profile.apiKeys[profile.currentKeyIndex] || '')}
                  </span>
                )}
              </label>
              <div className="input-with-action">
                <textarea
                  className="input"
                  placeholder="sk-..."
                  value={profile.apiKeys.join('\n')}
                  onChange={e => updateProfile(profile.id, {
                    // trim từng key — key dán kèm khoảng trắng sẽ làm header sai
                    apiKeys: e.target.value.split('\n').map(k => k.trim()).filter(Boolean),
                    currentKeyIndex: 0,
                  })}
                  rows={3}
                />
                <div className="input-actions">
                  <button className="btn btn-icon btn-sm" onClick={() => setShowKeys(!showKeys)} title={showKeys ? 'Hide' : 'Show'}>
                    {showKeys ? <HideIcon size={14} /> : <ShowIcon size={14} />}
                  </button>
                  <button className="btn btn-icon btn-sm" onClick={handleCopyKey} title="Copy active key">
                    <CopyIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Model Selection */}
            {renderModelSelection()}

            {/* Retry Config */}
            {renderRetryConfig()}

            {/* Test & Status */}
            {renderTestAndStatus()}
          </div>
        )}

        {/* ── PROXY TAB ── */}
        {activeSection === 'proxy' && (
          <div className="conn-section animate-fadeIn">
            {/* Proxy URL */}
            <div className="input-group">
              <label className="input-label">URL Proxy (tùy chọn)</label>
              <input
                className="input"
                type="url"
                placeholder="https://proxy-cua-ban.com"
                value={profile.proxyUrl}
                onChange={e => updateProfile(profile.id, { proxyUrl: e.target.value })}
              />
              <span className="input-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Có Base URL → yêu cầu đi qua proxy dạng <code>?target=&lt;base&gt;</code> (né CORS).
                Không có Base URL → proxy được dùng LÀM endpoint (proxy/chat/completions).
                Thiếu https:// hay lỡ dán cả /chat/completions cũng được tự sửa.
              </span>
            </div>

            {/* Proxy Password */}
            <div className="input-group">
              <label className="input-label">Mật Khẩu Proxy</label>
              <div className="input-with-action">
                <input
                  className="input"
                  type={showKeys ? 'text' : 'password'}
                  placeholder="Proxy password"
                  value={profile.proxyPassword}
                  onChange={e => updateProfile(profile.id, { proxyPassword: e.target.value })}
                />
                <div className="input-actions">
                  <button className="btn btn-icon btn-sm" onClick={() => setShowKeys(!showKeys)} title={showKeys ? 'Hide' : 'Show'}>
                    {showKeys ? <HideIcon size={14} /> : <ShowIcon size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <hr className="conn-divider" style={{ margin: '16px 0', borderColor: 'var(--border-light)' }} />

            {/* Provider */}
            {renderProvider()}

            {/* Model Selection */}
            {renderModelSelection()}

            {/* Retry Config */}
            {renderRetryConfig()}

            {/* Test & Status */}
            {renderTestAndStatus()}
          </div>
        )}

        {/* ── SAMPLING TAB ── */}
        {activeSection === 'sampling' && (
          <div className="conn-section animate-fadeIn">
          {SAMPLING_PARAMS.map(param => {
            const currentVal = profile.sampling[param.key as keyof typeof profile.sampling] as number;
            const effectiveMax = getEffectiveMax(param, currentVal);
            return (
              <div className="param-row" key={param.key}>
                <div className="param-header">
                  <label className="input-label">{param.label}</label>
                  <input
                    className="input param-number"
                    type="number"
                    min={param.min}
                    max={effectiveMax}
                    step={param.step}
                    value={currentVal}
                    onChange={e => updateProfile(profile.id, {
                      sampling: { ...profile.sampling, [param.key]: parseFloat(e.target.value) || 0 },
                    })}
                  />
                </div>
                <input
                  className="slider"
                  type="range"
                  min={param.min}
                  max={effectiveMax}
                  step={param.step}
                  value={currentVal}
                  onChange={e => updateProfile(profile.id, {
                    sampling: { ...profile.sampling, [param.key]: parseFloat(e.target.value) || 0 },
                  })}
                />
                <button
                  className="btn btn-icon btn-sm param-reset"
                  title="Reset to default"
                  onClick={() => updateProfile(profile.id, {
                    sampling: { ...profile.sampling, [param.key]: param.default },
                  })}
                >
                  <RefreshIcon size={12} />
                </button>
              </div>
            );
          })}

            {/* Streaming toggle */}
            <div className="param-row">
              <label className="input-label" style={{ flex: 1 }}>Streaming</label>
              <button
                className={`toggle ${profile.sampling.streaming ? 'toggle--on' : ''}`}
                onClick={() => updateProfile(profile.id, {
                  sampling: { ...profile.sampling, streaming: !profile.sampling.streaming },
                })}
              >
                <div className="toggle-thumb" />
              </button>
            </div>

            {/* Thinking toggle */}
            <div className="param-row">
              <label className="input-label" style={{ flex: 1 }}>
                Thinking Mode
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 400 }}>
                  Cho model suy nghĩ trước khi viết
                </span>
              </label>
              <button
                className={`toggle ${profile.sampling.thinking ? 'toggle--on' : ''}`}
                onClick={() => updateProfile(profile.id, {
                  sampling: { ...profile.sampling, thinking: !profile.sampling.thinking },
                })}
              >
                <div className="toggle-thumb" />
              </button>
            </div>

            {/* Thinking Budget — only show when thinking enabled */}
            {profile.sampling.thinking && (
              <div className="param-row" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <div className="param-header">
                  <label className="input-label">Thinking Budget (tokens)</label>
                  <input
                    className="input param-number"
                    type="number"
                    min={1000}
                    max={1048576}
                    step={1000}
                    value={profile.sampling.thinkingBudget}
                    onChange={e => updateProfile(profile.id, {
                      sampling: { ...profile.sampling, thinkingBudget: parseInt(e.target.value) || 10000 },
                    })}
                  />
                </div>
                <input
                  className="slider"
                  type="range"
                  min={1000}
                  max={1048576}
                  step={1000}
                  value={profile.sampling.thinkingBudget}
                  onChange={e => updateProfile(profile.id, {
                    sampling: { ...profile.sampling, thinkingBudget: parseInt(e.target.value) || 10000 },
                  })}
                />
              </div>
            )}
          </div>
        )}

        {/* ── PROFILES TAB ── */}
        {activeSection === 'profiles' && (
          <div className="conn-section animate-fadeIn">
            {profiles.map(p => (
              <div key={p.id} className={`profile-card glass-light ${p.id === activeProfileId ? 'profile-card--active' : ''}`}>
                <div className="profile-info" onClick={() => setActiveProfile(p.id)}>
                  <span className="profile-name">{p.name}</span>
                  <span className="profile-meta">{p.provider} {p.selectedModel ? `· ${p.selectedModel}` : ''}</span>
                </div>
                <div className="profile-actions">
                  <button className="btn btn-icon btn-sm" onClick={() => cloneProfile(p.id)} title="Clone">
                    <CopyIcon size={12} />
                  </button>
                  {profiles.length > 1 && (
                    <button className="btn btn-icon btn-sm btn-danger" onClick={() => deleteProfile(p.id)} title="Delete">
                      <CloseIcon size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={() => addProfile()} style={{ width: '100%', marginTop: 'var(--space-3)' }}>
              Thêm Hồ Sơ
            </button>
          </div>
        )}

        {/* ── PRESET TAB ── */}
        {activeSection === 'preset' && (
          <div className="conn-section animate-fadeIn">
            <div className="input-group">
              <label className="input-label">Preset AI (Chuẩn SillyTavern)</label>
              
              {activePreset ? (
                <div className="profile-card glass-light profile-card--active">
                  <div className="profile-info">
                    <span className="profile-name">{activePreset.name}</span>
                    <span className="profile-meta">
                      {activePreset.prompts.length} khối lệnh
                      {activePreset.regexes.length > 0 && ` · ${activePreset.regexes.length} regex`}
                    </span>
                  </div>
                  <div className="profile-actions">
                    <button className="btn btn-icon btn-sm btn-danger" onClick={clearPreset} title="Gỡ bỏ">
                      <CloseIcon size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-card glass-light" style={{ justifyContent: 'center', cursor: 'pointer' }}>
                  <label style={{ width: '100%', textAlign: 'center', cursor: 'pointer', padding: '16px 0' }}>
                    <input 
                      type="file" 
                      accept=".json" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const json = JSON.parse(ev.target?.result as string);
                            loadPreset(json, file.name);
                          } catch (err) {
                            alert('Lỗi đọc file Preset: ' + err);
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = ''; // reset
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>Nhấp để tải lên file Preset (.json)</span>
                  </label>
                </div>
              )}
            </div>
            {activePreset && (
              <span className="input-hint" style={{ fontSize: '0.85rem', color: 'var(--accent-success)', marginTop: '8px', display: 'block', lineHeight: 1.4 }}>
                Preset đã được nạp thành công. Trí tuệ nhân tạo sẽ tự động tuân theo văn phong và các chỉ thị được định nghĩa trong preset này.
              </span>
            )}
            {!activePreset && (
              <span className="input-hint" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block', lineHeight: 1.4 }}>
                Bạn có thể nạp các file Preset (chứa các system prompt, thẻ meta, macro setvar/getvar) để ghi đè hoặc bổ sung lối văn phong, luật chơi cho AI.
              </span>
            )}
          </div>
        )}

        {/* ── ENRICH CONNECTION TAB ── */}
        {activeSection === 'enrich' && <EnrichConnectionSection />}

        {/* ── ENRICH PARAMS TAB ── */}
        {activeSection === 'enrich-params' && <EnrichParamsSection />}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ENRICH TABS — AI Kết Nối + AI Tham Số
   ═══════════════════════════════════════════════════════ */

const ENRICH_SAMPLING_PARAMS = [
  { key: 'temperature', label: 'Temperature', min: 0, max: 2, step: 0.05, default: 0.7 },
  { key: 'top_p', label: 'Top P', min: 0, max: 1, step: 0.05, default: 0.95 },
  { key: 'max_tokens', label: 'Max Tokens', min: 100, max: 8000, step: 100, default: 2000 },
  { key: 'frequency_penalty', label: 'Frequency Penalty', min: -2, max: 2, step: 0.1, default: 0 },
  { key: 'presence_penalty', label: 'Presence Penalty', min: -2, max: 2, step: 0.1, default: 0 },
];

/* ── Tab 1: Enrich Kết Nối ── */
const EnrichConnectionSection: React.FC = () => {
  const [showKeys, setShowKeys] = useState(false);
  const {
    enabled, trigger, proxySource,
    customBaseUrl, customApiKey, customModel,
    customProxyUrl, customProxyPassword,
    status, statusMessage, enrichLog,
    setEnabled, setTrigger, setProxySource, setField, clearLog,
  } = useEnrichStore(useShallow(s => ({
    enabled: s.enabled,
    trigger: s.trigger,
    proxySource: s.proxySource,
    customBaseUrl: s.customBaseUrl,
    customApiKey: s.customApiKey,
    customModel: s.customModel,
    customProxyUrl: s.customProxyUrl,
    customProxyPassword: s.customProxyPassword,
    status: s.status,
    statusMessage: s.statusMessage,
    enrichLog: s.enrichLog,
    setEnabled: s.setEnabled,
    setTrigger: s.setTrigger,
    setProxySource: s.setProxySource,
    setField: s.setField,
    clearLog: s.clearLog,
  })));

  return (
    <div className="conn-section animate-fadeIn">
      {/* Toggle */}
      <div className="param-row">
        <label className="input-label" style={{ flex: 1 }}>Bật AI Tự Động Bổ Sung</label>
        <button
          className={`toggle ${enabled ? 'toggle--on' : ''}`}
          onClick={() => setEnabled(!enabled)}
        >
          <div className="toggle-thumb" />
        </button>
      </div>

      {/* Trigger mode */}
      <div className="input-group">
        <label className="input-label">Chế Độ Kích Hoạt</label>
        <select
          className="input"
          value={trigger}
          onChange={e => setTrigger(e.target.value as EnrichTrigger)}
        >
          <option value="after-response">Sau mỗi phản hồi AI</option>
          <option value="manual">Bấm tay (nút trong chat)</option>
        </select>
      </div>

      {/* Source */}
      <div className="input-group">
        <label className="input-label">Nguồn Kết Nối</label>
        <select
          className="input"
          value={proxySource}
          onChange={e => setProxySource(e.target.value as EnrichProxySource)}
        >
          <option value="default">Dùng cài đặt hiện tại (Proxy/API chính)</option>
          <option value="custom">Proxy / API riêng cho Enrich</option>
        </select>
        <span className="input-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {proxySource === 'default'
            ? 'Enrich sẽ dùng cùng kết nối với chat để gọi AI.'
            : 'Bạn có thể dùng proxy/API riêng cho Enrich (để tránh ảnh hưởng rate limit).'}
        </span>
      </div>

      {proxySource === 'custom' && (
        <>
          <hr className="conn-divider" style={{ margin: '16px 0', borderColor: 'var(--border-light)' }} />

          {/* Base URL */}
          <div className="input-group">
            <label className="input-label">Base URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://api.openai.com/v1"
              value={customBaseUrl}
              onChange={e => setField({ customBaseUrl: e.target.value })}
            />
          </div>

          {/* API Key */}
          <div className="input-group">
            <label className="input-label">API Key</label>
            <div className="input-with-action">
              <input
                className="input"
                type={showKeys ? 'text' : 'password'}
                placeholder="sk-..."
                value={customApiKey}
                onChange={e => setField({ customApiKey: e.target.value })}
              />
              <div className="input-actions">
                <button className="btn btn-icon btn-sm" onClick={() => setShowKeys(!showKeys)} title={showKeys ? 'Hide' : 'Show'}>
                  {showKeys ? <HideIcon size={14} /> : <ShowIcon size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Model */}
          <div className="input-group">
            <label className="input-label">Model</label>
            <input
              className="input"
              placeholder="gpt-4o-mini"
              value={customModel}
              onChange={e => setField({ customModel: e.target.value })}
            />
          </div>

          <hr className="conn-divider" style={{ margin: '16px 0', borderColor: 'var(--border-light)' }} />

          {/* Proxy URL */}
          <div className="input-group">
            <label className="input-label">URL Proxy (tùy chọn)</label>
            <input
              className="input"
              type="url"
              placeholder="https://proxy-cua-ban.com"
              value={customProxyUrl}
              onChange={e => setField({ customProxyUrl: e.target.value })}
            />
            <span className="input-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Nếu điền, yêu cầu Enrich sẽ đi qua proxy này.</span>
          </div>

          {/* Proxy Password */}
          <div className="input-group">
            <label className="input-label">Mật Khẩu Proxy</label>
            <div className="input-with-action">
              <input
                className="input"
                type={showKeys ? 'text' : 'password'}
                placeholder="Proxy password"
                value={customProxyPassword}
                onChange={e => setField({ customProxyPassword: e.target.value })}
              />
              <div className="input-actions">
                <button className="btn btn-icon btn-sm" onClick={() => setShowKeys(!showKeys)} title={showKeys ? 'Hide' : 'Show'}>
                  {showKeys ? <HideIcon size={14} /> : <ShowIcon size={14} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status */}
      {status !== 'idle' && (
        <div className={`enrich-status enrich-status--${status}`}>
          {statusMessage}
        </div>
      )}

      {/* Activity Log */}
      {enrichLog.length > 0 && (
        <>
          <hr className="conn-divider" style={{ margin: '16px 0', borderColor: 'var(--border-light)' }} />
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ margin: 0 }}>Lịch Sử Bổ Sung ({enrichLog.length})</label>
              <button
                className="btn btn-sm"
                onClick={clearLog}
                style={{ fontSize: '10px', padding: '2px 8px' }}
              >
                Xóa
              </button>
            </div>
            <div className="enrich-log">
              {enrichLog.slice(0, 20).map((entry, i) => (
                <div key={i} className="enrich-log-entry">
                  <span className="enrich-log-name">{entry.entityName}</span>
                  <span className="enrich-log-meta">
                    {entry.category} — {entry.fieldsUpdated.length} fields
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Tab 2: Enrich Tham Số ── */
const EnrichParamsSection: React.FC = () => {
  const { sampling, setSampling, resetSampling } = useEnrichStore(useShallow(s => ({
    sampling: s.sampling,
    setSampling: s.setSampling,
    resetSampling: s.resetSampling,
  })));

  return (
    <div className="conn-section animate-fadeIn">
      <span className="input-hint" style={{ display: 'block', marginBottom: '12px', lineHeight: 1.5 }}>
        Tham số lấy mẫu cho AI Enrich — điều chỉnh độ sáng tạo và độ dài của dữ liệu bổ sung.
      </span>

      {ENRICH_SAMPLING_PARAMS.map(param => {
        const val = sampling[param.key as keyof EnrichSampling];
        return (
          <div className="param-row" key={param.key}>
            <div className="param-header">
              <label className="input-label">{param.label}</label>
              <input
                className="input param-number"
                type="number"
                min={param.min}
                max={param.max}
                step={param.step}
                value={val}
                onChange={e => setSampling({ [param.key]: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <input
              className="slider"
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={val}
              onChange={e => setSampling({ [param.key]: parseFloat(e.target.value) || 0 })}
            />
            <button
              className="btn btn-icon btn-sm param-reset"
              title="Reset to default"
              onClick={() => setSampling({ [param.key]: param.default })}
            >
              <RefreshIcon size={12} />
            </button>
          </div>
        );
      })}

      {/* Reset all */}
      <div style={{ marginTop: '12px' }}>
        <button
          className="btn btn-sm"
          onClick={resetSampling}
          style={{ fontSize: '11px' }}
        >
          <RefreshIcon size={12} />
          &nbsp;Reset Tất Cả Về Mặc Định
        </button>
      </div>
    </div>
  );
};

export default ConnectionPanel;
