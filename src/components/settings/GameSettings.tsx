import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { CloseIcon } from '@/ui/icons';
import './ConnectionPanel.css';

/* ═══════════════════════════════════════════════════════
   THIẾT LẬP TRÒ CHƠI — điều khiển phong cách kể của AI.
   Mọi lựa chọn được nhồi thẳng vào prompt mỗi lượt.
   ═══════════════════════════════════════════════════════ */

const STYLE = [
  ['epic', 'Sử thi — hùng tráng'],
  ['dark', 'U ám — bi tráng'],
  ['romantic', 'Lãng mạn — giàu cảm xúc'],
  ['humorous', 'Hài hước — dí dỏm'],
  ['gritty', 'Trần trụi — khốc liệt'],
  ['poetic', 'Thi vị — bay bổng'],
] as const;
const LENGTH = [
  ['short', 'Ngắn gọn (2-3 đoạn)'],
  ['medium', 'Vừa phải (3-5 đoạn)'],
  ['long', 'Dài & chi tiết (5+ đoạn)'],
] as const;
const PACING = [
  ['slow', 'Chậm rãi — đào sâu'],
  ['normal', 'Cân bằng'],
  ['fast', 'Nhanh — dồn dập'],
] as const;
const DIFF = [
  ['easy', 'Dễ — ưu ái người chơi'],
  ['balanced', 'Cân bằng — có rủi ro'],
  ['realistic', 'Thực tế — khắc nghiệt'],
] as const;
const MODE = [
  ['freeform', 'Tự do — không ép lựa chọn'],
  ['guided', 'Dẫn dắt — gợi ý lựa chọn'],
] as const;
const MATURITY = [
  ['safe', 'An toàn'],
  ['mature', 'Người lớn'],
] as const;

export const GameSettings: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const settings = useChatStore(s => s.statData.settings);
  const updateSettings = useChatStore(s => s.updateSettings);

  return (
    <div className="conn-panel glass-heavy animate-fadeIn" style={{ maxWidth: 480 }}>
      <div className="conn-header">
        <div className="conn-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
          </svg>
          <h3>Thiết Lập Trò Chơi</h3>
        </div>
        {onClose && (
          <button className="btn btn-icon" onClick={onClose} aria-label="Đóng">
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      <div className="conn-body">
        <div className="conn-section">
          <div className="input-group">
            <label className="input-label">Văn phong kể chuyện</label>
            <select className="input" value={settings.narrativeStyle}
              onChange={e => updateSettings({ narrativeStyle: e.target.value as typeof settings.narrativeStyle })}>
              {STYLE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Độ dài phản hồi</label>
            <select className="input" value={settings.responseLength}
              onChange={e => updateSettings({ responseLength: e.target.value as typeof settings.responseLength })}>
              {LENGTH.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Nhịp truyện</label>
            <select className="input" value={settings.pacing}
              onChange={e => updateSettings({ pacing: e.target.value as typeof settings.pacing })}>
              {PACING.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Độ khó & hệ quả</label>
            <select className="input" value={settings.difficulty}
              onChange={e => updateSettings({ difficulty: e.target.value as typeof settings.difficulty })}>
              {DIFF.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Chế độ dẫn dắt</label>
            <select className="input" value={settings.narrativeMode}
              onChange={e => updateSettings({ narrativeMode: e.target.value as typeof settings.narrativeMode })}>
              {MODE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Mức nội dung</label>
            <select className="input" value={settings.maturity}
              onChange={e => updateSettings({ maturity: e.target.value as typeof settings.maturity })}>
              {MATURITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)' }}>
            Các thiết lập này được đưa thẳng vào lời nhắc AI mỗi lượt để đổi văn phong, độ dài, nhịp và độ khó — có hiệu lực ngay ở lượt kế tiếp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
