import React from 'react';
import { useChatStore, type ViewId } from '@/stores/chatStore';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ConnectionPanel } from '@/components/settings/ConnectionPanel';
import { GameSettings } from '@/components/settings/GameSettings';
import { LorebookPanel } from '@/components/lorebook/LorebookPanel';
import { StatusPanel } from '@/components/game/StatusPanel';
import { WorldView } from '@/components/game/WorldView';
import { PowersView } from '@/components/game/PowersView';
import { RelationsView } from '@/components/game/RelationsView';
import { CodexView } from '@/components/game/CodexView';
import { CreationStudio } from '@/components/studio/CreationStudio';
import { CultivationAbode } from '@/components/studio/CultivationAbode';
import { DivineSanctum } from '@/components/studio/DivineSanctum';
import { seasonLabel } from '@/engine/mvu/timeEngine';
import {
  ChatIcon, MapIcon, TempleIcon, SwordIcon, CrownIcon,
  ScrollIcon, SettingsIcon, DivinePowerIcon, CalendarIcon,
  MenuIcon, CloseIcon, FollowersIcon, ShieldIcon, HomeIcon,
} from '@/ui/icons';
import './GameLayout.css';

interface GameLayoutProps {
  onBackToTitle: () => void;
}

interface NavItem {
  id: ViewId;
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
}

/** Biểu tượng Xưởng Sáng Thế (nguyên tử / quỹ đạo) */
const GenesisIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
    <circle cx="12" cy="12" r="2.4" fill={color} stroke="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(120 12 12)" />
  </svg>
);

function getNavItems(path: string | null): NavItem[] {
  switch (path) {
    case 'creator':
      return [
        { id: 'chat', icon: ChatIcon, label: 'Sáng Tạo' },
        { id: 'studio', icon: GenesisIcon, label: 'Sáng Thế' },
        { id: 'world', icon: MapIcon, label: 'Vũ Trụ' },
        { id: 'status_full', icon: DivinePowerIcon, label: 'Quyền Năng' },
        { id: 'powers', icon: TempleIcon, label: 'Tạo Vật' },
        { id: 'codex', icon: ScrollIcon, label: 'Sử Ký' },
      ];
    case 'god':
      return [
        { id: 'chat', icon: ChatIcon, label: 'Phàm Giới' },
        { id: 'studio', icon: GenesisIcon, label: 'Thần Điện' },
        { id: 'world', icon: TempleIcon, label: 'Đền Thờ' },
        { id: 'status_full', icon: DivinePowerIcon, label: 'Thần Lực' },
        { id: 'relations', icon: CrownIcon, label: 'Thần Hệ' },
        { id: 'powers', icon: SwordIcon, label: 'Phép Thuật' },
        { id: 'codex', icon: ScrollIcon, label: 'Kinh Điển' },
      ];
    case 'mortal':
      return [
        { id: 'chat', icon: ChatIcon, label: 'Hành Trình' },
        { id: 'studio', icon: GenesisIcon, label: 'Động Phủ' },
        { id: 'world', icon: MapIcon, label: 'Thế Giới' },
        { id: 'status_full', icon: ShieldIcon, label: 'Bản Thân' },
        { id: 'relations', icon: FollowersIcon, label: 'Quan Hệ' },
        { id: 'powers', icon: SwordIcon, label: 'Kỹ Năng' },
        { id: 'codex', icon: ScrollIcon, label: 'Nhật Ký' },
      ];
    default:
      return [
        { id: 'chat', icon: ChatIcon, label: 'Chronicle' },
        { id: 'world', icon: MapIcon, label: 'World' },
        { id: 'codex', icon: ScrollIcon, label: 'Codex' },
      ];
  }
}

function getPathTitle(path: string | null): string {
  switch (path) {
    case 'creator': return 'Sáng Thế';
    case 'god': return 'Thần Giới';
    case 'mortal': return 'Trần Thế';
    default: return 'God Simulator';
  }
}

