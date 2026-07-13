import React, { useEffect, useRef, useState } from 'react';
import { SettingsIcon } from '@/ui/icons';
import { useChatStore } from '@/stores/chatStore';
import './TitleScreen.css';

interface TitleScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  hasSaveData: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onNewGame, onContinue, onSettings, hasSaveData,
}) => {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const clearSave = useChatStore(s => s.clearSave);
  const clearMessages = useChatStore(s => s.clearMessages);
  const setGame = useChatStore(s => s.setGame);
  const savedName = useChatStore(s => s.game.godName);
  const savedPath = useChatStore(s => s.game.path);

  const handleNewGame = () => {
    if (hasSaveData) {
      setShowConfirm(true);
    } else {
      onNewGame();
    }
  };

  const confirmNewGame = () => {
    clearSave();
    clearMessages();
    setGame({ gameStarted: false, path: null, godName: '', turnCount: 0 });
    setShowConfirm(false);
    onNewGame();
  };
  const audioRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  // Ambient music generator using Web Audio API
  const startAmbientMusic = () => {
    if (audioRef.current) return;

    const ctx = new AudioContext();
    audioRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Ethereal pad: layered detuned oscillators
    const frequencies = [110, 146.83, 164.81, 220, 293.66, 329.63];
    const detunes = [-8, 5, -3, 7, -5, 3];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detunes[i];

      // Slow LFO for volume modulation (breathing effect)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + Math.random() * 0.08;
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      oscGain.gain.value = 0.12 + Math.random() * 0.08;
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      nodesRef.current.push(osc, lfo);
    });

    // Deep sub-bass drone
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.value = 55;
    subGain.gain.value = 0.15;
    sub.connect(subGain);
    subGain.connect(masterGain);
    sub.start();
    nodesRef.current.push(sub);

    // Shimmer: high frequency whisper
    const shimmer = ctx.createOscillator();
    const shimGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880;
    shimGain.gain.value = 0.02;
    const shimLfo = ctx.createOscillator();
    const shimLfoGain = ctx.createGain();
    shimLfo.type = 'sine';
    shimLfo.frequency.value = 0.15;
    shimLfoGain.gain.value = 0.015;
    shimLfo.connect(shimLfoGain);
    shimLfoGain.connect(shimGain.gain);
    shimLfo.start();
    shimmer.connect(shimGain);
    shimGain.connect(masterGain);
    shimmer.start();
    nodesRef.current.push(shimmer, shimLfo);

    setMusicPlaying(true);
  };

  const stopMusic = () => {
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    audioRef.current?.close();
    audioRef.current = null;
    gainRef.current = null;
    setMusicPlaying(false);
  };

  const toggleMusic = () => {
    if (musicPlaying) {
      stopMusic();
    } else {
      startAmbientMusic();
    }
  };

  useEffect(() => {
    // Staggered entrance animation
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => {
      clearTimeout(timer);
      stopMusic();
    };
  }, []);

  return (
    <div className="title-screen">
      {/* Animated cosmic background */}
      <div className="title-bg">
        <div className="title-stars" />
        <div className="title-nebula title-nebula--1" />
        <div className="title-nebula title-nebula--2" />
        <div className="title-nebula title-nebula--3" />
        <div className="title-vignette" />

        {/* Divine figure silhouette */}
        <div className="title-figure">
          <svg width="200" height="320" viewBox="0 0 200 320" fill="none" className="title-figure-svg">
            {/* Light rays */}
            <g opacity="0.3" className="title-rays">
              <line x1="100" y1="80" x2="20" y2="0" stroke="url(#rayGrad)" strokeWidth="1" />
              <line x1="100" y1="80" x2="60" y2="0" stroke="url(#rayGrad)" strokeWidth="0.8" />
              <line x1="100" y1="80" x2="140" y2="0" stroke="url(#rayGrad)" strokeWidth="0.8" />
              <line x1="100" y1="80" x2="180" y2="0" stroke="url(#rayGrad)" strokeWidth="1" />
              <line x1="100" y1="80" x2="0" y2="40" stroke="url(#rayGrad)" strokeWidth="0.6" />
              <line x1="100" y1="80" x2="200" y2="40" stroke="url(#rayGrad)" strokeWidth="0.6" />
            </g>
            {/* Figure */}
            <g opacity="0.85">
              {/* Head */}
              <circle cx="100" cy="85" r="12" fill="#c9a84c" opacity="0.6" />
              <circle cx="100" cy="85" r="8" fill="#e8d4a0" opacity="0.4" />
              {/* Body */}
              <path d="M100 97 L92 140 L80 180 L85 180 L95 150 L100 170 L105 150 L115 180 L120 180 L108 140 Z" fill="#c9a84c" opacity="0.5" />
              {/* Arms outstretched */}
              <path d="M92 110 L55 95 L50 97" stroke="#c9a84c" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
              <path d="M108 110 L145 95 L150 97" stroke="#c9a84c" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
              {/* Halo/aura */}
              <circle cx="100" cy="85" r="25" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3" fill="none" />
              <circle cx="100" cy="85" r="40" stroke="#c9a84c" strokeWidth="0.3" opacity="0.15" fill="none" />
            </g>
            {/* Reflection in water */}
            <g opacity="0.15" transform="translate(0, 360) scale(1, -1)">
              <circle cx="100" cy="85" r="10" fill="#c9a84c" />
              <path d="M100 97 L92 140 L80 170 L120 170 L108 140 Z" fill="#c9a84c" />
            </g>
            {/* Water line */}
            <line x1="0" y1="185" x2="200" y2="185" stroke="#c9a84c" strokeWidth="0.3" opacity="0.2" />
            <defs>
              <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a84c" stopOpacity="0" />
                <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className={`title-content ${loaded ? 'title-content--loaded' : ''}`}>
        {/* Music toggle */}
        <button
          className="title-music-btn"
          onClick={toggleMusic}
          title={musicPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
        >
          {musicPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 010 7" />
              <path d="M19 5a9 9 0 010 14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M23 9l-6 6" />
              <path d="M17 9l6 6" />
            </svg>
          )}
        </button>

        {/* Title */}
        <div className="title-logo">
          <h1 className="title-main">
            <span className="title-glyph">&#x2726;</span>
            <span className="title-text">GOD SIMULATOR</span>
            <span className="title-glyph">&#x2726;</span>
          </h1>
          <p className="title-sub">Divine Roleplay Engine</p>
          <div className="title-divider" />
          <p className="title-tagline">
            Sáng tạo. Cai trị. Huỷ diệt. Tái sinh.
          </p>
        </div>

        {/* Buttons */}
        <div className="title-buttons">
          <button className="title-btn title-btn--primary" onClick={handleNewGame}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2L14.5 8.5L21 9.5L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.5L9.5 8.5L12 2Z" />
            </svg>
            Bắt Đầu Mới
          </button>

          {hasSaveData && (
            <button className="title-btn title-btn--secondary" onClick={onContinue}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="title-btn-group">
                <span>Tiếp Tục</span>
                {savedName && (
                  <span className="title-btn-sub">
                    {savedName} ({savedPath === 'creator' ? 'Sáng Thế' : savedPath === 'god' ? 'Thần' : 'Phàm Nhân'})
                  </span>
                )}
              </span>
            </button>
          )}

          <button className="title-btn title-btn--ghost" onClick={onSettings}>
            <SettingsIcon size={18} />
            Cài Đặt
          </button>
        </div>

        {/* New Game Confirmation */}
        {showConfirm && (
          <div className="title-confirm">
            <div className="title-confirm-box glass-heavy">
              <p className="title-confirm-text">
                Dữ liệu hiện tại{savedName ? ` (${savedName})` : ''} sẽ bị xóa. Tiếp tục?
              </p>
              <div className="title-confirm-actions">
                <button className="title-btn title-btn--ghost title-btn--sm" onClick={() => setShowConfirm(false)}>
                  Hủy
                </button>
                <button className="title-btn title-btn--primary title-btn--sm" onClick={confirmNewGame}>
                  Xóa & Bắt Đầu Mới
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version */}
        <span className="title-version">v0.1.0</span>
      </div>
    </div>
  );
};

export default TitleScreen;
