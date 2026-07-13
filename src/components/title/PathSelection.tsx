import React, { useState } from 'react';
import type { GamePath } from '@/components/creation/creationData';
import './PathSelection.css';

interface PathDef {
  id: GamePath;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  detailVi: string;
  svgIcon: React.ReactNode;
  accentColor: string;
}

const PATHS: PathDef[] = [
  {
    id: 'creator',
    titleVi: 'Sáng Thế Thần',
    titleEn: 'The Creator',
    descriptionVi: 'Tạo ra vạn vật từ hư vô.',
    detailVi: 'Ngươi là khởi nguyên — đấng sáng tạo tối thượng. Tạo ra hàng vạn thần hệ, định hình các quy luật vũ trụ, ban sức mạnh và số mệnh cho muôn loài. Mọi thứ bắt đầu từ ngươi, và mọi thứ có thể kết thúc bởi ngươi. Khả năng là vô hạn.',
    accentColor: '#c9a84c',
    svgIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Cosmic eye / creation symbol */}
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <circle cx="32" cy="32" r="5" fill="currentColor" opacity="0.6" />
        {/* Emanating lines */}
        <line x1="32" y1="4" x2="32" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="32" y1="50" x2="32" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="12" y1="12" x2="18" y2="18" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <line x1="46" y1="12" x2="52" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <line x1="12" y1="52" x2="6" y2="58" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <line x1="46" y1="46" x2="52" y2="52" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        {/* Inner glow */}
        <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.08" />
      </svg>
    ),
  },
  {
    id: 'mortal',
    titleVi: 'Phàm Nhân',
    titleEn: 'The Mortal',
    descriptionVi: 'Sinh ra trong trần thế, hướng tới thần tính.',
    detailVi: 'Ngươi là một con người bình thường — nhưng với tiềm năng phi thường. Tu luyện, chiến đấu, mưu lược, và có thể... phong thần. Khởi đầu từ bụi trần, nhưng đích đến có thể là ngôi vị thần thánh hoặc bá chủ thiên hạ. Con đường gian nan nhưng đầy kịch tính.',
    accentColor: '#7b8fa8',
    svgIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Human figure reaching upward */}
        <circle cx="32" cy="16" r="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <path d="M32 22 L32 40" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <path d="M32 28 L22 22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M32 28 L42 22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M32 40 L24 52" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M32 40 L40 52" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {/* Ascending sparkles */}
        <circle cx="32" cy="6" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="26" cy="9" r="0.5" fill="currentColor" opacity="0.2" />
        <circle cx="38" cy="8" r="0.5" fill="currentColor" opacity="0.2" />
        {/* Ground line */}
        <line x1="18" y1="54" x2="46" y2="54" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      </svg>
    ),
  },
  {
    id: 'god',
    titleVi: 'Thần',
    titleEn: 'The God',
    descriptionVi: 'Một vị thần trong vạn thần.',
    detailVi: 'Ngươi là một vị thần — không phải đấng sáng tạo, nhưng mang quyền năng thần thánh. Có tín đồ, có đền thờ, có kẻ thù thần thánh. Xây dựng thế lực, kết liên minh hoặc chiến tranh với các thần khác, can thiệp vào vận mệnh phàm nhân. Chọn hoặc tự tạo miền quyền năng của ngươi.',
    accentColor: '#d4874a',
    svgIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Divine star / deity symbol */}
        <path d="M32 8L36 24L52 20L40 32L52 44L36 40L32 56L28 40L12 44L24 32L12 20L28 24Z" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <path d="M32 16L35 26L44 24L37 32L44 40L35 38L32 48L29 38L20 40L27 32L20 24L29 26Z" fill="currentColor" opacity="0.15" />
        <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.4" />
        {/* Outer halo */}
        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="0.3" opacity="0.15" strokeDasharray="3 5" />
      </svg>
    ),
  },
];

interface PathSelectionProps {
  onSelect: (path: GamePath) => void;
  onBack: () => void;
}

export const PathSelection: React.FC<PathSelectionProps> = ({ onSelect, onBack }) => {
  const [hoveredPath, setHoveredPath] = useState<GamePath | null>(null);
  const [selectedPath, setSelectedPath] = useState<GamePath | null>(null);

  const handleSelect = (path: GamePath) => {
    setSelectedPath(path);
    // Brief delay for animation before transitioning
    setTimeout(() => onSelect(path), 400);
  };

  return (
    <div className="path-screen">
      {/* Same cosmic background */}
      <div className="title-bg">
        <div className="title-stars" />
        <div className="title-nebula title-nebula--1" />
        <div className="title-nebula title-nebula--2" />
        <div className="title-vignette" />
      </div>

      <div className="path-content animate-fadeIn">
        {/* Header */}
        <div className="path-header">
          <button className="path-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="path-title">Chọn Con Đường</h2>
          <p className="path-subtitle">Mỗi con đường mở ra những khả năng vô tận</p>
        </div>

        {/* Path Cards */}
        <div className="path-cards">
          {PATHS.map((path, index) => (
            <button
              key={path.id}
              className={`path-card ${hoveredPath === path.id ? 'path-card--hovered' : ''} ${selectedPath === path.id ? 'path-card--selected' : ''}`}
              style={{
                '--path-accent': path.accentColor,
                '--path-delay': `${index * 0.1}s`,
              } as React.CSSProperties}
              onClick={() => handleSelect(path.id)}
              onMouseEnter={() => setHoveredPath(path.id)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <div className="path-card-glow" />
              <div className="path-card-icon" style={{ color: path.accentColor }}>
                {path.svgIcon}
              </div>
              <div className="path-card-info">
                <h3 className="path-card-title" style={{ color: path.accentColor }}>
                  {path.titleVi}
                </h3>
                <span className="path-card-en">{path.titleEn}</span>
                <p className="path-card-desc">{path.descriptionVi}</p>
                <div className="path-card-divider" style={{ background: `linear-gradient(90deg, transparent, ${path.accentColor}, transparent)` }} />
                <p className="path-card-detail">{path.detailVi}</p>
              </div>
              <div className="path-card-select">
                <span>Chọn con đường này</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathSelection;
