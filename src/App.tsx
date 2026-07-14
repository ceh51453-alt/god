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
    // Reset statData + đưa view về chat (view cũ có thể là studio của save khác)
    useChatStore.setState({ statData: StatDataSchema.parse({}), activeView: 'chat' });
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

    // Khởi tạo MVU state NGAY tại đây (không đợi ChatPanel mount — người chơi
    // có thể đang ở view khác) + đảm bảo vào thẳng màn chat.
    // Lưu ý: hồ sơ nhân vật được promptBuilder nhồi vào prompt mỗi lượt,
    // KHÔNG cần system message trong lịch sử (buildPrompt lọc bỏ role system).
    useChatStore.getState().initStatData(char, char.path);
    useChatStore.getState().setActiveView('chat');

    setHasSaveData(true);
    transitionTo('game');
  }, [setGame, transitionTo, setActiveSlot]);

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

export default App;
