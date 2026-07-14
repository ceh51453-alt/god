/* ═══════════════════════════════════════════════════════
   ENRICH ENGINE — AI Auto-fills missing fields in Studio
   After each AI response, detects mentioned entities and
   sends a background AI call to fill empty fields.
   ═══════════════════════════════════════════════════════ */

import { useEnrichStore } from '@/stores/enrichStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { buildChatUrl, buildHeaders, buildSimpleBody, extractResponseText, normalizeUserUrl } from '@/engine/api/apiClient';
import { useStudioStore } from '@/components/studio/studioStore';
import {
  CATEGORIES, getCategory,
  asStr, asArr, asStats, asSub, asGraph,
  type StudioEntity, type CategoryDef, type FieldDef, type FieldValue,
} from '@/components/studio/studioTypes';

/* ── Types ── */

interface EnrichResult {
  entityId: string;
  entityName: string;
  category: string;
  fieldsUpdated: string[];
}

/* ── Helpers ── */

/** Check if a field value is effectively empty */
function isFieldEmpty(f: FieldDef, v: FieldValue | undefined): boolean {
  if (v == null) return true;
  switch (f.type) {
    case 'text':
    case 'textarea':
    case 'select':
      return !asStr(v).trim();
    case 'tags':
    case 'relations':
      return asArr(v).length === 0;
    case 'stats': {
      // Stats are never truly "empty" since they have defaults
      return false;
    }
    case 'sublist':
      return asSub(v).length === 0;
    case 'graph':
      return asGraph(v).length === 0;
    default:
      return false;
  }
}

/** Get names of empty fields for an entity */
function getEmptyFields(entity: StudioEntity): FieldDef[] {
  const cat = getCategory(entity.category);
  return cat.fields.filter(f => {
    if (f.id === 'tagline') return false; // tagline usually already filled
    if (f.type === 'relations') return false; // relations need IDs, skip for now
    return isFieldEmpty(f, entity.values[f.id]);
  });
}

/** Fuzzy match entity names in narrative text */
export function detectMentionedEntities(
  narrative: string,
  entities: StudioEntity[],
): StudioEntity[] {
  if (!narrative || !entities.length) return [];

  const lower = narrative.toLowerCase();
  return entities.filter(e => {
    if (!e.name?.trim()) return false;
    const name = e.name.toLowerCase();
    // Exact or substring match
    if (lower.includes(name)) return true;
    // Also check for partial matches (at least 4 chars)
    if (name.length >= 4) {
      const words = name.split(/\s+/);
      return words.some(w => w.length >= 3 && lower.includes(w));
    }
    return false;
  });
}

/** Build the enrichment prompt for a batch of entities */
function buildEnrichPrompt(
  entities: { entity: StudioEntity; emptyFields: FieldDef[]; cat: CategoryDef }[],
  narrative: string,
): string {
  const lines: string[] = [];
  lines.push('Bạn là AI trợ giúp cho hệ thống worldbuilding. Dựa trên bối cảnh câu chuyện dưới đây, hãy điền thông tin còn thiếu cho các thực thể.');
  lines.push('');
  lines.push('BỐI CẢNH GẦN NHẤT:');
  lines.push(narrative.slice(0, 2000)); // Limit context
  lines.push('');
  lines.push('CÁC THỰC THỂ CẦN BỔ SUNG:');
  lines.push('');

  for (const { entity, emptyFields, cat } of entities) {
    lines.push(`--- ${cat.name}: "${entity.name}" (id: ${entity.id}) ---`);
    const tagline = asStr(entity.values.tagline);
    if (tagline) lines.push(`Bản chất: ${tagline}`);

    // Show existing non-empty fields for context
    for (const f of cat.fields) {
      if (emptyFields.includes(f)) continue;
      if (f.id === 'tagline') continue;
      const v = entity.values[f.id];
      const s = asStr(v);
      if (s) lines.push(`  ${f.label}: ${s}`);
    }

    lines.push('');
    lines.push('Fields cần điền:');
    for (const f of emptyFields) {
      let hint = f.label;
      if (f.type === 'select' && f.options) {
        hint += ` (chọn 1: ${f.options.map(o => o.value).join(', ')})`;
      } else if (f.type === 'tags' && f.suggestions) {
        hint += ` (mảng chuỗi, gợi ý: ${f.suggestions.slice(0, 5).join(', ')})`;
      } else if (f.type === 'text' || f.type === 'textarea') {
        hint += ` (chuỗi)`;
      }
      lines.push(`  - "${f.id}": ${hint}`);
    }
    lines.push('');
  }

  lines.push('TRẢ VỀ JSON thuần (không markdown, không giải thích) với format:');
  lines.push('[');
  lines.push('  { "id": "<entity_id>", "fields": { "<field_id>": <value>, ... } },');
  lines.push('  ...');
  lines.push(']');
  lines.push('Trong đó value là string cho text/textarea/select, mảng string cho tags.');

  return lines.join('\n');
}