export const GameLayout: React.FC<GameLayoutProps> = ({ onBackToTitle }) => {
  const activeView = useChatStore(s => s.activeView);
  const setActiveView = useChatStore(s => s.setActiveView);
  const showSettings = useChatStore(s => s.showSettings);
  const setShowSettings = useChatStore(s => s.setShowSettings);
  const showStatusPanel = useChatStore(s => s.showStatusPanel);
  const setShowStatusPanel = useChatStore(s => s.setShowStatusPanel);
  const game = useChatStore(s => s.game);
  const worldTime = useChatStore(s => s.statData.world.time);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showGameSettings, setShowGameSettings] = React.useState(false);
  const [showLorebook, setShowLorebook] = React.useState(false);
  const navItems = getNavItems(game.path);
  const pathAccent = game.path === 'creator' ? 'var(--accent-primary)' :
                     game.path === 'god' ? '#d4874a' :
                     game.path === 'mortal' ? '#7b8fa8' : 'var(--accent-primary)';

  return (
    <div className="game-layout" style={{ '--path-accent': pathAccent } as React.CSSProperties}>
      {/* ── Top Bar ── */}
      <header className="topbar glass-heavy">
        <div className="topbar-left">
          <button
            className="btn btn-icon topbar-menu-btn"
            onClick={onBackToTitle}
            title="Thoát ra ngoài"
            aria-label="Home"
          >
            <HomeIcon size={18} />
          </button>
          <button
            className="btn btn-icon topbar-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
          <div className="topbar-identity">
            <DivinePowerIcon size={18} color={pathAccent} />
            <span className="topbar-god-name">
              {game.godName || getPathTitle(game.path)}
            </span>
            {game.path && (
              <span className="badge badge-gold topbar-pantheon" style={{ borderColor: pathAccent, color: pathAccent }}>
                {game.path === 'creator' ? 'Creator' :
                 game.path === 'mortal' ? 'Mortal' : 'Deity'}
              </span>
            )}
          </div>
        </div>

        <div className="topbar-center">
          <CalendarIcon size={14} color="var(--text-muted)" />
          <span className="topbar-era">
            {/* Đồng hồ in-world THẬT từ engine (world.time), kèm số lượt */}
            {`${worldTime.epochLabel ? worldTime.epochLabel + ' · ' : ''}Năm ${worldTime.year} · ${seasonLabel(worldTime)} · Ngày ${worldTime.day + 1} · Lượt ${game.turnCount}`}
          </span>
          <span className="topbar-save-dot" title="Tự động lưu" />
        </div>

        <div className="topbar-right">
          <button
            className="btn btn-icon"
            onClick={() => setShowStatusPanel(!showStatusPanel)}
            aria-label="Status"
          >
            <DivinePowerIcon size={16} color={showStatusPanel ? pathAccent : 'var(--text-muted)'} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowLorebook(true)}
            aria-label="Sổ Tri Thức"
            title="Sổ Tri Thức (Lorebook / World Info)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5C4 18.1 5.1 17 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
            </svg>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowGameSettings(true)}
            aria-label="Thiết lập trò chơi"
            title="Thiết lập trò chơi (văn phong, độ dài, độ khó)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            <SettingsIcon size={16} color={showSettings ? pathAccent : 'var(--text-muted)'} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="game-content">
        {/* Left Rail */}
        <nav className={`left-rail glass ${mobileMenuOpen ? 'left-rail--open' : ''}`}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'nav-item--active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                setMobileMenuOpen(false);
              }}
              title={item.label}
            >
              <item.icon
                size={20}
                color={activeView === item.id ? pathAccent : 'var(--text-muted)'}
              />
              <span className="nav-label" style={activeView === item.id ? { color: pathAccent } : undefined}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Center Content */}
        <main className="main-content">
          <div className="view-container" key={activeView}>
            {activeView === 'chat' && <ChatPanel />}
            {activeView === 'studio' && game.path === 'creator' && <CreationStudio />}
            {activeView === 'studio' && game.path === 'god' && <DivineSanctum />}
            {activeView === 'studio' && game.path === 'mortal' && <CultivationAbode />}
            {activeView === 'world' && <WorldView />}
            {activeView === 'status_full' && <StatusPanel fullPage />}
            {activeView === 'powers' && <PowersView />}
            {activeView === 'relations' && <RelationsView />}
            {activeView === 'codex' && <CodexView />}
          </div>
        </main>

        {/* Right Sidebar */}
        {showStatusPanel && activeView === 'chat' && (
          <aside className="status-sidebar glass animate-fadeIn">
            <StatusPanel />
          </aside>
        )}
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav glass-heavy">
        {navItems.slice(0, 5).map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeView === item.id ? 'bottom-nav-item--active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon
              size={18}
              color={activeView === item.id ? pathAccent : 'var(--text-muted)'}
            />
            <span className="bottom-nav-label" style={activeView === item.id ? { color: pathAccent } : undefined}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <ConnectionPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {/* Game Settings Modal */}
      {showGameSettings && (
        <div className="modal-overlay" onClick={() => setShowGameSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <GameSettings onClose={() => setShowGameSettings(false)} />
          </div>
        </div>
      )}

      {/* Lorebook Modal */}
      {showLorebook && (
        <div className="modal-overlay" onClick={() => setShowLorebook(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <LorebookPanel onClose={() => setShowLorebook(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLayout;
