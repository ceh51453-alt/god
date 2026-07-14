import React, { useState, useCallback, useMemo } from 'react';
import {
  type GamePath, type CharacterData, type WizardStep, type AttributeDef, type TraitDef,
  defaultCharacter,
  CREATOR_STEPS, GOD_STEPS, MORTAL_STEPS,
  CREATOR_ATTRIBUTES, GOD_ATTRIBUTES, MORTAL_ATTRIBUTES,
  CREATOR_TRAITS, GOD_TRAITS, MORTAL_TRAITS,
  CREATOR_REPUTATIONS, GOD_REPUTATIONS, MORTAL_REPUTATIONS,
  CREATOR_CRISES, GOD_CRISES, MORTAL_CRISES,
  CREATOR_DOMAINS, MORTAL_CLASSES
} from './creationData';
import { CREATOR_PRESETS, GOD_PRESETS, MORTAL_PRESETS, type CharacterPreset } from './creationPresets';
import { generateCharacter } from '@/engine/api/characterGen';
import './CreationWizard.css';

interface Props {
  path: GamePath;
  onComplete: (char: CharacterData) => void;
  onBack: () => void;
}

export const CreationWizard: React.FC<Props> = ({ path, onComplete, onBack }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [char, setChar] = useState<CharacterData>(() => {
    const base = { ...defaultCharacter, path };
    const attrs: Record<string, number> = {};
    getAttributes(path).forEach(a => { attrs[a.key] = a.default; });
    return { ...base, attributes: attrs };
  });
  const [customCrisis, setCustomCrisis] = useState('');

  const steps = getSteps(path);
  const currentStep = steps[stepIndex];
  const attributes = useMemo(() => getAttributes(path), [path]);
  const traits = useMemo(() => getTraits(path), [path]);
  const reputations = useMemo(() => getReputations(path), [path]);
  const crises = useMemo(() => getCrises(path), [path]);
  const presets = useMemo(() => getPresets(path), [path]);

  const updateChar = useCallback((partial: Partial<CharacterData>) => {
    setChar(prev => ({ ...prev, ...partial }));
  }, []);

  const updateAttr = useCallback((key: string, val: number) => {
    setChar(prev => ({ ...prev, attributes: { ...prev.attributes, [key]: val } }));
  }, []);

  const updateFollowerAttr = useCallback((key: string, val: number) => {
    setChar(prev => ({
      ...prev,
      followerAttributes: { ...(prev.followerAttributes || {}), [key]: val }
    }));
  }, []);

  const toggleTrait = useCallback((id: string) => {
    setChar(prev => {
      const has = prev.traits.includes(id);
      return { ...prev, traits: has ? prev.traits.filter(t => t !== id) : [...prev.traits, id] };
    });
  }, []);

  const goNext = () => { if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1); };
  const goBack = () => { if (stepIndex > 0) setStepIndex(stepIndex - 1); else onBack(); };

  const handleConfirm = () => {
    // Đổi id slug → tên tiếng Việt trước khi ra khỏi wizard — nếu không,
    // prompt/state/UI sẽ hiện "feared"/"peasant"/"chaos" thay vì tên thật.
    const out: CharacterData = { ...char };

    const rep = reputations.find(r => r.id === out.reputation);
    if (rep) out.reputation = rep.name;

    if (out.crisis === 'custom') {
      out.crisis = customCrisis || 'Tự định nghĩa';
    } else if (out.crisis === 'none') {
      out.crisis = ''; // "bình yên" = không có khủng hoảng, đừng nhồi vào prompt
    } else {
      const cr = crises.find(c => c.id === out.crisis);
      if (cr) out.crisis = cr.name;
    }

    const dom = CREATOR_DOMAINS.find(d => d.id === out.cosmicDomain);
    if (dom) out.cosmicDomain = dom.id === 'custom' ? '' : dom.name; // custom: mô tả nằm ở backstory

    const mc = MORTAL_CLASSES.find(c => c.id === out.mortalClass);
    if (mc) out.mortalClass = mc.id === 'custom' ? (out.mortalOrigin || '') : mc.name;

    onComplete(out);
  };

  // ── Path color ──
  const pathAccent = path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8';

  return (
    <div className="wizard" style={{ '--wizard-accent': pathAccent } as React.CSSProperties}>
      <div className="title-bg">
        <div className="title-stars" />
        <div className="title-nebula title-nebula--1" />
        <div className="title-vignette" />
      </div>

      <div className="wizard-content">
        {/* Step indicator */}
        <div className="wizard-steps">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`wizard-dot ${i === stepIndex ? 'wizard-dot--active' : ''} ${i < stepIndex ? 'wizard-dot--done' : ''}`}
              onClick={() => i <= stepIndex && setStepIndex(i)}
              title={s.title}
            />
          ))}
        </div>

        {/* Header */}
        <div className="wizard-header animate-fadeIn" key={currentStep.id}>
          <h2 className="wizard-title">{currentStep.title}</h2>
          <p className="wizard-subtitle">{currentStep.subtitle}</p>
        </div>

        {/* Step Content */}
        <div className="wizard-body" key={`body-${currentStep.id}`}>
          {renderStepContent(currentStep.id, {
            path, char, updateChar, updateAttr, updateFollowerAttr, toggleTrait,
            attributes, traits, reputations, crises, presets,
            customCrisis, setCustomCrisis,
            steps, stepIndex,
          })}
        </div>

        {/* Navigation */}
        <div className="wizard-nav">
          <button className="wizard-btn wizard-btn--back" onClick={goBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            {stepIndex === 0 ? 'Quay lại' : 'Trước'}
          </button>
          {stepIndex < steps.length - 1 ? (
            <button className="wizard-btn wizard-btn--next" onClick={goNext}>
              Tiếp
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button className="wizard-btn wizard-btn--confirm" onClick={handleConfirm}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L14.5 8.5L21 9.5L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.5L9.5 8.5L12 2Z" />
              </svg>
              {path === 'creator' ? 'Bắt Đầu Sáng Tạo' : path === 'god' ? 'Giáng Lâm' : 'Bước Vào Loạn Thế'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──

function getSteps(p: GamePath): WizardStep[] {
  return p === 'creator' ? CREATOR_STEPS : p === 'god' ? GOD_STEPS : MORTAL_STEPS;
}
function getAttributes(p: GamePath): AttributeDef[] {
  return p === 'creator' ? CREATOR_ATTRIBUTES : p === 'god' ? GOD_ATTRIBUTES : MORTAL_ATTRIBUTES;
}
function getTraits(p: GamePath): TraitDef[] {
  return p === 'creator' ? CREATOR_TRAITS : p === 'god' ? GOD_TRAITS : MORTAL_TRAITS;
}
function getReputations(p: GamePath) {
  return p === 'creator' ? CREATOR_REPUTATIONS : p === 'god' ? GOD_REPUTATIONS : MORTAL_REPUTATIONS;
}
function getCrises(p: GamePath) {
  return p === 'creator' ? CREATOR_CRISES : p === 'god' ? GOD_CRISES : MORTAL_CRISES;
}
function getPresets(p: GamePath): CharacterPreset[] {
  return p === 'creator' ? CREATOR_PRESETS : p === 'god' ? GOD_PRESETS : MORTAL_PRESETS;
}

// ── Step Content Renderer ──

interface StepCtx {
  path: GamePath;
  char: CharacterData;
  updateChar: (p: Partial<CharacterData>) => void;
  updateAttr: (k: string, v: number) => void;
  updateFollowerAttr: (k: string, v: number) => void;
  toggleTrait: (id: string) => void;
  attributes: AttributeDef[];
  traits: TraitDef[];
  reputations: { id: string; name: string; description: string }[];
  crises: { id: string; name: string; description: string }[];
  presets: CharacterPreset[];
  customCrisis: string;
  setCustomCrisis: (v: string) => void;
  steps: WizardStep[];
  stepIndex: number;
}

function renderStepContent(stepId: string, ctx: StepCtx): React.ReactNode {
  switch (stepId) {
    case 'identity': return <IdentityStep {...ctx} />;
    case 'cosmic_domain': return <CosmicDomainStep {...ctx} />;
    case 'origin': return <OriginStep {...ctx} />;
    case 'era': return <EraStep {...ctx} />;
    case 'faction': return <FactionStep {...ctx} />;
    case 'attributes': return <AttributesStep {...ctx} />;
    case 'cosmos': return <CosmosStep {...ctx} />;
    case 'reputation': return <ReputationStep {...ctx} />;
    case 'crisis': return <CrisisStep {...ctx} />;
    case 'followers': return <FollowersStep {...ctx} />;
    case 'companion': return <CompanionStep {...ctx} />;
    case 'preview': return <PreviewStep {...ctx} />;
    default: return <div>Unknown step</div>;
  }
}

// ── IDENTITY ──
const IdentityStep: React.FC<StepCtx> = ({ path, char, updateChar, presets }) => {
  const nameLabel = path === 'creator' ? 'Danh Xưng Sáng Thế' : path === 'god' ? 'Tên Thần' : 'Họ Tên';
  const namePlaceholder = path === 'creator' ? 'Ví dụ: Hỗn Nguyên Thái Tổ' : path === 'god' ? 'Ví dụ: Agni, Thần Lửa' : 'Ví dụ: Lý Thanh Phong';
  const titleLabel = path === 'creator' ? 'Danh Hiệu (Tùy chọn)' : path === 'god' ? 'Biệt Danh Thần Thánh (Tùy chọn)' : 'Biểu Tự / Biệt Danh (Tùy chọn)';
  const titlePlaceholder = path === 'creator' ? 'Ví dụ: Đấng Vô Thuỷ Vô Chung' : path === 'god' ? 'Ví dụ: Đấng Rèn Đúc Linh Hồn' : 'Ví dụ: Tử Long';

  const [aiDesc, setAiDesc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!aiDesc.trim() || aiLoading) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const gen = await generateCharacter(path, aiDesc);
      updateChar({
        ...gen,
        attributes: gen.attributes ? { ...char.attributes, ...gen.attributes } : char.attributes,
      });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Không tạo được nhân vật. Thử lại hoặc kiểm tra kết nối AI.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="step-fields">
      {/* AI Character Generator */}
      <div className="ai-gen">
        <div className="ai-gen-head">
          <span className="ai-gen-title">✦ AI Tạo Nhân Vật</span>
          <span className="ai-gen-sub">Mô tả ý tưởng — AI sẽ dựng sẵn hồ sơ để ngươi tinh chỉnh.</span>
        </div>
        <textarea
          className="field-textarea"
          value={aiDesc}
          onChange={e => setAiDesc(e.target.value)}
          placeholder={path === 'creator'
            ? 'Ví dụ: một đấng sáng tạo lạnh lùng theo chủ nghĩa hoàn mỹ, khởi nguyên từ biển hỗn mang, ghét sự vô trật tự...'
            : path === 'god'
            ? 'Ví dụ: nữ thần băng giá cai quản phương bắc, từng bị thần hệ phản bội, đang gây dựng lại tín đồ...'
            : 'Ví dụ: một thiếu niên xuất thân bần nông, thiên phú tu luyện kém nhưng ý chí sắt đá, mang mối thù diệt tộc...'}
          rows={3}
        />
        <div className="ai-gen-actions">
          <button
            className="wizard-btn wizard-btn--next ai-gen-btn"
            onClick={handleGenerate}
            disabled={aiLoading || !aiDesc.trim()}
          >
            {aiLoading ? 'Đang sáng tạo...' : 'Tạo bằng AI'}
          </button>
          {aiError && <span className="ai-gen-error">{aiError}</span>}
        </div>
      </div>

      <div className="presets-section" style={{ marginBottom: '32px' }}>
        <h4 className="traits-title" style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Chọn Nhanh (Preset)
        </h4>
        <div className="card-grid-wizard" style={{ gap: '12px' }}>
          {presets.map(p => (
            <button
              key={p.id}
              className="wizard-card wizard-card--sm"
              onClick={() => updateChar(p.data)}
              title="Nhấn để áp dụng thiết lập này"
            >
              <span className="wizard-card-title">{p.label}</span>
              <span className="wizard-card-desc">{p.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">{nameLabel}</label>
        <input
          className="field-input field-input--center"
          value={char.name}
          onChange={e => updateChar({ name: e.target.value })}
          placeholder={namePlaceholder}
          maxLength={200}
        />
      </div>
      <div className="field-group">
        <label className="field-label">{titleLabel}</label>
        <input
          className="field-input field-input--center"
          value={char.title}
          onChange={e => updateChar({ title: e.target.value })}
          placeholder={titlePlaceholder}
          maxLength={200}
        />
      </div>
      {path !== 'creator' && (
        <div className="field-group">
          <label className="field-label">Tuổi {path === 'god' ? '(Kỷ nguyên tồn tại)' : ''}</label>
          <input
            className="field-input field-input--center"
            type="number"
            value={char.age ?? ''}
            onChange={e => updateChar({ age: e.target.value ? Number(e.target.value) : null })}
            placeholder={path === 'god' ? 'Ví dụ: 3000' : 'Ví dụ: 25'}
          />
        </div>
      )}
      {path === 'god' && (
        <div className="field-group">
          <label className="field-label">Miền Quyền Năng</label>
          <input
            className="field-input field-input--center"
            value={char.divineRealm}
            onChange={e => updateChar({ divineRealm: e.target.value })}
            placeholder="Ví dụ: Lửa và Rèn Đúc, Biển Cả và Bão Tố, Đêm Tối,..."
          />
        </div>
      )}
      <div className="field-group">
        <label className="field-label">Ngoại Hình (Tùy chọn)</label>
        <textarea
          className="field-textarea"
          value={char.appearance}
          onChange={e => updateChar({ appearance: e.target.value })}
          placeholder={path === 'creator'
            ? 'Mô tả hình dạng/biểu hiện của ngươi khi hiện thân (hoặc để trống nếu ngươi là thực thể vô hình)'
            : path === 'god'
            ? 'Mô tả ngoại hình thần thánh: áo choàng vàng ròng, đôi mắt cháy lửa, vầng hào quang...'
            : 'Mô tả ngoại hình: cao gầy, mắt sắc bén, vết sẹo trên mặt,...'}
          rows={3}
        />
      </div>
    </div>
  );
};

// ── COSMIC DOMAIN (Creator only) ──
const CosmicDomainStep: React.FC<StepCtx> = ({ char, updateChar }) => {
  const domains = CREATOR_DOMAINS;

  return (
    <div className="step-fields">
      <div className="card-grid-wizard">
        {domains.map(d => (
          <button
            key={d.id}
            className={`wizard-card ${char.cosmicDomain === d.id ? 'wizard-card--selected' : ''}`}
            onClick={() => updateChar({ cosmicDomain: d.id })}
          >
            <span className="wizard-card-title">{d.name}</span>
            <span className="wizard-card-desc">{d.description}</span>
            {d.effects && <span className="wizard-card-effects">Hiệu ứng: {d.effects}</span>}
          </button>
        ))}
      </div>
      {char.cosmicDomain === 'custom' && (
        <div className="field-group">
          <label className="field-label">Mô tả miền khởi nguyên</label>
          <textarea
            className="field-textarea"
            value={char.backstory}
            onChange={e => updateChar({ backstory: e.target.value })}
            placeholder="Mô tả chi tiết miền khởi nguyên ngươi muốn sáng tạo từ..."
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

// ── ORIGIN (Mortal only) ──
const OriginStep: React.FC<StepCtx> = ({ char, updateChar }) => {
  const classes = MORTAL_CLASSES;

  return (
    <div className="step-fields">
      <div className="card-grid-wizard">
        {classes.map(c => (
          <button
            key={c.id}
            className={`wizard-card ${char.mortalClass === c.id ? 'wizard-card--selected' : ''}`}
            onClick={() => updateChar({ mortalClass: c.id })}
          >
            <span className="wizard-card-title">{c.name}</span>
            <span className="wizard-card-desc">{c.desc}</span>
          </button>
        ))}
      </div>
      {char.mortalClass === 'custom' && (
        <div className="field-group">
          <input
            className="field-input"
            value={char.mortalOrigin}
            onChange={e => updateChar({ mortalOrigin: e.target.value })}
            placeholder="Nhập xuất thân tùy chỉnh..."
          />
        </div>
      )}
    </div>
  );
};

// ── ERA & REGION ──
const EraStep: React.FC<StepCtx> = ({ path, char, updateChar }) => (
  <div className="step-fields">
    <div className="field-group">
      <label className="field-label">Tên Kỷ Nguyên / Thời Đại</label>
      <input
        className="field-input field-input--center"
        value={char.era}
        onChange={e => updateChar({ era: e.target.value })}
        placeholder="Ví dụ: Kỷ Nguyên Hỗn Mang, Thượng Cổ, Trung Thế Kỷ..."
      />
    </div>
    <div className="field-group">
      <label className="field-label">Mô tả thời đại (Tùy chọn)</label>
      <textarea
        className="field-textarea"
        value={char.eraDescription}
        onChange={e => updateChar({ eraDescription: e.target.value })}
        placeholder="Mô tả ngắn về bối cảnh thời đại, chiến tranh, hòa bình,..."
        rows={3}
      />
    </div>
    {path !== 'creator' && (
      <div className="field-group">
        <label className="field-label">Khu Vực Hiện Tại</label>
        <input
          className="field-input field-input--center"
          value={char.region}
          onChange={e => updateChar({ region: e.target.value })}
          placeholder="Ví dụ: Núi Côn Luân, Thành Valhalla, Rừng cấm phía Bắc..."
        />
      </div>
    )}
  </div>
);

// ── FACTION ──
const FactionStep: React.FC<StepCtx> = ({ path, char, updateChar }) => {
  const factionLabel = path === 'god' ? 'Thần Hệ Trực Thuộc' : 'Phe Phái Trực Thuộc';
  return (
    <div className="step-fields">
      <div className="field-group">
        <label className="field-label">{factionLabel} (Tùy chọn)</label>
        <input
          className="field-input field-input--center"
          value={char.faction}
          onChange={e => updateChar({ faction: e.target.value })}
          placeholder={path === 'god'
            ? 'Ví dụ: Olympus, Thiên Đình, Asgard... hoặc tự lập'
            : 'Ví dụ: Phiến quân phương Bắc, Giáo phái Hắc Long...'}
        />
      </div>
      {path === 'god' && (
        <div className="field-group">
          <label className="field-label">Tên Thần Hệ Tự Tạo (nếu tự lập)</label>
          <input
            className="field-input field-input--center"
            value={char.pantheonName}
            onChange={e => updateChar({ pantheonName: e.target.value })}
            placeholder="Ví dụ: Liên Minh Cổ Thần Viễn Đông"
          />
        </div>
      )}
      <div className="field-group">
        <label className="field-label">Bối Cảnh Bổ Sung (Tùy chọn)</label>
        <textarea
          className="field-textarea"
          value={char.backstory}
          onChange={e => updateChar({ backstory: e.target.value })}
          placeholder="Mô tả thêm về quan hệ, mục tiêu cá nhân, thiết lập đặc biệt..."
          rows={3}
        />
      </div>
    </div>
  );
};

// ── ATTRIBUTES + TRAITS ──
const AttributesStep: React.FC<StepCtx> = ({ path, char, updateAttr, attributes, traits, toggleTrait, updateChar }) => {
  // Đối với Creator, tạo UI Cán cân vũ trụ
  const renderCreatorScales = () => {
    const pairs = [
      { left: 'order', right: 'chaos', leftName: 'Trật Tự', rightName: 'Hỗn Mang' },
      { left: 'creation', right: 'destruction', leftName: 'Sáng Tạo', rightName: 'Hủy Diệt' },
      { left: 'wisdom', right: 'empathy', leftName: 'Toàn Tri', rightName: 'Từ Bi' },
    ];
    return (
      <div className="cosmic-scales">
        {pairs.map(p => {
          const lVal = char.attributes[p.left] ?? 0;
          const rVal = char.attributes[p.right] ?? 0;
          const balance = lVal - rVal; // >0 means leaning left, <0 means leaning right
          
          return (
            <div key={p.left} className="cosmic-scale-row">
              <div className="cosmic-scale-header">
                <span className="scale-label left-label">{p.leftName} ({lVal})</span>
                <span className="scale-value">{balance === 0 ? 'Cân bằng' : balance > 0 ? `Lệch ${p.leftName}` : `Lệch ${p.rightName}`}</span>
                <span className="scale-label right-label">{p.rightName} ({rVal})</span>
              </div>
              <div className="cosmic-scale-controls">
                <input
                  type="range"
                  min="-100" max="100"
                  value={balance}
                  onChange={e => {
                    const v = Number(e.target.value);
                    if (v >= 0) {
                      updateAttr(p.left, v);
                      updateAttr(p.right, 0);
                    } else {
                      updateAttr(p.left, 0);
                      updateAttr(p.right, Math.abs(v));
                    }
                  }}
                  className="scale-slider"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="step-fields">
      <div className="attr-list">
        {path === 'creator' && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 className="traits-title" style={{ marginBottom: '1rem' }}>Cán Cân Vũ Trụ (Chỉnh Nhanh)</h4>
            {renderCreatorScales()}
            <h4 className="traits-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Chỉ Số Tự Do (Chỉnh Chi Tiết)</h4>
          </div>
        )}
        
        {attributes.map(a => (
          <div key={a.key} className="attr-row">
            <div className="attr-row-header">
              <span className="attr-name">{a.name}</span>
              <input
                className="attr-number"
                type="number"
                min={a.min}
                max={a.max}
                value={char.attributes[a.key] ?? a.default}
                onChange={e => updateAttr(a.key, Math.min(a.max, Math.max(a.min, Number(e.target.value))))}
              />
            </div>
            <p className="attr-desc">{a.description}</p>
            <input
              className="attr-slider"
              type="range"
              min={a.min}
              max={a.max}
              value={char.attributes[a.key] ?? a.default}
              onChange={e => updateAttr(a.key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="traits-section">
        <h4 className="traits-title">Bẩm Phú Đặc Biệt (chọn nhiều)</h4>
        <div className="trait-grid">
          {traits.map(t => (
            <button
              key={t.id}
              className={`wizard-card wizard-card--sm ${char.traits.includes(t.id) ? 'wizard-card--selected' : ''}`}
              onClick={() => toggleTrait(t.id)}
            >
              <span className="wizard-card-title">{t.name}</span>
              <span className="wizard-card-desc">{t.description}</span>
              <span className="wizard-card-effect">{t.effects}</span>
            </button>
          ))}
        </div>
        <div className="field-group">
          <label className="field-label">Bẩm phú tùy chỉnh (Tùy chọn)</label>
          <input
            className="field-input"
            value={char.customTraits}
            onChange={e => updateChar({ customTraits: e.target.value })}
            placeholder="Ví dụ: Thiên sinh tàn tật (Thể Chất -50)"
          />
        </div>
      </div>
    </div>
  );
};

// ── COSMOS (Creator only) ──
const CosmosStep: React.FC<StepCtx> = ({ char, updateChar }) => (
  <div className="step-fields">
    <div className="field-group">
      <label className="field-label">Tên Thần Hệ / Hệ Thống</label>
      <input
        className="field-input field-input--center"
        value={char.pantheonName}
        onChange={e => updateChar({ pantheonName: e.target.value })}
        placeholder="Ví dụ: Cửu Thiên Thần Hệ, Hỗn Nguyên Vũ Trụ..."
      />
    </div>
    <div className="field-group">
      <label className="field-label">Quy Luật Vũ Trụ (Tùy chọn)</label>
      <textarea
        className="field-textarea"
        value={char.cosmicRules}
        onChange={e => updateChar({ cosmicRules: e.target.value })}
        placeholder="Mô tả quy luật ngươi muốn áp dụng: trọng lực, phép thuật, sinh tử, thời gian, nhân quả... Hoặc để trống để AI sáng tạo."
        rows={4}
      />
    </div>
    <div className="field-group">
      <label className="field-label">Bối Cảnh Bổ Sung (Tùy chọn)</label>
      <textarea
        className="field-textarea"
        value={char.backstory}
        onChange={e => updateChar({ backstory: e.target.value })}
        placeholder="Mô tả thêm về vũ trụ ngươi muốn tạo: bao nhiêu cõi, kiểu sinh vật, hệ thống phép thuật..."
        rows={4}
      />
    </div>
  </div>
);

// ── REPUTATION ──
const ReputationStep: React.FC<StepCtx> = ({ char, updateChar, reputations }) => (
  <div className="step-fields">
    <div className="card-grid-wizard">
      {reputations.map(r => (
        <button
          key={r.id}
          className={`wizard-card ${char.reputation === r.id ? 'wizard-card--selected' : ''}`}
          onClick={() => updateChar({ reputation: r.id })}
        >
          <span className="wizard-card-title">{r.name}</span>
          <span className="wizard-card-desc">{r.description}</span>
        </button>
      ))}
    </div>
  </div>
);

// ── CRISIS ──
const CrisisStep: React.FC<StepCtx> = ({ char, updateChar, crises, customCrisis, setCustomCrisis }) => (
  <div className="step-fields">
    <div className="card-grid-wizard card-grid-wizard--single">
      {crises.map(c => (
        <button
          key={c.id}
          className={`wizard-card wizard-card--wide ${char.crisis === c.id ? 'wizard-card--selected' : ''}`}
          onClick={() => updateChar({ crisis: c.id })}
        >
          <span className="wizard-card-title">{c.name}</span>
          <span className="wizard-card-desc">{c.description}</span>
        </button>
      ))}
    </div>
    {char.crisis === 'custom' && (
      <div className="field-group">
        <textarea
          className="field-textarea"
          value={customCrisis}
          onChange={e => setCustomCrisis(e.target.value)}
          placeholder="Mô tả chi tiết khủng hoảng / khốn cảnh ngươi đang đối mặt, càng cụ thể càng tốt..."
          rows={4}
        />
      </div>
    )}
  </div>
);

// ── FOLLOWERS (God / Creator) ──
const FollowersStep: React.FC<StepCtx> = ({ path, char, updateChar, updateFollowerAttr }) => {
  const fAttrs = [
    { key: 'power', name: 'Quyền Năng', min: 0, max: 100, default: 50 },
    { key: 'loyalty', name: 'Trung Thành', min: 0, max: 100, default: 80 },
    { key: 'wisdom', name: 'Trí Tuệ', min: 0, max: 100, default: 50 },
  ];
  return (
    <div className="step-fields">
      <div className="field-group">
        <label className="field-label">
          {path === 'creator' ? 'Tạo Vật Đầu Tiên (Tùy chọn)' : 'Thiên Sứ / Thủ Lĩnh Tín Đồ (Tùy chọn)'}
        </label>
        <input
          className="field-input field-input--center"
          value={char.followerName}
          onChange={e => updateChar({ followerName: e.target.value })}
          placeholder={path === 'creator' ? 'Tên của sứ giả hoặc thực thể đầu tiên' : 'Tên thiên sứ hoặc thủ lĩnh giáo đoàn'}
        />
      </div>
      {char.followerName && (
        <>
          <div className="field-group">
            <label className="field-label">Mô tả (Tùy chọn)</label>
            <textarea
              className="field-textarea"
              value={char.followerDesc}
              onChange={e => updateChar({ followerDesc: e.target.value })}
              placeholder={path === 'creator' ? 'Thực thể này đại diện cho quy luật gì, mang sứ mệnh gì...' : 'Người này từng là..., sở hữu khả năng..., trung thành vì...'}
              rows={3}
            />
          </div>
          
          <div className="attr-list" style={{ marginTop: '1.5rem' }}>
            <h4 className="field-label" style={{ marginBottom: '1rem' }}>Chỉ Số {path === 'creator' ? 'Tạo Vật' : 'Thiên Sứ'}</h4>
            {fAttrs.map(a => {
              const val = char.followerAttributes?.[a.key] ?? a.default;
              return (
                <div key={a.key} className="attr-row">
                  <div className="attr-row-header">
                    <span className="attr-name">{a.name}</span>
                    <input
                      className="attr-number"
                      type="number"
                      min={a.min}
                      max={a.max}
                      value={val}
                      onChange={e => updateFollowerAttr(a.key, Math.min(a.max, Math.max(a.min, Number(e.target.value))))}
                    />
                  </div>
                  <input
                    className="attr-slider"
                    type="range"
                    min={a.min}
                    max={a.max}
                    value={val}
                    onChange={e => updateFollowerAttr(a.key, Number(e.target.value))}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── COMPANION (Mortal) ──
const CompanionStep: React.FC<StepCtx> = ({ char, updateChar, updateFollowerAttr }) => {
  const cAttrs = [
    { key: 'loyalty', name: 'Độ Tín Nhiệm', min: 0, max: 100, default: 80 },
    { key: 'combat', name: 'Chiến Đấu', min: 0, max: 100, default: 50 },
    { key: 'utility', name: 'Đa Dụng', min: 0, max: 100, default: 50 },
  ];
  return (
    <div className="step-fields">
      <p className="step-note">Trong loạn thế, một cây làm chẳng nên non. Ngươi có một đồng hành tâm phúc không?</p>
      <div className="field-group">
        <label className="field-label">Tên Đồng Hành (Để trống nếu đơn thân)</label>
        <input
          className="field-input field-input--center"
          value={char.followerName}
          onChange={e => updateChar({ followerName: e.target.value })}
          placeholder="Ví dụ: Trần Hổ"
        />
      </div>
      {char.followerName && (
        <>
          <div className="field-group">
            <label className="field-label">Bối cảnh đồng hành</label>
            <textarea
              className="field-textarea"
              value={char.followerDesc}
              onChange={e => updateChar({ followerDesc: e.target.value })}
              placeholder="Mối quan hệ, khả năng, bối cảnh... Ví dụ: Bạn thanh mai trúc mã, giỏi cung thuật..."
              rows={3}
            />
          </div>

          <div className="attr-list" style={{ marginTop: '1.5rem' }}>
            <h4 className="field-label" style={{ marginBottom: '1rem' }}>Chỉ Số Đồng Hành</h4>
            {cAttrs.map(a => {
              const val = char.followerAttributes?.[a.key] ?? a.default;
              return (
                <div key={a.key} className="attr-row">
                  <div className="attr-row-header">
                    <span className="attr-name">{a.name}</span>
                    <input
                      className="attr-number"
                      type="number"
                      min={a.min}
                      max={a.max}
                      value={val}
                      onChange={e => updateFollowerAttr(a.key, Math.min(a.max, Math.max(a.min, Number(e.target.value))))}
                    />
                  </div>
                  <input
                    className="attr-slider"
                    type="range"
                    min={a.min}
                    max={a.max}
                    value={val}
                    onChange={e => updateFollowerAttr(a.key, Number(e.target.value))}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── PREVIEW ──
const PreviewStep: React.FC<StepCtx> = ({ path, char, traits: traitDefs, attributes, reputations, crises }) => {
  const pathName = path === 'creator' ? 'Sáng Thế Thần' : path === 'god' ? 'Thần' : 'Phàm Nhân';
  const repName = reputations.find(r => r.id === char.reputation)?.name || 'Chưa chọn';
  const crisisName = crises.find(c => c.id === char.crisis)?.name || char.crisis || 'Chưa chọn';
  // Preview chạy TRƯỚC handleConfirm nên các trường này vẫn là id — map để hiển thị
  const mortalClassName = MORTAL_CLASSES.find(c => c.id === char.mortalClass)?.name || char.mortalClass;
  const cosmicDomainName = CREATOR_DOMAINS.find(d => d.id === char.cosmicDomain)?.name || char.cosmicDomain;

  return (
    <div className="step-fields preview-fields">
      <div className="preview-box">
        <div className="preview-row">
          <span className="preview-label">Con Đường</span>
          <span className="preview-value preview-value--accent">{pathName}</span>
        </div>
        <div className="preview-row">
          <span className="preview-label">{path === 'creator' ? 'Danh Xưng' : 'Tên'}</span>
          <span className="preview-value">{char.name || '---'}</span>
        </div>
        {char.title && (
          <div className="preview-row">
            <span className="preview-label">Danh Hiệu</span>
            <span className="preview-value">{char.title}</span>
          </div>
        )}
        {char.age && (
          <div className="preview-row">
            <span className="preview-label">Tuổi</span>
            <span className="preview-value">{char.age}</span>
          </div>
        )}
        {char.divineRealm && (
          <div className="preview-row">
            <span className="preview-label">Miền Quyền Năng</span>
            <span className="preview-value">{char.divineRealm}</span>
          </div>
        )}
        {char.cosmicDomain && (
          <div className="preview-row">
            <span className="preview-label">Miền Sáng Tạo</span>
            <span className="preview-value">{cosmicDomainName}</span>
          </div>
        )}
        {char.mortalClass && (
          <div className="preview-row">
            <span className="preview-label">Giai Cấp</span>
            <span className="preview-value">{mortalClassName}</span>
          </div>
        )}
        {char.era && (
          <div className="preview-row">
            <span className="preview-label">Kỷ Nguyên</span>
            <span className="preview-value">{char.era}</span>
          </div>
        )}
        {char.region && (
          <div className="preview-row">
            <span className="preview-label">Khu Vực</span>
            <span className="preview-value">{char.region}</span>
          </div>
        )}
        {char.faction && (
          <div className="preview-row">
            <span className="preview-label">{path === 'god' ? 'Thần Hệ' : 'Phe Phái'}</span>
            <span className="preview-value">{char.faction}</span>
          </div>
        )}
      </div>

      <div className="preview-box">
        <h4 className="preview-section-title">Thuộc Tính</h4>
        {attributes.map(a => (
          <div key={a.key} className="preview-attr">
            <span className="preview-label">{a.name}</span>
            <div className="preview-bar">
              <div
                className="preview-bar-fill"
                style={{
                  width: `${((char.attributes[a.key] ?? 0) + 100) / 2}%`,
                  background: (char.attributes[a.key] ?? 0) >= 0 ? 'var(--wizard-accent)' : '#a0555a',
                }}
              />
            </div>
            <span className="preview-attr-val">{char.attributes[a.key] ?? 0}</span>
          </div>
        ))}
      </div>

      {char.traits.length > 0 && (
        <div className="preview-box">
          <h4 className="preview-section-title">Bẩm Phú</h4>
          <div className="preview-traits">
            {char.traits.map(id => {
              const t = traitDefs.find(x => x.id === id);
              return t ? <span key={id} className="preview-trait-badge">{t.name}</span> : null;
            })}
          </div>
        </div>
      )}

      <div className="preview-box">
        <div className="preview-row">
          <span className="preview-label">Danh Tiếng</span>
          <span className="preview-value">{repName}</span>
        </div>
        <div className="preview-row">
          <span className="preview-label">Khủng Hoảng</span>
          <span className="preview-value">{crisisName}</span>
        </div>
      </div>
    </div>
  );
};

export default CreationWizard;