/** Parse AI response JSON */
function parseEnrichResponse(raw: string): { id: string; fields: Record<string, unknown> }[] {
  // Strip markdown fences
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object' && parsed.id) return [parsed];
    return [];
  } catch {
    return [];
  }
}

/** Apply enrichment data to an entity */
function applyEnrichment(
  entity: StudioEntity,
  fields: Record<string, unknown>,
): { updated: StudioEntity; fieldsUpdated: string[] } {
  const cat = getCategory(entity.category);
  const updatedValues = { ...entity.values };
  const fieldsUpdated: string[] = [];

  for (const [fieldId, value] of Object.entries(fields)) {
    const fieldDef = cat.fields.find(f => f.id === fieldId);
    if (!fieldDef) continue;

    // Only fill if currently empty
    if (!isFieldEmpty(fieldDef, updatedValues[fieldId])) continue;

    switch (fieldDef.type) {
      case 'text':
      case 'textarea':
      case 'select':
        if (typeof value === 'string' && value.trim()) {
          updatedValues[fieldId] = value.slice(0, 1000);
          fieldsUpdated.push(fieldId);
        }
        break;
      case 'tags':
        if (Array.isArray(value)) {
          const tags = value.filter((x): x is string => typeof x === 'string').slice(0, 20);
          if (tags.length > 0) {
            updatedValues[fieldId] = tags as FieldValue;
            fieldsUpdated.push(fieldId);
          }
        }
        break;
      // Skip complex types (stats, graph, sublist, relations) for safety
    }
  }

  return {
    updated: { ...entity, values: updatedValues, updatedAt: Date.now() },
    fieldsUpdated,
  };
}

/* ── Build connection config for enrichment ── */

interface EnrichConn {
  url: string;
  headers: Record<string, string>;
  makeBody: (system: string, user: string) => Record<string, unknown>;
  extract: (data: any) => string;
}

