/* ═══════════════════════════════════════════════════════
   NARRATIVE TAG PARSER — Parse semantic tags from AI text
   Converts <divine_decree>, <cosmic_event>, etc. into
   structured data for React components to render.
   ═══════════════════════════════════════════════════════ */

export type NarrativeTagType =
  | 'divine_decree'
  | 'cosmic_event'
  | 'creation_report'
  | 'pantheon_council'
  | 'mortal_prayer'
  | 'battle_report'
  | 'event_popup'
  | 'raven_scroll'
  | 'divine_blessing'
  | 'divine_curse'
  | 'quest_update'
  | 'npc_dialogue';

export interface NarrativeTag {
  type: NarrativeTagType;
  attributes: Record<string, string>;
  content: string;
}

export interface ParsedSegment {
  type: 'text' | 'tag';
  content: string;
  tag?: NarrativeTag;
}

/**
 * Parse a text containing narrative tags into segments.
 * Regular text is preserved as-is; tags become structured data.
 */
export function parseNarrativeTags(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];

  // Match all narrative tags (self-closing or with content)
  const tagRegex = /<(divine_decree|cosmic_event|creation_report|pantheon_council|mortal_prayer|battle_report|event_popup|raven_scroll|divine_blessing|divine_curse|quest_update|npc_dialogue)(\s[^>]*)?\s*(?:\/>|>([\s\S]*?)<\/\1>)/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {
    // Add text before this tag
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) {
        segments.push({ type: 'text', content: before });
      }
    }

    // Parse attributes
    const type = match[1].toLowerCase() as NarrativeTagType;
    const attrStr = match[2] || '';
    const content = (match[3] || '').trim();
    const attributes = parseAttributes(attrStr);

    segments.push({
      type: 'tag',
      content: '',
      tag: { type, attributes, content },
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      segments.push({ type: 'text', content: remaining });
    }
  }

  // If no tags found, return the entire text as one segment
  if (segments.length === 0 && text.trim()) {
    segments.push({ type: 'text', content: text.trim() });
  }

  return segments;
}

function parseAttributes(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrStr)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

/**
 * Get display info for a tag type (icon hint, color accent, label)
 */
export function getTagDisplayInfo(type: NarrativeTagType): {
  label: string;
  accentColor: string;
  iconHint: string;
} {
  switch (type) {
    case 'divine_decree':
      return { label: 'Chiếu Chỉ Thần Thánh', accentColor: '#c9a84c', iconHint: 'scroll' };
    case 'cosmic_event':
      return { label: 'Sự Kiện Vũ Trụ', accentColor: '#8b5cf6', iconHint: 'star' };
    case 'creation_report':
      return { label: 'Báo Cáo Sáng Tạo', accentColor: '#10b981', iconHint: 'sparkle' };
    case 'pantheon_council':
      return { label: 'Hội Đồng Thần', accentColor: '#d4874a', iconHint: 'crown' };
    case 'mortal_prayer':
      return { label: 'Lời Cầu Nguyện', accentColor: '#7b8fa8', iconHint: 'prayer' };
    case 'battle_report':
      return { label: 'Báo Cáo Trận Đánh', accentColor: '#ef4444', iconHint: 'sword' };
    case 'event_popup':
      return { label: 'Sự Kiện', accentColor: '#f59e0b', iconHint: 'bell' };
    case 'raven_scroll':
      return { label: 'Tin Từ Xa', accentColor: '#6366f1', iconHint: 'feather' };
    case 'divine_blessing':
      return { label: 'Phúc Lành', accentColor: '#22c55e', iconHint: 'blessing' };
    case 'divine_curse':
      return { label: 'Lời Nguyền', accentColor: '#dc2626', iconHint: 'curse' };
    case 'quest_update':
      return { label: 'Cập Nhật Nhiệm Vụ', accentColor: '#3b82f6', iconHint: 'quest' };
    case 'npc_dialogue':
      return { label: 'Đối Thoại', accentColor: '#a78bfa', iconHint: 'speech' };
    default:
      return { label: 'Thông Báo', accentColor: '#94a3b8', iconHint: 'info' };
  }
}
