import React, { useState, useCallback, useEffect } from 'react';
import { TitleScreen } from '@/components/title/TitleScreen';
import { PathSelection } from '@/components/title/PathSelection';
import { CreationWizard } from '@/components/creation/CreationWizard';
import { type CharacterData, type GamePath } from '@/components/creation/creationData';
import { defaultCharacter } from '@/components/creation/creationData';
import { GameLayout } from '@/components/layout/GameLayout';
import { ConnectionPanel } from '@/components/settings/ConnectionPanel';
import { SaveSelector } from '@/components/title/SaveSelector';
import { useChatStore } from '@/stores/chatStore';
import { listSaves, createSlot, getActiveSlotId, migrateLegacySave } from '@/stores/saveManager';
import { StatDataSchema } from '@/engine/mvu/schema';
import './styles/global.css';

type AppScreen = 'title' | 'path_select' | 'creation' | 'game';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('title');
  const [selectedPath, setSelectedPath] = useState<GamePath>('creator');
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
  const [showSaveSelector, setShowSaveSelector] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const setGame = useChatStore(s => s.setGame);
  const addMessage = useChatStore(s => s.addMessage);
  const loadFromStorage = useChatStore(s => s.loadFromStorage);
  const clearMessages = useChatStore(s => s.clearMessages);
  const setActiveSlot = useChatStore(s => s.setActiveSlot);

  // Check for any saved games
  const [hasSaveData, setHasSaveData] = useState(() => {
    migrateLegacySave(); // migrate legacy save on first render
    return listSaves().length > 0;
  });

  // Smooth transition helper
  const transitionTo = useCallback((target: AppScreen) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(target);
      setTransitioning(false);
    }, 300);
  }, []);

  // ── Auto-restore active slot on mount (F5 / reload) ──
  useEffect(() => {
    const activeId = getActiveSlotId();
    if (activeId) {
      const loaded = loadFromStorage(activeId);
      if (loaded) {
        setScreen('game');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewGame = useCallback(() => {
    // Reset in-memory state for new game without deleting existing saves
    clearMessages();
    setGame({
      path: null,
      godName: '',
      gameStarted: false,
      turnCount: 0,
      character: { ...defaultCharacter },
    });
    setActiveSlot(null);
    useChatStore.setState({ statData: StatDataSchema.parse({}) });
    transitionTo('path_select');
  }, [transitionTo, clearMessages, setGame, setActiveSlot]);

  const handleContinue = useCallback(() => {
    const saves = listSaves();
    if (saves.length === 1) {
      // Single save — load directly
      const loaded = loadFromStorage(saves[0].slotId);
      if (loaded) transitionTo('game');
    } else {
      // Multiple saves — show selector
      setShowSaveSelector(true);
    }
  }, [loadFromStorage, transitionTo]);

  const handleLoadSave = useCallback((slotId: string) => {
    const loaded = loadFromStorage(slotId);
    if (loaded) {
      setShowSaveSelector(false);
      transitionTo('game');
    }
  }, [loadFromStorage, transitionTo]);

  const handleSettings = useCallback(() => {
    setShowSettingsOverlay(true);
  }, []);

  const handlePathSelect = useCallback((path: GamePath) => {
    setSelectedPath(path);
    transitionTo('creation');
  }, [transitionTo]);

  const handleCreationComplete = useCallback((char: CharacterData) => {
    // Create a new save slot
    const name = char.name || (char.path === 'creator' ? 'Sáng Thế Thần' : char.path === 'god' ? 'Thần' : 'Phàm Nhân');
    const slotId = createSlot(name, char.path);
    setActiveSlot(slotId);

    setGame({
      path: char.path,
      godName: name,
      gameStarted: true,
      character: char,
    });

    // Build rich system prompt
    const prompt = buildSystemPrompt(char);
    addMessage({ role: 'system', content: prompt });

    setHasSaveData(true);
    transitionTo('game');
  }, [setGame, addMessage, transitionTo, setActiveSlot]);

  const handleBackToTitle = useCallback(() => {
    transitionTo('title');
    // Refresh save data status
    setTimeout(() => setHasSaveData(listSaves().length > 0), 350);
  }, [transitionTo]);

  return (
    <div className={`app-root ${transitioning ? 'app-root--fading' : ''}`}>
      {screen === 'title' && (
        <TitleScreen
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onSettings={handleSettings}
          hasSaveData={hasSaveData}
        />
      )}

      {screen === 'path_select' && (
        <PathSelection
          onSelect={handlePathSelect}
          onBack={() => transitionTo('title')}
        />
      )}

      {screen === 'creation' && (
        <CreationWizard
          path={selectedPath}
          onComplete={handleCreationComplete}
          onBack={() => transitionTo('path_select')}
        />
      )}

      {screen === 'game' && (
        <GameLayout onBackToTitle={handleBackToTitle} />
      )}

      {/* Save selector overlay */}
      {showSaveSelector && (
        <SaveSelector
          onLoad={handleLoadSave}
          onClose={() => {
            setShowSaveSelector(false);
            setHasSaveData(listSaves().length > 0);
          }}
        />
      )}

      {/* Settings overlay — works from any screen */}
      {showSettingsOverlay && (
        <div className="modal-overlay" onClick={() => setShowSettingsOverlay(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <ConnectionPanel onClose={() => setShowSettingsOverlay(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Build structured system prompt from character data
   ═══════════════════════════════════════════════════════ */

function buildSystemPrompt(char: CharacterData): string {
  const pathLabels: Record<string, string> = {
    creator: 'SÁNG THẾ THẦN — Đấng Sáng Tạo Tối Thượng',
    god: 'THẦN — Một Vị Thần Trong Vạn Thần',
    mortal: 'PHÀM NHÂN — Con Người Hướng Tới Thần Tính',
  };

  const sections: string[] = [
    `[SYSTEM] Bạn là AI Game Master cho trò chơi GOD SIMULATOR.`,
    `Người chơi đã chọn con đường: ${pathLabels[char.path]}.`,
    `Khả năng là VÔ HẠN — không có giới hạn nào trong gameplay.`,
    ``,
    `=== HỒ SƠ NHÂN VẬT ===`,
    char.name ? `Tên: ${char.name}` : '',
    char.title ? `Danh hiệu: ${char.title}` : '',
    char.age ? `Tuổi: ${char.age}` : '',
    char.appearance ? `Ngoại hình: ${char.appearance}` : '',
    char.divineRealm ? `Miền quyền năng: ${char.divineRealm}` : '',
    char.cosmicDomain ? `Miền sáng tạo: ${char.cosmicDomain}` : '',
    char.mortalClass ? `Giai cấp xuất thân: ${char.mortalClass}` : '',
    char.mortalOrigin ? `Xuất thân tùy chỉnh: ${char.mortalOrigin}` : '',
    char.era ? `Kỷ nguyên: ${char.era}` : '',
    char.eraDescription ? `Bối cảnh thời đại: ${char.eraDescription}` : '',
    char.region ? `Khu vực: ${char.region}` : '',
    char.faction ? `Phe phái: ${char.faction}` : '',
    char.pantheonName ? `Thần hệ: ${char.pantheonName}` : '',
  ];

  const attrEntries = Object.entries(char.attributes);
  if (attrEntries.length > 0) {
    sections.push('', '=== THUỘC TÍNH ===');
    attrEntries.forEach(([key, val]) => sections.push(`${key}: ${val}`));
  }

  if (char.traits.length > 0) {
    sections.push('', '=== BẨM PHÚ ĐẶC BIỆT ===', char.traits.join(', '));
  }
  if (char.customTraits) sections.push(`Bẩm phú tùy chỉnh: ${char.customTraits}`);
  if (char.reputation) sections.push(`Danh tiếng: ${char.reputation}`);
  if (char.crisis) sections.push('', `=== KHỦNG HOẢNG HIỆN TẠI ===`, char.crisis);
  if (char.followerName) {
    sections.push('', `=== ĐỒNG HÀNH ===`, `Tên: ${char.followerName}`);
    if (char.followerDesc) sections.push(`Chi tiết: ${char.followerDesc}`);
  }
  if (char.cosmicRules) sections.push('', `=== QUY LUẬT VŨ TRỤ ===`, char.cosmicRules);
  if (char.backstory) sections.push('', `=== BỐI CẢNH BỔ SUNG ===`, char.backstory);

  const pathInstructions: Record<string, string> = {
    creator: `\n=== HƯỚNG DẪN AI ===\n- Viết bằng tiếng Việt, văn phong SỬ THI.\n- Bắt đầu bằng cách mô tả hư vô/khởi nguyên và hỏi người chơi muốn sáng tạo điều gì đầu tiên.\n- Người chơi có thể tạo ra BẤT CỨ THỨ GÌ: vũ trụ, thần hệ, sinh vật, quy luật.\n- Phản hồi giàu hình ảnh, như câu chuyện sáng thế vĩ đại.\n- Mọi con số do engine quản lý.`,
    god: `\n=== HƯỚNG DẪN AI ===\n- Viết bằng tiếng Việt, văn phong TRANG TRỌNG.\n- Mô tả thế giới thần thánh xung quanh và tình huống hiện tại.\n- Người chơi có tín đồ, đền thờ, quyền năng, quan hệ phức tạp.\n- Cho phép can thiệp phàm giới, liên minh/chiến tranh thần.`,
    mortal: `\n=== HƯỚNG DẪN AI ===\n- Viết bằng tiếng Việt, văn phong TIỂU THUYẾT.\n- Mô tả hoàn cảnh cụ thể và thách thức đầu tiên.\n- Người chơi là PHÀM NHÂN với tiềm năng PHONG THẦN.\n- Cho phép tu luyện, chiến đấu, mưu lược, phát triển không giới hạn.`,
  };

  sections.push(pathInstructions[char.path] || '');
  return sections.filter(Boolean).join('\n');
}

export default App;
