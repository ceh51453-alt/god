/* ═══════════════════════════════════════════════════════
   NARRATIVE TAG RENDERER — React components for semantic tags
   Glassmorphism cards that render divine decrees, cosmic
   events, battle reports, etc. with themed styling.
   ═══════════════════════════════════════════════════════ */

import React from 'react';
import type { NarrativeTag, ParsedSegment } from '@/engine/narrative/tagParser';
import { getTagDisplayInfo } from '@/engine/narrative/tagParser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './NarrativeTag.css';

const REGEX_PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'div', 'span', 'p', 'br', 'hr', 'b', 'i', 'em', 'strong', 'u', 's', 'style',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img',
    'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'details', 'summary', 'small', 'sub', 'sup', 'mark', 'del', 'ins',
  ],
  ALLOWED_ATTR: [
    'class', 'style', 'id', 'href', 'src', 'alt', 'title', 'width', 'height',
    'target', 'rel', 'data-*', 'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: true,
};

function renderMd(text: string): string {
  // LUÔN qua marked để văn xuôi giữ ngắt đoạn; marked giữ nguyên HTML block
  // (card/style) do regex preset tạo. Sanitize bằng config nới lỏng cho card.
  return DOMPurify.sanitize(marked.parse(text) as string, REGEX_PURIFY_CONFIG);
}

// ── Individual tag renderers ──

const DivineDecreeCard: React.FC<{ tag: NarrativeTag }> = ({ tag }) => (
  <div className="ntag ntag--decree">
    <div className="ntag-header">
      <svg className="ntag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <span className="ntag-label">Chiếu Chỉ Thần Thánh</span>
    </div>
    <div className="ntag-body" dangerouslySetInnerHTML={{ __html: renderMd(tag.content) }} />
    {tag.attributes.from && <div className="ntag-footer">Từ: {tag.attributes.from}</div>}
  </div>
);

const CosmicEventCard: React.FC<{ tag: NarrativeTag }> = ({ tag }) => (
  <div className="ntag ntag--cosmic">
    <div className="ntag-header">
      <svg className="ntag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
      <span className="ntag-label">Sự Kiện Vũ Trụ</span>
      {tag.attributes.scale && <span className="ntag-badge">{tag.attributes.scale}</span>}
    </div>
    <div className="ntag-body" dangerouslySetInnerHTML={{ __html: renderMd(tag.content) }} />
  </div>
);

const CreationReportCard: React.FC<{ tag: NarrativeTag }> = ({ tag }) => (
  <div className="ntag ntag--creation">
    <div className="ntag-header">
      <svg className="ntag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
      <span className="ntag-label">Báo Cáo Sáng Tạo</span>
      {tag.attributes.type && <span className="ntag-badge">{tag.attributes.type}</span>}
    </div>
    <div className="ntag-body" dangerouslySetInnerHTML={{ __html: renderMd(tag.content) }} />
  </div>
);

const BattleReportCard: React.FC<{ tag: NarrativeTag }> = ({ tag }) => (
  <div className="ntag ntag--battle">
    <div className="ntag-header">
      <svg className="ntag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
        <path d="M14 2v6h6" />
      </svg>
      <span className="ntag-label">Báo Cáo Trận Đánh</span>
      {tag.attributes.outcome && <span className="ntag-badge ntag-badge--battle">{tag.attributes.outcome}</span>}
    </div>
    <div className="ntag-body" dangerouslySetInnerHTML={{ __html: renderMd(tag.content) }} />
    {tag.attributes.terrain && <div className="ntag-footer">Địa hình: {tag.attributes.terrain}</div>}
  </div>
);

const QuestUpdateCard: React.FC<{ tag: NarrativeTag }> = ({ tag }) => (
  <div className="ntag ntag--quest">
    <div className="ntag-header">
      <svg className="ntag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
      <span className="ntag-label">Cập Nhật Nhiệm Vụ</span>
      {tag.attributes.status && <span className="ntag-badge">{tag.attributes.status}</span>}
    </div>
    <div className="ntag-body" dangerouslySetInnerHTML={{ __html: renderMd(tag.content) }} />
  </div>
);

const GenericTagCard: React.FC<{ tag: NarrativeTag }> = ({ tag }) => {
  const info = getTagDisplayInfo(tag.type);
  return (
    <div className="ntag ntag--generic" style={{ '--ntag-accent': info.accentColor } as React.CSSProperties}>
      <div className="ntag-header">
        <svg className="ntag-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="ntag-label">{info.label}</span>
      </div>
      <div className="ntag-body" dangerouslySetInnerHTML={{ __html: renderMd(tag.content) }} />
    </div>
  );
};

// ── Tag component router ──

const TagComponent: React.FC<{ tag: NarrativeTag }> = ({ tag }) => {
  switch (tag.type) {
    case 'divine_decree': return <DivineDecreeCard tag={tag} />;
    case 'cosmic_event': return <CosmicEventCard tag={tag} />;
    case 'creation_report': return <CreationReportCard tag={tag} />;
    case 'battle_report': return <BattleReportCard tag={tag} />;
    case 'quest_update': return <QuestUpdateCard tag={tag} />;
    default: return <GenericTagCard tag={tag} />;
  }
};

// ── Main renderer ──

export const NarrativeSegments: React.FC<{ segments: ParsedSegment[] }> = ({ segments }) => (
  <div className="narrative-segments">
    {segments.map((seg, i) => (
      <React.Fragment key={i}>
        {seg.type === 'text' ? (
          <div
            className="narrative-text"
            dangerouslySetInnerHTML={{ __html: renderMd(seg.content) }}
          />
        ) : seg.tag ? (
          <TagComponent tag={seg.tag} />
        ) : null}
      </React.Fragment>
    ))}
  </div>
);

export default NarrativeSegments;