function getEnrichConnectionConfig(): EnrichConn | null {
  const enrichState = useEnrichStore.getState();
  const sampling = enrichState.sampling;

  if (enrichState.proxySource === 'custom') {
    // Nguồn tùy chỉnh: luôn coi là endpoint OpenAI-compat.
    // Cùng ngữ nghĩa với apiClient: có base → proxy?target=<base>; CHỈ có proxy
    // → proxy làm base luôn (trước đây target trỏ vào chính proxy — sai).
    const base = normalizeUserUrl(enrichState.customBaseUrl);
    const proxy = normalizeUserUrl(enrichState.customProxyUrl);
    if (!base && !proxy) return null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const effectiveKey = (enrichState.customApiKey || enrichState.customProxyPassword || '').trim();
    if (effectiveKey) headers['Authorization'] = `Bearer ${effectiveKey}`;
    if (enrichState.customProxyPassword) headers['X-Proxy-Password'] = enrichState.customProxyPassword;

    let url: string;
    if (proxy && base) {
      const sep = proxy.includes('?') ? '&' : '?';
      url = `${proxy}${sep}target=${encodeURIComponent(`${base}/chat/completions`)}`;
    } else {
      url = `${proxy || base}/chat/completions`;
    }

    return {
      url,
      headers,
      makeBody: (system, user) => ({
        model: enrichState.customModel || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: sampling.max_tokens,
        temperature: sampling.temperature,
        top_p: sampling.top_p,
        frequency_penalty: sampling.frequency_penalty,
        presence_penalty: sampling.presence_penalty,
        stream: false,
      }),
      extract: (data) => data?.choices?.[0]?.message?.content || '',
    };
  }

  // Default: dùng profile kết nối chính — URL/headers/body theo ĐÚNG provider
  const profile = useConnectionStore.getState().getActiveProfile();
  if (!(profile.baseUrl || profile.proxyUrl) || !profile.selectedModel) return null;

  return {
    url: buildChatUrl(profile, false),
    headers: buildHeaders(profile),
    makeBody: (system, user) => buildSimpleBody(profile, system, user, {
      maxTokens: sampling.max_tokens,
      temperature: sampling.temperature,
    }),
    extract: (data) => extractResponseText(profile.provider, data),
  };
}

/* ── Main Enrich Function ── */

export async function runEnrich(narrativeContext: string): Promise<EnrichResult[]> {
  const enrichStore = useEnrichStore.getState();
  if (!enrichStore.enabled) return [];

  const conn = getEnrichConnectionConfig();
  if (!conn) {
    enrichStore.setStatus('error', 'Chưa cấu hình kết nối cho enrich');
    return [];
  }

  const studioStore = useStudioStore.getState();
  const allEntities = studioStore.entities;
  if (allEntities.length === 0) return [];

  // Find entities mentioned in narrative that have empty fields
  const mentioned = detectMentionedEntities(narrativeContext, allEntities);
  if (mentioned.length === 0) return [];

  const toEnrich = mentioned
    .map(entity => {
      const cat = getCategory(entity.category);
      const emptyFields = getEmptyFields(entity);
      return { entity, emptyFields, cat };
    })
    .filter(x => x.emptyFields.length > 0)
    .slice(0, 5); // Limit batch size

  if (toEnrich.length === 0) return [];

  enrichStore.setStatus('running', `Đang bổ sung ${toEnrich.length} thực thể...`);

  try {
    const prompt = buildEnrichPrompt(toEnrich, narrativeContext);

    const response = await fetch(conn.url, {
      method: 'POST',
      headers: conn.headers,
      body: JSON.stringify(conn.makeBody(
        'Bạn là trợ lý worldbuilding. Trả về JSON thuần, không markdown.',
        prompt,
      )),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Enrich API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = conn.extract(data);
    const enrichData = parseEnrichResponse(rawText);

    const results: EnrichResult[] = [];

    for (const item of enrichData) {
      if (!item.id || !item.fields) continue;
      const entity = allEntities.find(e => e.id === item.id);
      if (!entity) continue;

      const { updated, fieldsUpdated } = applyEnrichment(entity, item.fields);
      if (fieldsUpdated.length > 0) {
        studioStore.update(entity.id, { values: updated.values, updatedAt: updated.updatedAt });
        const result: EnrichResult = {
          entityId: entity.id,
          entityName: entity.name,
          category: entity.category,
          fieldsUpdated,
        };
        results.push(result);
        enrichStore.addLogEntry(result);
      }
    }

    enrichStore.setStatus('done', `Đã bổ sung ${results.length} thực thể`);

    // Reset status after 3s
    setTimeout(() => {
      if (useEnrichStore.getState().status === 'done') {
        useEnrichStore.getState().setStatus('idle');
      }
    }, 3000);

    return results;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    enrichStore.setStatus('error', msg);
    console.warn('[Enrich] Error:', msg);
    return [];
  }
}
