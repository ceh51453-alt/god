# Prompt xây dựng Web App Game Nhập Vai AI — "A Song of Ice and Fire" (Westeros)

Bạn là senior full-stack engineer. Hãy xây một web app game nhập vai bằng AI (text roleplay / phiêu lưu), **mobile-first responsive** (chạy mượt cả điện thoại lẫn PC), lấy cơ chế lõi của **SillyTavern** + engine biến trạng thái kiểu **TavernHelper (MVU-ZOD)**, bối cảnh tiểu thuyết **A Song of Ice and Fire**.

Xây từng milestone, code sạch, có test, có thể chạy độc lập. **Sau mỗi milestone chạy được và pass acceptance criteria thì mới sang milestone kế tiếp.** Sau mỗi milestone, in ra: (a) cây thư mục cập nhật, (b) danh sách file đã tạo/sửa, (c) hướng dẫn chạy thử, (d) checklist acceptance criteria đã đạt, (e) known issues / nợ kỹ thuật nếu có.

**Nguyên tắc thiết kế xuyên suốt:**
- Đây là **web app riêng của chúng ta** — các pattern tham khảo từ SillyTavern/TavernHelper hay từ các card MVU-ZOD trước đó (Đế Quốc La Mã Thần Thánh, các bản Nam Bắc Triều/Đông Tấn...) là **nguồn cảm hứng, không phải khuôn mẫu bắt buộc phải bám 1:1**. App tự sở hữu toàn bộ renderer nên không cần giả lập các workaround của ST (regex string-replace, iframe HTML...) — khi có cách làm hợp lý hơn trong kiến trúc React/Zustand hiện có, cứ chọn cách đó. Ngoại lệ duy nhất: phần **import preset ST và import lorebook ST** (mục 3–4) cần tương thích thật vì đó là tính năng người dùng sẽ dùng để nạp dữ liệu có sẵn.
- Ưu tiên **đúng trước, đẹp sau** — engine (MVU, lorebook, prompt builder) phải chính xác tuyệt đối trước khi trau chuốt UI.
- Mọi dữ liệu do AI trả về đều **không đáng tin cậy** — luôn validate, luôn có fallback, không bao giờ để 1 response lỗi làm crash toàn app.
- **"Engine giữ số, AI giữ lời"**: mọi con số quyết định thắng/thua, thu/chi, thời gian... do engine tính; AI chỉ tường thuật lại và không được tự bịa số ảnh hưởng đến state.
- Mọi tính năng nặng (RAG, token counting, regex lớn) chạy async, không block UI thread khi có thể (dùng Web Worker nếu cần).
- Code phải dễ debug: có debug panel/console log có cấu trúc (không `console.log` rải rác), có thể bật/tắt verbose logging trong settings.

**NGÔN NGỮ THIẾT KẾ MỸ THUẬT (bắt buộc tuyệt đối — áp dụng cho MỌI màn hình, MỌI component):**

Đây là ràng buộc cứng, ưu tiên cao ngang với tính đúng của engine. Mục tiêu thẩm mỹ: **sang trọng, điện ảnh, hiện đại — như poster phim cao cấp hoặc app thiết kế cao cấp, KHÔNG phải game hoạt hình.**

1. **CẤM EMOJI hoàn toàn.** Không dùng bất kỳ emoji nào ([icon:lãnh-địa][icon:quân-sự][icon:triều-đình][icon:mưu-đồ][icon:kinh-tế][icon:nhật-ký]...) ở bất cứ đâu: không trong UI, không trên nút, không trong nhãn, không trong tab, không trong thông báo/toast, không trong Action Deck. Emoji làm UI trông trẻ con/hoạt hình, phá hỏng cảm giác cao cấp. **Mọi icon phải là SVG tự vẽ** (xem điểm 2). Lưu ý: các emoji xuất hiện trong tài liệu prompt này (ở mô tả Action Deck mục 6.3, tên panel mục 6, v.v.) chỉ là **ký hiệu tốc ký để mô tả cho lập trình viên hiểu** — khi code phải thay 100% bằng SVG icon tương ứng, tuyệt đối không render emoji ra giao diện.

2. **BẮT BUỘC dùng SVG cho toàn bộ hình ảnh, icon, chi tiết đồ hoạ.** Mọi biểu tượng (kiếm, vương miện, huy hiệu Nhà, tài nguyên, trạng thái, mũi tên, nút chức năng...), mọi đường viền trang trí, mọi hoa văn, mọi minh hoạ đều vẽ bằng SVG inline (stroke mảnh, phong cách line-art tinh tế hoặc khối phẳng thanh lịch). Ưu điểm: sắc nét mọi độ phân giải, đổi màu/opacity theo theme dễ dàng, nhẹ. Huy hiệu các Nhà (sói Stark, sư tử Lannister, rồng Targaryen...) vẽ cách điệu bằng SVG đơn sắc/gradient, không dùng ảnh bitmap hay emoji động vật. Tạo 1 thư viện icon SVG dùng chung (`ui/icons/`) — mỗi icon là 1 React component nhận `size`/`color`/`strokeWidth` qua prop.

3. **Phong cách KÍNH MỜ (glassmorphism) làm chủ đạo.** Các panel, thẻ, modal, thanh trạng thái dùng nền **bán trong suốt + hiệu ứng làm mờ hậu cảnh** (`background: rgba(...)` opacity thấp + `backdrop-filter: blur(...)`), viền mảnh sáng nhẹ (`border: 1px solid rgba(255,255,255,0.1~0.18)`), bo góc mềm (`border-radius` vừa phải), đổ bóng tinh tế nhiều lớp (`box-shadow` mềm, khuếch tán). Bố cục như **poster cao cấp**: nhiều khoảng thở (whitespace/negative space rộng rãi), phân cấp thị giác rõ ràng, căn chỉnh chính xác theo lưới, typography làm điểm nhấn. Màu nền chuyển **gradient tinh tế** (linear/radial gradient dịu, chuyển màu gần nhau, không gắt) làm lớp nền phía sau lớp kính. Tham khảo cách card "Đại Lãnh Chúa" đã dùng `backdrop-filter: blur()` + `rgba()` cho modal — nhưng nâng lên mức tinh tế hơn, nhất quán toàn app.

4. **Bảng màu ÍT BÃO HOÀ, TƯƠNG PHẢN THẤP, sang trọng nhẹ nhàng.** Dùng tông màu trầm, desaturated (xám khói, than chì, xanh đen mực, nâu trầm, be xám, vàng đồng mờ...) thay vì màu rực. Độ tương phản dịu (tránh đen thuần trên trắng thuần chói mắt) — text dùng xám nhạt/trắng ngà trên nền tối trầm, không phải trắng tinh 100%. Màu accent theo Nhà (mục 6 theme pack) cũng ở dạng **giảm bão hoà** (Lannister đỏ-đồng trầm chứ không đỏ tươi, Stark xám-lam lạnh chứ không xanh chói). Gradient chuyển giữa các sắc độ gần nhau tạo chiều sâu mà vẫn êm. Tổng thể cho cảm giác tối giản, cao cấp, hiện đại — dịu mắt khi chơi lâu.

Toàn bộ ràng buộc trên khai báo tập trung bằng **CSS variables + design tokens** (`--glass-bg`, `--glass-border`, `--blur-strength`, `--accent-desaturated`, `--text-soft`, `--gradient-base`...) trong 1 file theme gốc, để mọi component kế thừa nhất quán và đổi theme pack theo Nhà chỉ cần swap biến. Đọc kỹ mục 6 (Status Panel) và các mục UI (10.4, 11.5-11.6, 13.5, 14.5, 15.5, 17.4) — tất cả đều phải tuân thủ 4 điểm này. **Nếu có skill `frontend-design`, đọc trước khi code UI để áp dụng đúng design token của môi trường.**

**Bản đồ hệ thống (đọc trước để nắm toàn cảnh):** app gồm 3 lớp cắm chung vào 1 `StatDataSchema` (mục 5) và 1 vòng lặp `onTurnAdvance()` duy nhất:
- **Lớp nền (engine):** kết nối API (2), prompt builder + macro (3), tích hợp lore người dùng cung cấp (4), **MVU-ZOD state + patch (5) — trái tim của mọi thứ**, prompt hướng dẫn AI cập nhật bảng (5.4b), thẻ ngữ nghĩa (5.6), **kiến trúc tích hợp nối RAG + lorebook + bảng trạng thái + trí nhớ + thẻ thành một vòng lượt (5.7)**, **hệ xác suất thống nhất — RNG có hạt giống + kiểm định chung cho mọi hành động rủi ro (5bis)**.
- **Lớp nhập vai (mặt tiền người chơi):** status panel + layout game hybrid (6), màn hình mở đầu theo Thời Kỳ + tạo nhân vật (8), bản đồ tương tác (9), trí nhớ/tính cách NPC + danh tiếng (16), **trí nhớ dài hạn chống AI quên khi chơi lâu — 4 tầng + tóm tắt lũy tiến + Codex (16bis)**, sự kiện + quest (17), âm nhạc động (18).
- **Lớp mô phỏng chiến lược (chiều sâu):** chiến đấu chiến thuật (7.1-7.3) → đại chiến/địa hình/tướng/hải chiến (7.5-7.8) → engine phán định trận đánh chuẩn hoá + độ khó + tầng giao tranh + rồng/siêu nhiên (7.9-7.15); lãnh địa & công trình (10); quân đội (11); chiến tranh chiến lược (12); cung đình + hôn nhân/kế vị (13); chính trị & mưu đồ (14); kinh tế & thương mại (15).

Mọi hệ thống ở lớp chiến lược đều: (a) mở rộng `StatDataSchema` bằng field `z.record()`/`z.object()` mới, (b) cắm logic theo turn vào `onTurnAdvance()`, (c) để engine giữ số & AI tường thuật. Nắm được 2 điểm neo này (schema chung + turn loop chung) là hiểu được cách toàn app ráp lại. **Và trên tất cả: mọi thứ hiển thị đều phải tuân 4 ràng buộc mỹ thuật (không emoji / SVG / glassmorphism / màu ít bão hoà) đã nêu ngay phía trên.**

---

## 1. Công nghệ (bắt buộc)

- **React 18 + TypeScript (strict mode)** + **Vite**
- **State management:** Zustand (dùng middleware `persist` cho slice cần lưu localStorage, tách store theo domain: `useConnectionStore`, `useChatStore`, `useMvuStore`, `useSettingsStore`, `useCombatStore`, `useMapStore`…)
- **UI:** Tailwind CSS, mobile-first, breakpoint rõ ràng (`sm` 640px / `md` 768px / `lg` 1024px). Component headless (Radix UI hoặc tự viết) cho dropdown/modal/drawer để đảm bảo accessibility cơ bản (focus trap, ESC đóng modal).
- **Router:** React Router (hoặc tự viết nếu app chủ yếu 1 trang + modal/drawer, tránh over-engineer).
- **Bản đồ tương tác:** Leaflet.js + `react-leaflet`, dùng `L.CRS.Simple` (hệ toạ độ phẳng cho ảnh tĩnh, không phải toạ độ địa lý thật) — pattern chuẩn cho bản đồ fantasy/game, có sẵn zoom/pan/pinch mượt trên mobile. Không bắt buộc — nếu muốn tối giản dependency, thay bằng component tự viết (SVG + CSS transform + pointer events), nhưng sẽ tốn công hơn để mượt trên mobile.
- **Không cần backend:** gọi thẳng API OpenAI-compatible từ client (`fetch` + SSE streaming, dùng `EventSource`-style parser thủ công vì `fetch` + `ReadableStream` linh hoạt hơn `EventSource` gốc cho header tuỳ chỉnh). Hỗ trợ cấu hình CORS proxy tùy chọn.
- **Lưu trữ:** Dexie.js (wrapper IndexedDB) cho chat log/save/lorebook lớn; `localStorage` (qua Zustand persist) chỉ cho settings nhỏ.
- **PWA:** `vite-plugin-pwa` (Workbox) — manifest + service worker, cache app shell, chat data không cache offline (cần mạng để gọi AI).
- **Markdown rendering:** `marked` hoặc `remark` + **DOMPurify** bắt buộc trước khi `dangerouslySetInnerHTML`.
- **Token counting:** `gpt-tokenizer` hoặc `js-tiktoken` cho ước lượng gần đúng (không cần chính xác 100% với mọi model, ghi rõ "ước lượng").
- **Dice/RNG:** thư viện seedable RNG (`seedrandom` hoặc tự viết PRNG) để đảm bảo kết quả combat/xây dựng/di chuyển có thể tái lập khi debug.
- **Dark theme mặc định**, light theme tùy chọn qua CSS variables + Tailwind `dark:` class strategy.
- **i18n:** VI/EN tối thiểu, dùng `i18next` hoặc context tự viết, tách file JSON theo namespace (`common.json`, `combat.json`, `mvu.json`, `map.json`…).

---

## 2. Cấu hình API & Model

### 2.1 Form kết nối
- **Base URL** (vd `https://.../v1`), **API Key** (mask như mật khẩu, nút hiện/ẩn, nút copy).
- Cho phép nhập **nhiều key** (mỗi dòng 1 key trong textarea) — khi request lỗi 429 hoặc 401 do key cụ thể, tự động xoay sang key tiếp theo (round-robin), log lại key nào đang dùng (ẩn phần giữa key, chỉ hiện 4 ký tự đầu/cuối).
- **Provider preset:** OpenAI / Anthropic-compatible / Google / Custom. Mỗi preset định nghĩa:
  - Format request body khác nhau (vd Anthropic bắt buộc `max_tokens`, dùng `system` riêng ngoài mảng `messages`; Google Gemini dùng `contents` thay vì `messages`)
  - Header auth khác nhau (`Authorization: Bearer` vs `x-api-key`)
  - Cách parse SSE chunk khác nhau (`data: {...}` OpenAI-style vs event-stream khác)
- **Quét model:** nút "Scan Models" gọi `GET {baseURL}/models` → parse response → hiển thị dropdown có ô tìm kiếm/filter theo tên → chọn model, lưu vào profile.
- **Test Connection:** gửi 1 request nhỏ (`"ping"`, `max_tokens: 5`) → hiển thị trạng thái: thành công (kèm latency ms), thất bại (kèm mã lỗi HTTP + message rõ ràng, vd "401: API key không hợp lệ", "CORS bị chặn — thử bật CORS proxy").

### 2.2 Bảng tham số model chi tiết
Lưu theo từng Connection Profile, mỗi tham số có **slider + ô số đồng bộ hai chiều + nút reset về mặc định provider + tooltip giải thích ngắn**:

| Tham số | Range gợi ý | Ghi chú |
|---|---|---|
| `temperature` | 0–2 | |
| `top_p` | 0–1 | |
| `top_k` | 0–100 | ẩn nếu provider không hỗ trợ |
| `min_p` | 0–1 | |
| `top_a` | 0–1 | |
| `typical_p` | 0–1 | |
| `frequency_penalty` | -2–2 | |
| `presence_penalty` | -2–2 | |
| `repetition_penalty` | 1–2 (+ range/slope) | kiểu KoboldAI |
| `max_tokens` | tuỳ model | giới hạn output |
| `max context tokens` | tuỳ model | dùng để cắt lịch sử chat |
| `seed` | số nguyên | để tái lập response nếu API hỗ trợ |
| `stop sequences` | list string | thêm/xoá từng cái |
| streaming | on/off | |
| reasoning/thinking | on/off | chỉ hiện nếu model hỗ trợ (theo provider preset) |

- **Nhiều Connection Profile:** tạo/lưu/đổi tên/xoá/nhân bản, dropdown đổi nhanh ở header, mỗi profile độc lập hoàn toàn (key, model, tham số).

### 2.3 Xử lý lỗi API & tự động thử lại (auto-retry)

Gọi AI qua mạng thường xuyên lỗi tạm thời (429 rate limit, timeout, 5xx, đứt kết nối, stream gãy giữa chừng). App phải **tự động thử lại** thay vì để người chơi mất lượt và phải bấm lại thủ công.

- **Số lần thử lại người dùng chỉnh được:** trong Settings > Connection có ô "Số lần thử lại khi gọi thất bại", **mặc định 3, cho chỉnh trong khoảng 3–10** (slider hoặc ô số, kèm nút reset). Lưu theo Connection Profile.
- **Loại lỗi được retry:** lỗi tạm thời — HTTP 429 (rate limit), 500/502/503/504, timeout, lỗi mạng/đứt kết nối, stream gãy nửa chừng. **Không retry** lỗi vĩnh viễn vô nghĩa (vd 400 body sai, 401/403 sai key khi chỉ có 1 key) — báo lỗi ngay thay vì thử vô ích.
- **Chiến lược retry:** exponential backoff + jitter (vd chờ ~1s, 2s, 4s... có cộng ngẫu nhiên nhẹ để tránh dồn) giữa các lần. Với lỗi 429/401 do **1 key cụ thể** và có **nhiều key** (mục 2.1): mỗi lần retry **xoay sang key kế tiếp** (round-robin) trước khi tính là 1 lần thử — kết hợp retry với rotate key. Tôn trọng header `Retry-After` của server nếu có.
- **Phản hồi trực quan khi đang retry:** hiện trạng thái nhẹ nhàng, không hoảng ("Đang thử lại... (lần 2/5)") ngay tại chỗ tin nhắn đang chờ, để người chơi biết app vẫn đang làm việc chứ không treo. Nút **"Huỷ"** để dừng chuỗi retry giữa chừng nếu người chơi không muốn chờ.
- **Khi hết số lần thử mà vẫn lỗi:** dừng lại, hiện thông báo lỗi rõ ràng (mã lỗi + gợi ý xử lý: "Đã thử 5 lần vẫn lỗi 429 — máy chủ quá tải, thử lại sau hoặc thêm API key khác") + nút **"Thử lại"** thủ công để người chơi tự khởi động lại chuỗi. Lượt chơi/state KHÔNG bị hỏng: vì state chỉ cập nhật sau khi có phản hồi hợp lệ (mục 6.2), 1 lần gọi thất bại hoàn toàn không làm sai lệch bảng trạng thái — người chơi chỉ cần thử lại.
- **Timeout hợp lý:** đặt ngưỡng timeout cho mỗi request (chỉnh được, mặc định vừa phải), và với streaming — nếu không nhận được chunk nào trong khoảng thời gian nhất định thì coi là gãy và retry.

---

## 3. Import Preset SillyTavern & Prompt Builder

### 3.1 Import preset
Đọc file `.json` Chat Completion preset ST, parse các field: `prompt_order[]` (mỗi item có `identifier`, `enabled`), danh sách `prompts[]` (mỗi prompt có `identifier`, `name`, `role`, `content`, `system_prompt`, `injection_position`, `injection_depth`). **Đặc tả đầy đủ ở mục 3.1b bên dưới.**

### 3.1b Import Preset SillyTavern — đặc tả đầy đủ (để preset nhập vào chạy được thật)

Mục 3.1 tóm tắt; mục này đặc tả **đầy đủ** cách nhập một file preset ST Chat Completion (như `Tawa_δέλτα.json`) sao cho pipeline prompt hoạt động đúng khi người dùng nạp preset có sẵn. Đây là tính năng tương thích **bắt buộc chuẩn xác** (mục 1) — người dùng đã có preset MVU phức tạp và muốn dùng lại. Đặt trong `engine/preset/`.

#### 3.1b.1 Cấu trúc file preset ST (những field engine PHẢI đọc)

File preset là JSON gồm hai phần quan trọng nhất: **danh sách `prompts[]`** và **`prompt_order[]`** (thứ tự + bật/tắt). Ngoài ra là các tham số sampling.

```ts
// engine/preset/presetSchema.ts — Zod schema validate preset ST khi import (fail mềm, không crash)
const STPromptSchema = z.object({
  identifier: z.string(),                    // UUID hoặc tên marker ("main", "chatHistory"...)
  name: z.string().prefault(""),
  content: z.string().prefault(""),          // nội dung prompt, chứa macro {{...}}
  role: z.enum(["system","user","assistant"]).prefault("system"),
  enabled: z.boolean().prefault(true),
  marker: z.boolean().prefault(false),       // TRUE = placeholder hệ thống (xem 3.1b.2), content thường rỗng
  system_prompt: z.boolean().prefault(false),
  injection_position: z.union([z.literal(0), z.literal(1), z.null()]).prefault(null),
  injection_depth: z.coerce.number().int().prefault(4),
  injection_order: z.coerce.number().int().prefault(100),
  forbid_overrides: z.boolean().prefault(false),
}).passthrough();  // giữ field lạ để round-trip export không mất

const STPresetSchema = z.object({
  prompts: z.array(STPromptSchema).prefault([]),
  prompt_order: z.array(z.object({
    character_id: z.coerce.number().optional(),
    order: z.array(z.object({ identifier: z.string(), enabled: z.boolean().prefault(true) })),
  })).prefault([]),
  // tham số sampling (map sang cấu hình API mục 2):
  temperature: z.coerce.number().optional(),
  top_p: z.coerce.number().optional(), top_k: z.coerce.number().optional(),
  frequency_penalty: z.coerce.number().optional(), presence_penalty: z.coerce.number().optional(),
  min_p: z.coerce.number().optional(), top_a: z.coerce.number().optional(),
  repetition_penalty: z.coerce.number().optional(),
  openai_max_tokens: z.coerce.number().optional(), openai_max_context: z.coerce.number().optional(),
  assistant_prefill: z.string().optional(),      // prefill câu trả lời (mục 2)
  wi_format: z.string().optional(),              // template bọc world info
  scenario_format: z.string().optional(), personality_format: z.string().optional(),
  // ... các field khác giữ qua passthrough
}).passthrough();
```
- **Fail mềm:** `safeParse`; field thiếu → prefault; preset lỗi một phần → nạp phần hợp lệ + cảnh báo, KHÔNG crash. Field không hiểu (vd `tool_reasoning_mode`) giữ nguyên qua `passthrough` để export lại không mất.
- **Sampling → cấu hình API (mục 2):** map `temperature`/`top_p`/`top_k`/`frequency_penalty`/... vào request. Tham số provider không hỗ trợ thì bỏ qua (Anthropic không có `top_a`...) — không lỗi.

#### 3.1b.2 Marker prompts — 8 placeholder hệ thống PHẢI hiểu đúng

Preset ST không nhét thẳng world info / mô tả nhân vật / lịch sử chat vào `content`. Nó dùng **marker prompt** (`marker: true`, content rỗng) làm **vị trí chèn**. Engine gặp identifier marker thì thay bằng nội dung tương ứng do app dựng. Đây là mắt xích khiến pipeline chạy đúng — bỏ qua thì world info/history không vào prompt.

| identifier marker | Engine thay bằng | Nguồn |
|---|---|---|
| `worldInfoBefore` | Lore active chèn TRƯỚC (position "before") | lorebook engine (mục 4) sau khi quét từ khoá + render EJS (5.5b) |
| `worldInfoAfter` | Lore active chèn SAU | như trên, entry position "after" |
| `charDescription` | Mô tả nhân vật/thế giới đang chơi | character card (mục 8) / persona |
| `charPersonality` | Tính cách nhân vật chính | persona |
| `personaDescription` | Mô tả persona người chơi | persona người chơi |
| `scenario` | Bối cảnh/tình huống hiện tại | Era + starting hook (mục 8) |
| `dialogueExamples` | Ví dụ hội thoại (few-shot) | character card |
| `chatHistory` | Lịch sử hội thoại | **chèn theo ngân sách ưu tiên 16bis.5** (T4 chat thô + T3 tóm tắt) |

> **Điểm tích hợp then chốt:** marker `worldInfoBefore/After` là nơi RAG lorebook (mục 4) bơm nội dung vào; marker `chatHistory` là nơi hệ trí nhớ dài hạn (16bis) quyết định chèn bao nhiêu chat thô + tóm tắt. Nghĩa là preset ST định **khung thứ tự**, còn app điền nội dung động vào các marker — hai thứ khớp nhau ở đây. Marker khác (`charDescription`...) điền từ character card / persona / Era.
>
> Với các block **không phải marker** (prompt thường, có `content` + macro), engine render macro (3.2/3.1b.3) rồi push nguyên văn theo `role`.

#### 3.1b.3 Macro state ST — nối thẳng vào MVU (điểm mấu chốt của preset MVU)

Preset MVU (như file mẫu) dùng dày đặc macro **đọc/ghi biến** — đây chính là cách preset điều khiển state. Engine phải hỗ trợ đầy đủ họ macro này, nối vào **MVU store (mục 5)**, nếu không preset MVU vô dụng:

| Macro | Ý nghĩa | Nối vào |
|---|---|---|
| `{{setvar::key::value}}` | Đặt biến (ghi) | MVU store — `stat_data[key] = value` (hoặc vùng biến preset riêng, xem dưới) |
| `{{getvar::key}}` | Đọc biến | đọc từ MVU store |
| `{{addvar::key::value}}` | Cộng dồn vào biến (thường nối chuỗi/số) | MVU store |
| `{{setglobalvar::key::value}}` / `{{getglobalvar::key}}` | Biến toàn cục (xuyên chat) | store toàn cục riêng (Dexie), KHÔNG thuộc save một ván |
| `{{incvar::key}}` / `{{decvar::key}}` | Tăng/giảm 1 | MVU store |
| `{{var::key}}` | Đọc biến cục bộ tạm | scratch scope trong 1 lần build |

- **Hai vùng biến, tránh nhầm với `mvu_update`:** macro `setvar/getvar` trong preset thao tác một **không gian biến preset** (giống ST: `variables`), engine ánh xạ nó lên MVU store. Điều này **khác** khối `mvu_update` do AI trả (mục 5.2) — `mvu_update` là patch có kiểm soát (5 op, extractor lọc `_`/nhãn bậc ở 5.4c); còn `setvar` trong preset là khởi tạo/điều khiển do **tác giả preset** viết, chạy lúc build prompt. Engine coi biến preset và `stat_data` là **cùng một store** (để `getvar` trong lore EJS ở 5.5b đọc được cả hai), nhưng đường ghi khác nhau: preset `setvar` ghi lúc render; AI ghi qua `mvu_update` lúc hậu xử lý. Không xung đột vì khác thời điểm.
- **Thứ tự chạy quan trọng:** prompt "Khởi tạo biến" (như trong file mẫu, đầy `{{setvar}}`) thường đứng ĐẦU `prompt_order` → chạy trước để set các biến (format, ngôn ngữ, quy tắc) mà các prompt sau `{{getvar}}` đọc. Engine render macro **theo đúng thứ tự block trong prompt_order**, trái→phải, trên→dưới, nên setvar trước getvar hoạt động tự nhiên.
- **Macro không nhận diện được:** giữ nguyên văn (không xoá) + log cảnh báo, để tác giả preset thấy và người chơi không mất nội dung. Đăng ký thêm macro qua registry (3.2) mà không sửa core.

#### 3.1b.4 Dựng lại pipeline từ prompt_order

```
buildFromPreset(preset, ctx):   // mở rộng thuật toán 3.3
  activeOrder = preset.prompt_order[0].order.filter(o => o.enabled)   // theo character_id đang dùng
  messages = []
  for o in activeOrder:
    block = preset.prompts.find(p => p.identifier === o.identifier)
    if !block or !block.enabled: continue
    if block.marker:
      messages.push( resolveMarker(block.identifier, ctx) )   // 3.1b.2 — điền world info/history/persona...
    else:
      rendered = renderMacros(block.content, ctx)             // 3.1b.3 + macro engine 3.2
      if rendered.trim(): messages.push({ role: block.role, content: rendered })
  // xử lý injection_position: block có injection_position=1 (in-chat @ depth) chèn XEN vào chatHistory
  //   ở độ sâu injection_depth thay vì nối tuần tự; injection_order phân giải khi nhiều block cùng depth
  applyDepthInjections(messages, preset.prompts, ctx)
  return applyPrefill(messages, preset.assistant_prefill)
```
- **`injection_position`:** `0`/`null` = chèn tuần tự theo vị trí trong prompt_order (relative). `1` = **inject vào trong lịch sử chat** ở độ sâu `injection_depth` (đếm ngược từ tin nhắn mới nhất) — dùng cho prompt cần đặt gần cuối hội thoại (jailbreak, nhắc định dạng). `injection_order` phân giải thứ tự khi nhiều block cùng depth.
- **`assistant_prefill`:** nếu preset có, chèn làm phần đầu câu trả lời của assistant (nối cấu hình prefill mục 2) — nhiều preset MVU dùng để ép model bắt đầu bằng khối suy nghĩ/định dạng cố định.
- **Kết hợp hệ trí nhớ (16bis.5):** khi tới marker `chatHistory`, KHÔNG đổ toàn bộ log — gọi bộ cấp phát ngân sách ưu tiên (16bis.5) để quyết định chèn bao nhiêu chat thô (T4) + tóm tắt (T3) vừa với context. Đây là chỗ preset ST (khung) và app (nội dung động) hợp nhất.

#### 3.1b.5 Lưu trữ, quản lý & round-trip

- **Lưu vào Dexie** bảng `presets` (mục 20): giữ nguyên JSON gốc (`rawJson`) + bản đã parse. Người dùng nhập nhiều preset, chọn preset active trong Settings→Prompt (mục 21).
- **Round-trip export:** xuất lại đúng cấu trúc ST (`passthrough` giữ field lạ) để preset chỉnh trong app vẫn mở được ở SillyTavern gốc — tôn trọng ecosystem người dùng đang dùng.
- **Prompt Inspector (3.4):** hiển thị pipeline cuối cùng dựng từ preset (thứ tự block, marker đã điền gì, macro đã resolve ra sao, block nào bị injection_depth chèn vào đâu) — để người dùng debug preset của họ, thấy chính xác cái gì gửi cho model.
- **Không nhét prompt engine của app vào preset người dùng:** các prompt hệ thống riêng của app (hướng dẫn cập nhật bảng 5.4b, bút pháp tường thuật 7.11, prompt tóm tắt 16bis.2...) là **lớp riêng** app tự quản, ghép CÙNG pipeline preset chứ không sửa file preset người dùng. Người dùng đổi preset thì các lớp engine này vẫn còn.

> **Tóm lại luồng "nhập preset → chạy được":** đọc JSON → validate mềm (3.1b.1) → lưu Dexie → khi build mỗi lượt: đi theo `prompt_order`, render macro nối MVU store (3.1b.3), điền 8 marker bằng nội dung động của app gồm lore RAG + trí nhớ (3.1b.2/3.1b.4), xử lý depth-injection + prefill → gửi model. Preset MVU phức tạp của người dùng chạy y như trên ST, cộng thêm engine giữ-số của app bọc quanh.

### 3.2 Macro engine
Thiết kế theo **registry pattern** — đăng ký macro mới không sửa core resolver:
```ts
type MacroFn = (ctx: MacroContext) => string;
const macroRegistry = new Map<string, MacroFn>();
registerMacro("char", (ctx) => ctx.character.name);
registerMacro("user", (ctx) => ctx.persona.name);
registerMacro("random", (ctx, args) => {
  const options = args.split(",");
  return options[Math.floor(ctx.rng() * options.length)];
});
registerMacro("roll", (ctx, args) => String(rollDice(args, ctx.rng))); // vd {{roll:d20}}
```
Macro bắt buộc: `{{char}}`, `{{user}}`, `{{persona}}`, `{{description}}`, `{{personality}}`, `{{scenario}}`, `{{mesExamples}}`, `{{time}}`, `{{date}}`, `{{random:a,b}}`, `{{roll:d20}}`, `{{lastMessage}}`, `{{newline}}`, `{{trim}}`, `{{// comment}}` (loại bỏ khỏi output cuối).

### 3.3 Thuật toán ghép prompt (pseudocode)
```
buildPrompt():
  1. story_string = renderMacros(character_card.story_string_template)
  2. world_info_before, world_info_after, world_info_depth[] = loreEngine.getActiveEntries(recentMessages)
  3. example_dialogue = renderMacros(character_card.mes_example)
  4. history = chatHistory.slice(...).filter(within contextBudget)
     - cắt từ tin nhắn CŨ NHẤT trước, giữ lại tin nhắn gần nhất
     - nếu vẫn vượt budget sau khi cắt hết history → cảnh báo user
  5. messages = []
  for block in prompt_order (theo enabled=true):
     switch block.identifier:
       "worldInfoBefore" -> push(world_info_before)
       "charDescription" -> push(story_string phần liên quan)
       "chatHistory" -> push(...history, interleaved with world_info_depth theo đúng depth)
       "dialogueExamples" -> push(example_dialogue)
       default -> push(renderMacros(block.content), role=block.role)
  6. return messages (đã đếm token qua tokenizer)
```

### 3.4 Prompt Inspector
Panel hiện: (a) raw JSON `messages[]` cuối cùng sẽ gửi, (b) token count từng block + tổng, (c) cảnh báo nếu vượt `max context tokens`, (d) nút "Copy raw payload" để debug.

---

## 4. Lorebook / World Info Engine

### 4.1 Cấu trúc entry (ví dụ)
```json
{
  "keys": ["Winterfell", "Ngôi nhà Stark"],
  "secondary_keys": ["lãnh chúa", "phương Bắc"],
  "content": "Winterfell là lâu đài chính của Nhà Stark...",
  "comment": "Winterfell - địa danh",
  "insertion_order": 100,
  "position": "before_char",
  "constant": false,
  "selective": true,
  "selectiveLogic": "AND",
  "case_sensitive": false,
  "probability": 100,
  "excludeRecursion": false,
  "preventRecursion": false,
  "scan_depth": 4
}
```

### 4.2 Thuật toán trigger (pseudocode)
```
getActiveEntries(recentMessages):
  scanText = last N messages joined (N = scan_depth lớn nhất trong toàn bộ lorebook)
  active = []
  for entry in lorebook.entries (sorted by insertion_order):
    if entry.constant: active.push(entry); continue
    if not entry.selective: continue
    matched = matchKeys(entry.keys, entry.secondary_keys, entry.selectiveLogic, scanText, entry.case_sensitive)
    if matched and roll(entry.probability): active.push(entry)
  # đệ quy: quét lại scanText + content của entry vừa active, giới hạn maxRecursionDepth (vd 3)
  # tránh vòng lặp: entry đã active 1 lần trong cùng request không active lại (trừ khi excludeRecursion=false cho phép)
  return groupByPosition(active) // {before_char, after_char, atDepth: Map<depth, entry[]>}
```

### 4.3 Tích hợp lore vào app (KHÔNG cần xây UI quản lý lorebook)

**Làm rõ phạm vi:** người dùng sẽ **tự cung cấp toàn bộ lore cho app** (file lorebook/world info) khi làm tới phần này. Nhiệm vụ ở đây **KHÔNG phải** xây một giao diện quản lý/chỉnh sửa lorebook cho người chơi, mà là đảm bảo **engine nạp lore đó vào và vận hành hiệu quả** — lore chảy đúng vào prompt để AI dùng, đúng cơ chế trigger, không tràn context. Đây là hạ tầng ngầm, không phải màn hình người chơi thao tác.

Yêu cầu kỹ thuật của lớp tích hợp:
- **Nạp lore:** đọc file lorebook người dùng cung cấp (định dạng ST world_info / character_book JSON), parse về cấu trúc entry nội bộ (mục 4.1). Hỗ trợ nạp nhiều nguồn cùng lúc (vd lore nền Westeros chung + lore riêng theo Thời Kỳ/Nhà) và gộp lại; khi trùng key giữa các nguồn, xử lý theo `insertion_order` và log để dev biết.
- **Trigger đúng & hiệu quả:** engine quét keyword theo `scan_depth`, kích hoạt entry đúng vị trí/thứ tự (mục 4.2), đệ quy có giới hạn — đây là phần quan trọng nhất, phải chạy chính xác vì chất lượng nhập vai phụ thuộc việc đúng lore được đưa vào đúng lúc.
- **EJS động (bắt buộc — xem mục 5.5b):** lore người dùng cung cấp nhiều khả năng chứa template EJS (điều kiện hóa nội dung theo state, nạp entry con theo `getwi`, đọc biến qua `getvar`). Engine phải render EJS trên nội dung entry active tại lúc build prompt, cung cấp các hàm cầu nối tới MVU store + lorebook store. Đây là điều kiện tiên quyết để lore "sống" theo diễn biến, không phải tính năng phụ.
- **Quản lý ngân sách token:** giới hạn tổng token lore active mỗi turn (vd không vượt X% context budget); khi vượt, ưu tiên giữ entry `constant` + entry khớp mạnh nhất, cắt bớt entry yếu, log cảnh báo cho dev.
- **Chỗ nạp lore trong luồng:** lore người dùng cung cấp có thể đặt trong thư mục nội dung (`content/westeros/lore/`) để đóng gói sẵn khi build, HOẶC nạp runtime — thiết kế linh hoạt để lúc người dùng đưa file thật vào chỉ việc thả đúng chỗ, không phải sửa code engine.
- **Công cụ dev (không phải UI người chơi):** giữ ở mức debug panel ẩn (bật trong Settings > verbose logging mục 21) để dev/người dựng lore kiểm tra "entry nào đang active turn này + vì sao" khi cần chỉnh lore — KHÔNG phải màn hình chính cho người chơi cuối. Người chơi bình thường không cần thấy cỗ máy lore; họ chỉ cảm nhận kết quả (AI nắm đúng bối cảnh).

Tinh thần: **khi người dùng đưa lore vào, nó phải "chạy" ngay và đúng** — đó là toàn bộ mục tiêu của phần này. Không đầu tư công sức vào giao diện chỉnh sửa lorebook.

---

## 5. Engine biến trạng thái MVU-ZOD (giống TavernHelper) — TRỌNG TÂM

### 5.1 Ví dụ schema Zod (rút gọn, làm khung tham khảo)

Mẫu dưới đây theo đúng phong cách schema MVU-ZOD thực tế đã dùng cho các card trước đó — có 3 pattern nền tảng nên áp dụng nhất quán cho toàn bộ schema (kể cả các hệ thống mở rộng ở mục 10–13):

**a) Helper `safeString()`** — chặn lỗi khi AI trả về object/number ở field lẽ ra là string:
```ts
const safeString = () => z.preprocess(
  (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") { try { return JSON.stringify(val); } catch { return String(val); } }
    return String(val);
  },
  z.string()
);
```

**b) Pattern chỉ số bị chặn (clamp)** — dùng cho mọi stat dạng số có khoảng giá trị cố định, tránh AI trả số âm/vượt trần:
```ts
const clampedStat = (min: number, max: number, def: number) =>
  z.coerce.number().transform(v => _.clamp(v, min, max)).prefault(def);
```

**c) Pattern "bộ sưu tập động theo tên"** — dùng `z.record()` thay vì mảng cố định cho mọi tập hợp mà AI cần tự thêm phần tử mới theo diễn biến truyện (NPC, phe phái, tài sản, đơn vị quân, lãnh địa...):
```ts
const NpcSchema = z.object({
  "Tuổi": z.coerce.number(),
  "Độ Hảo Cảm": clampedStat(-100, 100, 0),
  "Chức Vụ": safeString(),
  "Đánh Giá": safeString(),      // AI tự viết nhận xét ngắn về NPC này
  "Giải Thích": safeString(),    // AI tự giải thích lý do độ hảo cảm hiện tại
  "Người Thừa Kế": z.boolean().prefault(false),
  "Đã Kết Hôn Với": safeString().optional(),
});

const StatDataSchema = z.object({
  "Chế Độ Hiện Tại": z.enum(["Chế Độ Nhập Vai", "Chế Độ Chiến Tranh"]).prefault("Chế Độ Nhập Vai"),

  "Cài Đặt Ván": z.object({   // chọn lúc New Game (mục 8.3), ảnh hưởng cách AI hành xử — engine + system prompt đọc
    "Chế Độ Tường Thuật": z.enum(["Theo Sát Nguyên Tác", "Diễn Giải Tự Do"]).prefault("Diễn Giải Tự Do"), // mức bám lore (8.3 bước 3)
    "Hướng Kịch Bản": z.enum(["Người Chơi Là Trung Tâm", "Người Chơi Là Bối Cảnh"]).prefault("Người Chơi Là Trung Tâm"), // ai điều khiển lịch sử (8.3 bước 4)
    "Độ Khó Chiến Đấu": z.enum(["Nhàn Hạ", "Cân Bằng", "Chân Thực"]).prefault("Cân Bằng"), // mục 7.9.6
    "Thời Kỳ": safeString().optional(),  // id Era đang chơi (mục 8.2)
  }).prefault({}),

  "Thông Tin Nhân Vật": z.object({
    "Họ Tên": safeString().prefault("Vô Danh"),
    "Nhà": z.enum(["Stark", "Lannister", "Targaryen", "Baratheon", "Greyjoy", "Tyrell", "Martell", "Arryn", "Tully", "Không Nhà"]).prefault("Không Nhà"),
    "Cấp Độ": z.coerce.number().int().min(1).prefault(1),
    "Kinh Nghiệm": z.coerce.number().min(0).prefault(0),
    "Vàng": z.coerce.number().min(0).prefault(0),
  }).prefault({}),

  "Chỉ Số Sinh Tồn": z.object({
    // Trần 100 dưới đây là PLACEHOLDER cho khung rút gọn. Khi dùng schema đầy đủ 5.1f,
    // engine override trần bằng "_HP Tối Đa"/"_Thể Lực Tối Đa" (5.1f-B, tính từ Thể Chất+Cấp+trang bị).
    "HP": clampedStat(0, 100, 100),
    "Thể Lực": clampedStat(0, 100, 100),
    "Pháp Lực": clampedStat(0, 100, 0),   // chỉ >0 nếu có thiên phú ma thuật + Era cho phép (5.1f)
  }).prefault({}),

  // ⚠ KHỐI 4-TRỤC NÀY LÀ KHUNG RÚT GỌN — schema đầy đủ dùng 6 CHỈ SỐ CỐT LÕI ở 5.1f-A
  //   (Sức Mạnh/Nhanh Nhẹn/Thể Chất/Trí Tuệ/Tinh Tường/Uy Tín, thang 1-20). Khi implement,
  //   DÙNG 5.1f thay khối này. Ánh xạ tương đương cho các mục cũ tham chiếu 4-trục:
  //   Võ Lực→Sức Mạnh(+kỹ năng vũ khí) · Thống Soái→kỹ năng Chỉ Huy Quân · Ngoại Giao→Uy Tín · Âm Mưu→Trí Tuệ(+Mưu Lược).
  "Thuộc Tính Năng Lực": z.object({
    "Võ Lực": clampedStat(-100, 100, 0),
    "Thống Soái": clampedStat(-100, 100, 0),
    "Ngoại Giao": clampedStat(-100, 100, 0),
    "Âm Mưu": clampedStat(-100, 100, 0),
  }).prefault({}),

  "Túi Đồ": z.record(safeString().describe("Tên vật phẩm"), z.object({
    "Số Lượng": z.coerce.number().int().min(0).prefault(1),
    "Mô Tả": safeString(),
  })).prefault({}),

  "Mối Quan Hệ": z.object({
    "NPC Chính": z.record(safeString().describe("Họ tên NPC"), NpcSchema).prefault({}),
    "Thành Viên Gia Tộc": z.record(safeString().describe("Họ tên"), NpcSchema).prefault({}),
  }).prefault({}),

  "Thái Độ Các Nhà": z.record(
    safeString().describe("Tên Nhà"),
    z.object({
      "Thái Độ": z.enum(["Tín Nhiệm", "Ủng Hộ", "Cảnh Giác", "Dao Động", "Bất Mãn", "Địch Ý", "Thù Địch"]).prefault("Cảnh Giác"),
      "Mô Tả": safeString(),
    })
  ).prefault({}),

  "Thế Giới": z.object({
    "Vị Trí": safeString().prefault("Winterfell"),
    "Năm": z.coerce.number().int().prefault(298), // 298 AC = mốc khởi truyện AGOT
    "Mùa": z.enum(["Xuân", "Hạ", "Thu", "Đông"]).prefault("Hạ"),
    "Thời Tiết": safeString().prefault("Quang đãng"),
  }).prefault({}),

  // Các field dưới đây được định nghĩa chi tiết ở mục 10-13 (Lãnh Địa, Biên Chế Quân Sự,
  // Quan Hệ Ngoại Giao, Tiểu Hội Đồng...) — cùng nằm trong StatDataSchema này, không phải schema riêng.

  "_engineMeta": z.object({ // prefix _ = readonly, chỉ engine ghi
    "turnCount": z.coerce.number().prefault(0),
    "_Seed Gốc": z.coerce.number().int().prefault(0), // seed gốc của ván — cố định lúc tạo nhân vật, mọi roll dẫn xuất từ đây (mục 5bis.1)
  }).prefault({}),
}).prefault({});
```
Field dạng `z.record()` (Túi Đồ, NPC, Thái Độ Các Nhà) cho phép AI tự thêm phần tử mới bằng `op: "replace"` với path tới key mới (vd `stat_data.Túi Đồ.Kiếm Valyria`) — không cần định nghĩa trước toàn bộ danh sách item/NPC có thể xuất hiện, rất hợp với roleplay mở.

> Khung 5.1 ở trên là tối thiểu. Hệ nhân vật **đầy đủ** — 6 chỉ số cốt lõi + chỉ số phái sinh, hệ Thiên Phú, hệ Kỹ Năng có cấp, Trang Bị theo slot, điểm thăng tiến — được định nghĩa ở **mục 5.1f** (và dùng trong wizard tạo nhân vật 8.5). Khi implement, dùng schema 5.1f thay cho `Thuộc Tính Năng Lực` 4-trục rút gọn ở đây.

### 5.1b NpcSchema chi tiết — chân dung, tuổi tác, giai đoạn hảo cảm (hợp nhất mọi field NPC)

`NpcSchema` ở mục 5.1 là khung tối thiểu; mục 16.1–16.2 đã thêm Ký Ức + Tính Cách. Mục này **gom toàn bộ thành một schema NPC đầy đủ, giàu chi tiết** — vì NPC là trái tim của roleplay ASOIAF (quan hệ, chính trị, hôn nhân, phản bội đều xoay quanh NPC). Đây là schema hợp nhất, các mục 16.x coi như tham chiếu về đây:

```ts
// engine/mvu/npcSchema.ts — NpcSchema ĐẦY ĐỦ (thay khung rút gọn ở 5.1)
const NpcSchema = z.object({

  // ── ĐỊNH DANH & CHÂN DUNG ──
  "Họ Tên": safeString().prefault("Vô Danh"),
  "Biệt Danh": safeString().optional(),                 // "Quỷ Lùn", "Sát Vương", "Mẹ Rồng"...
  "Nhà": safeString().optional(),                       // để string (không enum) vì NPC có thể thuộc Nhà nhỏ/Essos/không rõ
  "Chức Vụ": safeString(),                              // "Lãnh chúa Winterfell", "Học sĩ", "Đội trưởng Vệ binh"...
  "Ảnh Chân Dung": safeString().optional(),             // đường dẫn/khoá ảnh do người chơi cung cấp (xem 5.1c)
  "Huy Hiệu": safeString().optional(),                  // khoá SVG huy hiệu Nhà (thư viện ui/icons, mục mỹ thuật 2)

  // ── TUỔI TÁC (động, trôi theo thời gian truyện) ──
  "Tuổi": z.coerce.number().int().min(0).prefault(25),
  "Năm Sinh": z.coerce.number().int().optional(),       // theo lịch AC/BC; nếu có, engine tự tính lại Tuổi khi Năm đổi
  "Giai Đoạn Đời": z.enum([
    "Ấu Nhi",        // 0-5
    "Thiếu Niên",    // 6-12
    "Thiếu Niên Lớn",// 13-17 (đã có thể cầm quân/kết hôn theo lệ Westeros)
    "Trưởng Thành",  // 18-39
    "Trung Niên",    // 40-59
    "Lão Niên",      // 60+
  ]).prefault("Trưởng Thành"),
  "Còn Sống": z.boolean().prefault(true),
  "Nguyên Nhân Nếu Mất": safeString().optional(),       // trận đánh, ám sát, bệnh, tuổi già...

  // ── QUAN HỆ VỚI NGƯỜI CHƠI (hảo cảm + giai đoạn) ──
  "Độ Hảo Cảm": clampedStat(-100, 100, 0),
  "Giai Đoạn Quan Hệ": z.enum([
    "Tử Thù",        // -100..-70
    "Thù Địch",      // -69..-40
    "Ác Cảm",        // -39..-15
    "Xa Lạ",         // -14..14
    "Quen Biết",     // 15..39
    "Thân Thiết",    // 40..64
    "Tri Kỷ",        // 65..84
    "Sống Chết Có Nhau", // 85..100
  ]).prefault("Xa Lạ"),
  "Loại Quan Hệ": z.array(z.enum([
    "Đồng Minh","Kẻ Thù","Bằng Hữu","Cấp Trên","Thuộc Hạ","Người Thân",
    "Vợ/Chồng","Hôn Ước","Tình Nhân","Đối Thủ","Ân Nhân","Con Nợ","Thầy","Trò",
  ])).prefault([]),
  "Tin Cậy": clampedStat(-100, 100, 0),                 // TÁCH khỏi Hảo Cảm: có thể quý mến nhưng không tin (và ngược lại)
  "Đánh Giá": safeString(),                             // AI tự viết nhận xét ngắn về NPC
  "Giải Thích": safeString(),                           // AI tự giải thích lý do hảo cảm/thái độ hiện tại

  // ── KÝ ỨC (từ mục 16.1) ──
  "Ký Ức": z.array(z.object({
    "Turn": z.coerce.number().int(),
    "Năm": z.coerce.number().int().optional(),
    "Sự Việc": safeString(),
    "Cảm Xúc": z.enum(["Biết Ơn","Oán Hận","Ngưỡng Mộ","Sợ Hãi","Khinh Thường","Yêu Mến","Ghen Tị","Trung Lập"]),
    "Trọng Số": clampedStat(0, 100, 50),
  })).prefault([]),
  "Lời Hứa Chưa Giữ": z.array(safeString()).prefault([]),

  // ── TÍNH CÁCH (từ mục 16.2, 4 trục) ──
  "Tính Cách": z.object({
    "Trục Thiện-Ác": clampedStat(-100, 100, 0),
    "Trục Can Đảm-Hèn Nhát": clampedStat(-100, 100, 0),
    "Trục Trung Thành-Phản Trắc": clampedStat(-100, 100, 0),
    "Trục Nóng Nảy-Điềm Tĩnh": clampedStat(-100, 100, 0),
  }).prefault({}),
  "Nét Tính Cách": z.array(safeString()).prefault([]),  // tag tự do: "kiêu ngạo","trọng danh dự","tham lam","mưu mô"...
  "Cung Bậc Phát Triển": safeString().optional(),       // character arc, AI ghi chú

  // ── NĂNG LỰC (nếu NPC là tướng/nhân vật quan trọng — nối 7.7 GeneralSchema) ──
  "Năng Lực": z.object({
    "Võ Lực": clampedStat(0, 100, 30),
    "Thống Soái": clampedStat(0, 100, 30),
    "Trí Mưu": clampedStat(0, 100, 30),
    "Ngoại Giao": clampedStat(0, 100, 30),
  }).prefault({}),

  // ── GIA TỘC / KẾ VỊ (nối 13.4 hôn nhân-kế vị) ──
  "Người Thừa Kế": z.boolean().prefault(false),
  "Thứ Bậc Kế Vị": z.coerce.number().int().optional(),  // 1 = thừa kế trực tiếp
  "Đã Kết Hôn Với": safeString().optional(),
  "Hôn Ước Với": safeString().optional(),
  "Cha/Mẹ": z.array(safeString()).prefault([]),
  "Con Cái": z.array(safeString()).prefault([]),
  "Anh Chị Em": z.array(safeString()).prefault([]),

  // ── TRẠNG THÁI HIỆN TẠI ──
  "Vị Trí Hiện Tại": safeString().optional(),           // territoryId, đồng bộ bản đồ mục 9
  "Tình Trạng": z.enum(["Bình Thường","Bị Thương","Lâm Bệnh","Bị Giam","Lưu Vong","Mất Tích"]).prefault("Bình Thường"),
  "Mục Tiêu Cá Nhân": safeString().optional(),          // nối 16.3 off-screen sim
  "$Ghi Chú Ẩn": safeString().optional(),               // $ = AI đọc/ghi được nhưng ẩn khỏi UI (bí mật NPC đang giấu)
});

// giữ nguyên cách gắn vào StatDataSchema ở 5.1:
//   "NPC Chính": z.record(safeString(), NpcSchema).prefault({})
//   "Thành Viên Gia Tộc": z.record(safeString(), NpcSchema).prefault({})
```

**Ghi chú thiết kế:**
- **Tin Cậy tách khỏi Hảo Cảm** — bản gốc chỉ có 1 trục Độ Hảo Cảm. Nhưng ASOIAF đầy tình huống "quý mà không tin" (Ned quý Littlefinger? không) hoặc "ghét mà phải tin dùng". Hai trục cho phép AI diễn quan hệ tinh tế hơn, và cả hai đều đưa vào prompt.
- **Prefix `$`** cho `$Ghi Chú Ẩn` — theo quy ước mục 5.3 ($ = ẩn khỏi UI, AI vẫn đọc/ghi). Dùng cho bí mật NPC (âm mưu ngầm, thân phận thật kiểu Jon Snow) mà người chơi chưa được biết.
- **`Nhà` để `safeString().optional()` không phải enum** — vì qua nhiều Era, NPC có thể thuộc Nhà đã tuyệt tự, Nhà Essos, hoặc vô danh; enum cứng sẽ vỡ. Enum `Nhà` chỉ dùng cho **nhân vật chính** (mục 5.1) nơi ta kiểm soát được.

### 5.1c Ảnh chân dung NPC (người chơi cung cấp)

Người chơi cung cấp ảnh cho NPC (bạn nói sẽ đưa ảnh). Cơ chế:

- **Lưu trữ:** ảnh lưu trong **Dexie/IndexedDB** (mục 1) dưới dạng Blob, key ổn định (vd `npc-portrait:<npcId>` hoặc hash nội dung). Field `"Ảnh Chân Dung"` trong `NpcSchema` chỉ giữ **khoá tham chiếu** (string) tới ảnh trong Dexie, **không** nhúng base64 vào state MVU (giữ `stat_data` gọn nhẹ để snapshot/reroll ở mục 5.3 không phình).
- **Nguồn ảnh:** (a) người chơi upload trực tiếp khi tạo/sửa NPC trong một **NPC Editor**; (b) gán ảnh cho canon character khi seed Era; (c) kéo-thả ảnh vào thẻ NPC trong Relationships panel.
- **Hiển thị:** avatar tròn/khung kính mờ (glassmorphism, mục mỹ thuật 3) ở: Relationships panel (mục 6), thẻ NPC khi xuất hiện trong chat, sơ đồ quan hệ (13.5), thẻ `<council_session>`/`<raven_scroll>` khi NPC đó gửi/tham dự. Không có ảnh → fallback **avatar SVG sinh tự động** từ huy hiệu Nhà + chữ cái đầu tên (không để trống, không emoji).
- **Xử lý:** resize/nén ảnh về kích thước avatar hợp lý (vd ≤512px, WebP) trước khi lưu để tiết kiệm dung lượng IndexedDB; giữ 1 bản thumbnail nhỏ cho list.
- **Export/import save (mục 20):** ảnh NPC đi kèm trong gói export (Blob → base64 trong file save JSON/zip) để round-trip không mất chân dung; import khôi phục lại vào Dexie.
- **An toàn:** ảnh người chơi tự cung cấp, không kiểm duyệt nội dung, nhưng vẫn qua bước tạo Object URL an toàn, không thực thi gì từ file ảnh.

### 5.1d Giai đoạn hảo cảm — engine tự chuyển bậc & ngưỡng cửa

`Độ Hảo Cảm` là số (−100..100); `Giai Đoạn Quan Hệ` là **nhãn bậc** engine tự suy ra từ số đó (đừng để AI tự set nhãn — dễ lệch). Engine chạy sau mỗi patch đổi Hảo Cảm:

```ts
// engine/npc/affinityStage.ts
function affinityStage(v: number): string {
  if (v <= -70) return "Tử Thù";
  if (v <= -40) return "Thù Địch";
  if (v <= -15) return "Ác Cảm";
  if (v <   15) return "Xa Lạ";
  if (v <   40) return "Quen Biết";
  if (v <   65) return "Thân Thiết";
  if (v <   85) return "Tri Kỷ";
  return "Sống Chết Có Nhau";
}
```
**Ngưỡng cửa (threshold) mở/khoá hành động** — mỗi bậc mở khả năng mới, tạo cảm giác quan hệ "tiến triển" thật (nối Action Deck 6.3 & chính trị/hôn nhân 13–14):
| Bậc | Hảo Cảm | Mở khoá |
|---|---|---|
| Tử Thù | ≤ −70 | NPC chủ động hãm hại/ám sát bạn; không đàm phán thường được |
| Thù Địch | −69..−40 | Từ chối mọi đề nghị; dễ phản bội bạn cho địch |
| Ác Cảm | −39..−15 | Miễn cưỡng giao tiếp, hét giá cao, không giúp |
| Xa Lạ | −14..14 | Giao tiếp trung tính, quan hệ giao dịch thuần |
| Quen Biết | 15..39 | Nhận nhiệm vụ nhỏ, buôn bán giá phải chăng, chia sẻ tin thường |
| Thân Thiết | 40..64 | Xin viện trợ nhỏ, tin cậy giao việc, mở lời khuyên riêng |
| Tri Kỷ | 65..84 | Sát cánh chiến đấu tự nguyện, tiết lộ bí mật, ủng hộ chính trị |
| Sống Chết Có Nhau | 85..100 | Hi sinh vì bạn, theo bạn tới cùng dù bất lợi, hôn nhân/kết nghĩa bền |

- **Chuyển bậc là sự kiện** (nối Game Feel 6.4): khi Hảo Cảm vượt ngưỡng lên/xuống bậc mới → toast + AI được báo trong context ẩn để tường thuật khoảnh khắc ("ánh mắt Tyrion nhìn ngươi đã khác trước"). Không đổi bậc lặng lẽ.
- **Quán tính & giới hạn theo Tính Cách:** NPC trục Phản Trắc cao khó lên "Sống Chết Có Nhau" (trần thấp hơn); NPC trục Trung Thành cao rớt bậc chậm khi bạn lỡ làm phật lòng. Engine điều tiết tốc độ đổi Hảo Cảm theo tính cách (một sự kiện tốt +10 với người dễ mến nhưng chỉ +4 với kẻ đa nghi).
- **Tin Cậy đi riêng:** một số hành động tăng Hảo Cảm nhưng giảm Tin Cậy (tặng quà hậu hĩnh cho kẻ đa nghi → "hắn muốn gì ở ta?"). Ngưỡng Tin Cậy gate các lựa chọn nhạy cảm (giao quân, kể bí mật) độc lập với Hảo Cảm.

### 5.1e Tuổi tác trôi theo thời gian truyện & khác biệt giữa các Era

Vì thời gian trôi theo lời kể (mục 6.2) và app trải nhiều Thời Kỳ:
- **Engine tự cập nhật Tuổi:** nếu NPC có `Năm Sinh`, mỗi khi `stat_data.Thế Giới.Năm` đổi (AI kể thời gian trôi qua năm mới), engine tính lại `Tuổi = Năm hiện tại − Năm Sinh` và cập nhật `Giai Đoạn Đời` theo ngưỡng. Truyện nhảy "5 năm sau" → trẻ con thành thiếu niên, tráng niên thành trung niên — nhất quán, không cần AI nhớ.
- **`Giai Đoạn Đời` ảnh hưởng gameplay:** Ấu Nhi/Thiếu Niên không cầm quân/kết hôn hợp lệ (theo lệ Westeros ~13 tuổi mới đính hôn); Lão Niên có `Năng Lực` Võ Lực giảm dần nhưng Trí Mưu/Ngoại Giao có thể cao (kiểu Maester già, Tywin). Kế vị (13.4) kích hoạt khi NPC giữ chức qua đời vì tuổi già/bệnh/trận mạc.
- **Cùng một canon character khác nhau giữa các Era:** seed data mỗi `EraData` (mục 8.2) khai báo NPC với `Năm Sinh` cố định, nên **cùng Eddard Stark** ở "Loạn Robert" (282 AC, ~18 tuổi, trẻ trung) khác hẳn ở "Chiến Tranh Ngũ Vương" (298 AC, ~35 tuổi, Lãnh chúa gia trưởng). Engine không cần logic riêng — chỉ là dữ liệu Năm Sinh + Era year khác nhau. Ảnh chân dung (5.1c) cũng có thể khác theo Era (người chơi cung cấp ảnh trẻ/già tương ứng).
- **Off-screen aging (nhẹ):** NPC không xuất hiện lâu vẫn già theo Năm; trẻ con canon (vd các con Nhà Stark) lớn lên đúng mốc nếu truyện kéo dài nhiều năm.

### 5.1f Schema nhân vật đầy đủ — Chỉ số, Thiên Phú, Kỹ Năng, Trang Bị (mở rộng 5.1)

Khung 5.1 mới có 4 thuộc tính + HP/Thể Lực + túi đồ phẳng. Mục này mở rộng thành **hệ nhân vật đầy đủ** để phục vụ tạo nhân vật (8.5) và diễn tiến cả game. Thiết kế bám lore ASOIAF — thế giới **low-fantasy**: phần lớn nhân vật không có phép, sức mạnh đến từ kỹ năng chiến đấu/chính trị/mưu mẹo; ma thuật hiếm và **gated theo Era** (warg/greenseer ở phương Bắc, ma thuật R'hllor, warlock Qarth, Faceless Men). Toàn bộ cắm vào `StatDataSchema`, giữ 3 pattern nền (safeString/clampedStat/record).

#### A. Chỉ số cốt lõi (Primary Attributes) — 6 trục, thay cho 4 trục ở 5.1

Mở rộng `Thuộc Tính Năng Lực` từ 4 lên **6 chỉ số cốt lõi** (thang 1–20 kiểu RPG cổ điển, dễ point-buy, khác thang −100..100 cũ dùng cho tướng NPC):

```ts
"Chỉ Số Cốt Lõi": z.object({
  "Sức Mạnh":  clampedStat(1, 20, 8),   // STR — cận chiến, mang vác, áp đảo thể chất
  "Nhanh Nhẹn":clampedStat(1, 20, 8),   // AGI — né, tốc độ, ám khí, cưỡi ngựa, ra đòn trước
  "Thể Chất":  clampedStat(1, 20, 8),   // CON — HP, sức bền, chịu độc/thương/rét
  "Trí Tuệ":   clampedStat(1, 20, 8),   // INT — mưu lược, học vấn Maester, đọc tình hình, ma thuật học
  "Tinh Tường":clampedStat(1, 20, 8),   // WIS/PER — quan sát, nhận gian dối, trực giác, ý chí
  "Uy Tín":    clampedStat(1, 20, 8),   // CHA — thuyết phục, lãnh đạo, đàm phán, mê hoặc
}).prefault({}),
```

#### B. Chỉ số phái sinh (Derived Stats) — engine tự tính từ cốt lõi, KHÔNG point-buy

Engine dẫn xuất, người chơi không phân bổ trực tiếp (nên để prefix `_` chặn AI ghi bừa — engine tính lại mỗi khi cốt lõi/trang bị/cấp đổi):

```ts
"Chỉ Số Phái Sinh": z.object({
  "_HP Tối Đa":      z.coerce.number().int().prefault(100),  // = 50 + Thể Chất×5 + Cấp×5 + bonus talent/trang bị
  "_Thể Lực Tối Đa": z.coerce.number().int().prefault(100),  // = 50 + (Thể Chất+Sức Mạnh)×2.5
  "_Phòng Thủ":      z.coerce.number().int().prefault(10),   // = 10 + Nhanh Nhẹn/2 + giáp đang mặc
  "_Sát Thương Cận": z.coerce.number().int().prefault(0),    // bonus = Sức Mạnh/2 + vũ khí
  "_Sát Thương Xa":  z.coerce.number().int().prefault(0),    // bonus = Nhanh Nhẹn/2 + cung/nỏ
  "_Tải Trọng":      z.coerce.number().int().prefault(50),   // sức mang = Sức Mạnh×5 (giới hạn túi đồ)
  "_Chống Chịu":     z.coerce.number().int().prefault(0),    // kháng độc/rét = Thể Chất/2 + talent
}).prefault({}),
```
`Chỉ Số Sinh Tồn` (5.1) giữ nguyên (HP/Thể Lực/Pháp Lực hiện tại), nhưng **trần** của chúng giờ lấy từ `_HP Tối Đa`/`_Thể Lực Tối Đa` thay vì cứng 100. `Pháp Lực` chỉ >0 nếu nhân vật có thiên phú ma thuật (mục D) và Era cho phép.

#### C. Hệ Thiên Phú (Talents / Traits) — nét bẩm sinh, chọn lúc tạo + mở khoá qua chơi

Thiên phú là **đặc điểm bẩm sinh hoặc dấu ấn** cho bonus thụ động + mở khả năng tường thuật, khác kỹ năng (rèn luyện được). Lưu dạng record để thêm động:

```ts
"Thiên Phú": z.record(safeString().describe("Tên thiên phú"), z.object({
  "Loại": z.enum(["Chiến Đấu","Xã Hội","Trí Tuệ","Thể Chất","Ma Thuật","Xuất Thân","Khiếm Khuyết"]),
  "Mô Tả": safeString(),
  "Hiệu Ứng": safeString(),       // chuỗi cộng/trừ chỉ số CHUẨN HOÁ để engine parse tự động (mục 5.1f-C1), vd "Sức Mạnh+2, Sát Thương Cận+1"
  "Điều Kiện": safeString().optional(), // ngữ cảnh áp hiệu ứng nếu có, vd "khi cận chiến" — mô tả cho AI, engine áp phần cộng/trừ vô điều kiện
  "Ẩn": z.boolean().prefault(false), // thiên phú tiềm ẩn chưa lộ (vd dòng máu warg chưa thức tỉnh)
})).prefault({}),
```

**Ngân hàng thiên phú** (file data thật `content/westeros/talents.ts` — cung cấp sẵn, xem 5.1g; gate theo Era; chọn 2–3 lúc tạo tuỳ độ khó). Bảng dưới là **trích tiêu biểu** (bộ đầy đủ ~35 thiên phú nằm trong file .ts). Mỗi cái vừa cho số vừa mở màu tường thuật:

| Thiên phú | Loại | Hiệu ứng cơ học | Mở khoá tường thuật |
|---|---|---|---|
| Dòng Máu Chiến Binh | Chiến Đấu | +2 Sức Mạnh, +1 sát thương cận chiến | AI mô tả bản năng chiến đấu bẩm sinh |
| Kiếm Sĩ Thiên Bẩm | Chiến Đấu | Kỹ năng Kiếm khởi điểm +2 cấp | học chiêu thức nhanh hơn |
| Cung Thủ Đại Bàng | Chiến Đấu | +3 sát thương xa, không phạt tầm xa | bắn trúng mục tiêu người thường không thấy |
| Thân Thủ Mèo Rừng | Thể Chất | +2 Nhanh Nhẹn, +2 Phòng Thủ | né đòn, leo trèo, ngã không thương |
| Sức Vóc Khổng Lồ | Thể Chất | +3 Sức Mạnh, +20 Tải Trọng, −1 Nhanh Nhẹn | uy hiếp bằng vóc dáng |
| Thể Trạng Sắt | Thể Chất | +2 Thể Chất, +30% kháng độc/rét/bệnh | chịu đựng cực hạn, khó gục |
| Lưỡi Bạc | Xã Hội | +3 Uy Tín khi thuyết phục/đàm phán | lời nói lay chuyển đám đông |
| Mưu Sĩ Lọc Lõi | Trí Tuệ | +2 Trí Tuệ, +2 cấp kỹ năng Mưu Lược | nhìn thấu âm mưu, gài bẫy tinh vi |
| Ký Ức Hoàn Hảo | Trí Tuệ | nhớ mọi chi tiết đã gặp | AI luôn nhắc lại chính xác điều nhân vật từng biết |
| Con Mắt Tinh Đời | Trí Tuệ | +3 Tinh Tường nhận gian dối | phát hiện nói dối, đọc vị người khác |
| Duyên Quý Nhân | Xuất Thân | NPC khởi đầu +10 Hảo Cảm | người lạ dễ thiện cảm |
| Máu Rồng (Targaryen) | Ma Thuật | miễn nhiễm lửa thường (nhẹ), tiềm năng thuần rồng | chỉ Era có rồng; mở tuyến cưỡi rồng |
| Kẻ Đội Lốt (Warg) | Ma Thuật | nhập hồn thú (sói/quạ/...) | chỉ Era/vùng phương Bắc; do thám qua thú |
| Khải Thị (Greenseer) | Ma Thuật | thấy mộng tiên tri mơ hồ | AI thỉnh thoảng gieo điềm báo |
| Được R'hllor Chọn | Ma Thuật | nhỏ giọt phép lửa/hồi sinh (hiếm) | chỉ tuyến tín đồ Thần Lửa |
| — KHIẾM KHUYẾT (chọn để lấy thêm điểm) — | | | |
| Thọt Chân | Khiếm Khuyết | −2 Nhanh Nhẹn, không chạy nhanh | +điểm point-buy; AI mô tả bước đi khó |
| Thân Hình Nhỏ Bé (Lùn) | Khiếm Khuyết | −2 Sức Mạnh, bị khinh thường | +điểm; mở tuyến "bị coi thường mà mưu lược" kiểu Tyrion |
| Tiếng Xấu | Khiếm Khuyết | NPC khởi đầu −10 Hảo Cảm | +điểm; quá khứ đen tối theo đuổi |
| Mù Chữ | Khiếm Khuyết | không dùng kỹ năng Học Vấn | +điểm; xuất thân thấp kém |
| Bệnh Kinh Niên | Khiếm Khuyết | −2 Thể Chất, thỉnh thoảng phát bệnh | +điểm; kịch tính sinh tồn |

Khiếm khuyết là **đánh đổi có chủ đích** (lấy điểm phân bổ nhiều hơn) — rất ASOIAF, nơi nhân vật khuyết tật (Tyrion, Bran, Jaime cụt tay) lại là trung tâm.

**C1. Parser hiệu ứng (engine tự cộng, không nhờ AI).** Field `Hiệu Ứng` viết dạng chuỗi chuẩn `"<Chỉ Số><+/-số>, ..."` để engine tách bằng regex và cộng thẳng vào chỉ số/chỉ số phái sinh — AI không phải tính, chỉ đọc để kể. Đây là pattern gọn đã chứng minh hiệu quả (mỗi thiên phú chỉ là một dòng effects máy-đọc-được):
```ts
// engine/character/applyTalentEffects.ts
function parseEffect(str: string): { key: string; delta: number }[] {
  // "Sức Mạnh+2, Sát Thương Cận+1, Nhanh Nhẹn-1" → [{key:"Sức Mạnh",delta:2}, ...]
  return str.split(",").map(s => {
    const m = s.trim().match(/^(.+?)\s*([+-]\d+)$/);
    return m ? { key: m[1].trim(), delta: parseInt(m[2]) } : null;
  }).filter(Boolean);
}
// Khi tạo nhân vật / thức tỉnh thiên phú ẩn: cộng dồn mọi effect vào Chỉ Số Cốt Lõi,
// rồi engine tính lại Chỉ Số Phái Sinh (5.1f-B). Thiên phú "Ẩn" chưa cộng cho tới khi thức tỉnh.
```
Ví dụ hiệu ứng theo mẫu này: `Dòng Máu Chiến Binh` → `"Sức Mạnh+2, Sát Thương Cận+1"`; `Sức Vóc Khổng Lồ` → `"Sức Mạnh+3, Tải Trọng+20, Nhanh Nhẹn-1"`; `Thọt Chân` (khiếm khuyết) → `"Nhanh Nhẹn-2"`. Hiệu ứng có `Điều Kiện` (vd "khi cận chiến") thì engine để AI diễn phần điều kiện, chỉ tự cộng phần nền vô điều kiện; hoặc gắn tag để combat engine (mục 7) áp đúng lúc.

#### D. Hệ Kỹ Năng (Skills) — rèn luyện được, có cấp, tăng qua chơi

Khác thiên phú (bẩm sinh), kỹ năng **lên cấp qua sử dụng + sự kiện + thầy dạy**. Thang cấp 0–10, mỗi kỹ năng cộng vào phán định liên quan (combat 7.2, xã hội, mưu đồ...):

```ts
"Kỹ Năng": z.record(safeString().describe("Tên kỹ năng"), z.object({
  "Cấp": clampedStat(0, 10, 0),       // 0 chưa biết → 10 bậc thầy
  "Kinh Nghiệm": clampedStat(0, 100, 0), // đầy 100 → lên 1 cấp, reset
  "Nhóm": z.enum(["Chiến Đấu","Sinh Tồn","Xã Hội","Trí Tuệ","Thủ Công","Ma Thuật"]),
})).prefault({}),
```

**Danh mục kỹ năng chuẩn** (khởi tạo tuỳ nghề mục E; các kỹ năng Ma Thuật chỉ mở nếu có thiên phú tương ứng + Era cho phép):

*Nhóm Chiến Đấu:* Kiếm & Khiên, Song Kiếm, Trường Thương, Rìu/Chuỳ, Cung/Nỏ, Chiến Đấu Tay Không, Cưỡi Ngựa Chiến, Chỉ Huy Quân (nối Thống Soái 7.7).
*Nhóm Sinh Tồn:* Lần Theo Dấu Vết, Săn Bắn, Ẩn Nấp, Leo Trèo, Chịu Đựng Thời Tiết, Sơ Cứu.
*Nhóm Xã Hội:* Thuyết Phục, Hù Doạ, Lừa Gạt, Đàm Phán, Nghi Thức Cung Đình, Thu Thập Tin Đồn.
*Nhóm Trí Tuệ:* Mưu Lược, Học Vấn (sử/luật/gia phả), Y Thuật Maester, Ngôn Ngữ (Valyrian/tiếng Man...), Đọc Bản Đồ & Địa Hình.
*Nhóm Thủ Công:* Rèn Đúc, Nấu Ăn, Buôn Bán (nối kinh tế 15), Xây Dựng (nối 10).
*Nhóm Ma Thuật (gated):* Nhập Hồn Thú (Warg), Chiêm Mộng (Greenseer), Thuật Lửa (R'hllor), Độc Dược, Nghệ Thuật Vô Diện (Faceless).

**Lên cấp (engine, nối onTurnAdvance):** dùng kỹ năng thành công → +EXP kỹ năng đó; có thầy giỏi (NPC Hảo Cảm cao + kỹ năng cao hơn) → học nhanh; sự kiện/quest thưởng cấp. Lên cấp → toast + AI có thể tường thuật khoảnh khắc "ngươi cảm thấy đường kiếm đã nhuần nhuyễn hơn".

#### E. Trang Bị theo Slot (Equipment) — thay túi đồ phẳng bằng ô mặc

`Túi Đồ` (5.1) giữ làm kho chứa, nhưng thêm **các ô trang bị đang mặc** (equipped) ảnh hưởng trực tiếp chỉ số phái sinh:

```ts
"Trang Bị Đang Mặc": z.object({
  "Vũ Khí Chính":  EquipItemSchema.optional(),
  "Vũ Khí Phụ":    EquipItemSchema.optional(),   // khiên / vũ khí tay trái / ám khí
  "Giáp Thân":     EquipItemSchema.optional(),
  "Mũ/Nón":        EquipItemSchema.optional(),
  "Áo Choàng":     EquipItemSchema.optional(),    // giữ ấm (nối rét phương Bắc) + huy hiệu Nhà
  "Trang Sức":     EquipItemSchema.optional(),    // nhẫn/dây chuyền — bonus xã hội/ma thuật
  "Vật Phẩm Đặc Biệt": EquipItemSchema.optional(),// vd Vòng Tay Bàn Tay Nhà Vua
}).prefault({}),
```
```ts
const EquipItemSchema = z.object({
  "Tên": safeString(),
  "Phẩm Chất": z.enum(["Thô Kệch","Thường","Tinh Xảo","Thượng Hạng","Thép Valyria","Vô Giá"]).prefault("Thường"),
  "Chất Liệu": safeString().optional(),           // "thép Valyria","obsidian","da thú","lụa Myr"...
  "Thuộc Tính": z.record(safeString(), z.coerce.number()).prefault({}), // {"Sát Thương Cận":5,"Phòng Thủ":3}
  "Đặc Tính": z.array(safeString()).prefault([]),  // tag: "valyrian","obsidian","xuyên giáp","gia truyền"
  "Mô Tả": safeString(),
  "Độ Bền": clampedStat(0, 100, 100).optional(),
}).prefault({}),
```
- **Nối chiến đấu:** `Đặc Tính` `valyrian`/`obsidian` là điều kiện cứng diệt kẻ siêu nhiên (7.14/7.15); `Phẩm Chất` ánh xạ sang chênh lệch trang bị trong Battle Resolver nếu nhân vật tự cầm quân. Engine cộng `Thuộc Tính` của mọi món equipped vào Chỉ Số Phái Sinh (B).
- **Phẩm chất "Thép Valyria"/"Vô Giá"** cực hiếm (kiếm gia truyền như Ice, Longclaw) — không mua được, chỉ thừa kế/đoạt/thưởng, đúng lore.
- **Áo Choàng giữ ấm** có ý nghĩa cơ học ở Era Đông/phương Bắc (nối rét, kháng `_Chống Chịu`) — không chỉ trang trí.

#### F. Điểm Kỹ Năng & Thăng Tiến khi lên Cấp

```ts
"Điểm Chưa Phân Bổ": z.object({
  "Điểm Chỉ Số": z.coerce.number().int().min(0).prefault(0),  // +1 mỗi vài cấp, cộng vào Chỉ Số Cốt Lõi
  "Điểm Kỹ Năng": z.coerce.number().int().min(0).prefault(0), // +2-3 mỗi cấp, cộng vào Kỹ Năng
}).prefault({}),
```
Lên `Cấp Độ` (từ Kinh Nghiệm, 5.1) → engine cấp điểm → người chơi phân bổ (UI trong Status Panel). Giữ đường phát triển nhân vật xuyên suốt game, không chỉ lúc tạo.

### 5.1g Ngân hàng dữ liệu & Nguyên tắc chống-bịa (mọi hành động dùng chỉ số + xác suất)

#### Ngân hàng dữ liệu (data files, tách khỏi engine)

Thiên phú và kỹ năng ở 5.1f-C/D được cung cấp dưới dạng **file data thuần** để lập trình viên dùng trực tiếp và bạn tùy biến không đụng engine:
- **`content/westeros/talents.ts`** — `ALL_TALENTS` (7 nhóm: Chiến Đấu/Thể Chất/Xã Hội/Trí Tuệ/Xuất Thân/Ma Thuật/Khiếm Khuyết), mỗi thiên phú có `effect` (chuỗi máy-đọc cho parseEffect 5.1f-C1), `cost` (khiếm khuyết = âm, hoàn điểm), `eras`/`requires` (gate), `hidden` (tiềm ẩn), `narrative` (màu kể). Hàm `availableTalents({eraId, eraHasMagic, originId, houseId})` lọc cho wizard Bước 3.
- **`content/westeros/skills.ts`** — `SKILLS` (6 nhóm), mỗi kỹ năng có `primaryStat` (khớp checkMap 5bis.2b), `magic`/`requiresTalent` (gate ma thuật). Hàm `availableSkills({eraHasMagic, chosenTalentIds})` lọc cho wizard Bước 4; `STARTING_SKILLS_BY_ORIGIN` cấp kỹ năng nền theo xuất thân.

Cả hai gate theo Era + xuất thân + Nhà + thiên phú, khớp wizard 8.5 và hệ chỉ số 5.1f. Thêm/sửa thiên phú-kỹ năng = sửa 2 file này, engine đọc runtime.

#### Nguyên tắc chống-bịa — MỌI kết quả có rủi ro đều qua engine (gom về một chỗ)

Đây là cam kết xuyên suốt "engine giữ số, AI giữ lời", đặt tập trung để không sót. **AI không bao giờ tự quyết một hành động có hệ quả thành hay bại — engine tính bằng chỉ số + xác suất, AI chỉ tường thuật kết quả đã chốt.** Cụ thể:

| Tình huống trong lời kể | AI KHÔNG được | Engine LÀM (AI kể lại) |
|---|---|---|
| Nhân vật thử thuyết phục/lừa/trộm/do thám/chữa/mưu... | tự phán "thành công" hay "thất bại" | `resolveCheck` (5bis) với chỉ số+kỹ năng từ `checkMap` → trả bậc kết quả |
| Giao chiến mọi quy mô | tự quyết ai thắng, bịa thương vong | engine combat (mục 7), seed cố định |
| Hành động dùng thiên phú (vd Máu Rồng chịu lửa) | tự chế mức hiệu quả | engine đọc `effect` đã parse (5.1f-C1) — bonus là con số cố định |
| Nâng chỉ số/kỹ năng, lên cấp | tự cho "ngươi mạnh lên nhiều" | engine cộng theo EXP/điểm (5.1f-D/F), số rõ ràng |
| Sự kiện ngẫu nhiên xảy ra | tự bịa sự kiện tuỳ hứng đổi state lớn | `weightedPick` từ pool đủ điều kiện (5bis.7) |
| Số phận sau trận (tướng chết/bị bắt, phản trắc) | tự quyết | engine roll `eventSeed` theo xác suất từ state (7.7) |

**Luồng chuẩn (giống combat 2 lượt, mục 6.2):** AI kể tới một hành động rủi ro → phát tín hiệu (thẻ/cờ) nêu *loại việc (checkId) + độ khó ước lượng* → engine chạy `resolveCheck`, ghi kết quả + patch state → **lượt kế** AI đọc bậc kết quả và tường thuật khớp (Đại Thành Công kể huy hoàng, Thất Bại kể vấp ngã). AI **mô tả** cú vung kiếm, lời thuyết phục, nhưng **con số** (trúng/trượt, thuyết phục nổi không) là của engine.

**Vì sao khớp được với việc AI vẫn kể tự nhiên:** AI không thấy công thức — nó thấy *kết quả* ("thuyết phục: Thành Công Nửa Vời — NPC đồng ý nhưng đòi điều kiện") và dệt thành văn. Người chơi thấy % + breakdown minh bạch trước khi hành động (5bis.5), tin rằng số không bị model bịa. Đây là khác biệt cốt lõi so với preset "AI tự xử": app tự sở hữu engine xác suất nên **loại bỏ hoàn toàn** việc model tự ý quyết định số phận — kết quả tái lập được bằng seed, test được, công bằng.

> Ranh giới còn lại (5bis.6): thứ **thuần màu sắc kể chuyện** không hệ quả cơ học (màu áo NPC lạ, tên quán trọ, câu đối đáp, thời tiết nhỏ) thì AI tự do sáng tạo — chống-bịa nhắm vào *kết quả có hệ quả*, không bóp nghẹt văn phong.

### 5.2 Ví dụ khối patch AI trả về
```json
{
  "mvu_update": [
    { "op": "delta", "path": "stat_data.Chỉ Số Sinh Tồn.HP", "value": -15 },
    { "op": "replace", "path": "stat_data.Thế Giới.Vị Trí", "value": "King's Landing" },
    { "op": "replace", "path": "stat_data.Túi Đồ.Kiếm thép Valyria giả", "value": { "Số Lượng": 1, "Mô Tả": "Vũ khí quý hiếm, sắc bén khác thường" } },
    { "op": "replace", "path": "stat_data.Mối Quan Hệ.NPC Chính.Tyrion Lannister.Độ Hảo Cảm", "value": 20 }
  ]
}
```
Dùng `replace` để tạo key mới trong `z.record()` (như "Kiếm thép Valyria giả" ở trên) — engine coi path chưa tồn tại là "tạo mới", không cần `op: "insert"` riêng cho dạng record (chỉ `insert` mới cần cho mảng thật, vd log sự kiện dạng array).

### 5.3 Parser & validate
```
applyPatch(state, patchOps):
  for op in patchOps:
    try:
      switch op.op:
        "replace" -> setPath(state, op.path, op.value)
        "delta"   -> setPath(state, op.path, getPath(state, op.path) + op.value)
        "insert"  -> getPath(state, op.path).push(op.value)
        "remove"  -> deletePath(state, op.path)
        "move"    -> { val = getPath(state, op.from); deletePath(state, op.from); setPath(state, op.path, val) }
    catch (e):
      logEngineWarning(op, e) // không throw, tiếp tục các op khác
  result = StatDataSchema.safeParse(state)
  if not result.success:
    state = mergeWithDefaults(state, result.error) // dùng .prefault để tự phục hồi field lỗi
    logSchemaViolation(result.error)
  return state
```
**Lưu ý kỹ thuật (đúc kết từ thực tế build card MVU-ZOD, tránh lặp lại lỗi):**
- Mọi `z.object({...})` lồng nhau **phải có `.prefault({})`**.
- Prefix `_` = readonly (engine mới được ghi, chặn AI patch trực tiếp field này).
- Prefix `$` = ẩn khỏi UI nhưng AI vẫn đọc/ghi bình thường.
- Giá trị `default`/`prefault` của `z.enum([...])` phải nằm trong chính enum đó.
- Không dùng `lodash.pickBy` (hay filter tương tự) trực tiếp lên object patch mà không kiểm tra kỹ điều kiện lọc — dễ âm thầm xoá field hợp lệ.
- Ký tự đặc biệt (dấu nháy, tiếng Việt có dấu) trong `z.enum([...])` — tránh dùng trực tiếp, ưu tiên mapping key (tiếng Anh không dấu) → label hiển thị (tiếng Việt) riêng.

**Snapshot state để hỗ trợ reroll/rollback (bắt buộc):** trước khi áp `mvu_update` của mỗi lượt, lưu lại một **snapshot bản sao sâu (deep clone) của state** gắn với lượt đó. Cần cho: reroll (hoàn tác thay đổi của bản cũ trước khi sinh bản mới — mục 19.1), xoá tin nhắn (hoàn tác state của lượt bị xoá), và đổi giữa các bản reroll (khôi phục đúng state của bản đang chọn). Snapshot lưu gọn (chỉ `stat_data`, thường nhỏ) — có thể lưu delta/patch nghịch đảo thay vì full clone nếu tối ưu bộ nhớ, nhưng full snapshot đơn giản và an toàn hơn, ưu tiên trước. Đây là điều kiện tiên quyết để reroll không cộng dồn thay đổi state.

### 5.4 Prefix định tuyến lorebook entry
`[initvar]` (khởi tạo state khi bắt đầu), `[mvu_update]` (hướng dẫn format patch trong system prompt — **nội dung prompt đầy đủ ở mục 5.4b**), `[mvu_plot]` (chèn plot hook dựa theo state hiện tại, vd nếu `affinity` với 1 NPC > 80 thì chèn thêm nội dung liên quan).

### 5.4b Prompt hướng dẫn AI cập nhật Bảng Trạng Thái (nội dung entry `[mvu_update]`)

Mục 5.4 nói entry `[mvu_update]` "chứa hướng dẫn format patch" nhưng chưa cho nội dung. Đây là **prompt thực tế** — nạp vào system prompt (hoặc lorebook entry `constant` prefix `[mvu_update]`) để AI biết cách trả khối cập nhật đúng. Viết bằng tiếng Việt vì AI nhập vai bằng tiếng Việt; thuật ngữ kỹ thuật (op, path, JSON) giữ nguyên. **Dán nguyên khối dưới đây** (giữa hai vạch) làm entry, chỉnh danh sách field cho khớp schema cuối cùng của bạn:

---
```
# QUY TẮC CẬP NHẬT BẢNG TRẠNG THÁI

Sau MỖI lượt kể, ngươi PHẢI xuất một khối JSON cập nhật trạng thái, đặt ở CUỐI phản hồi,
phản ánh chính xác những gì vừa xảy ra TRONG LỜI KỂ của ngươi. Người chơi sẽ không thấy khối
này (hệ thống tự ẩn) — nó chỉ để cập nhật cỗ máy trò chơi.

## ĐỊNH DẠNG

Khối phải là JSON hợp lệ, bọc trong thẻ, theo đúng mẫu:

<UpdateVariable>
{
  "mvu_update": [
    { "op": "...", "path": "...", "value": ... }
  ]
}
</UpdateVariable>

Nếu lượt này KHÔNG có gì thay đổi (chỉ đối thoại xã giao), trả mảng rỗng:
<UpdateVariable>
{ "mvu_update": [] }
</UpdateVariable>

## NĂM LOẠI THAO TÁC (op)

1. "replace" — ĐẶT một giá trị (ghi đè, hoặc TẠO MỚI nếu chưa có).
   Dùng cho: đổi vị trí, đổi chức vụ, đặt hảo cảm về một mốc cụ thể, THÊM NPC/vật phẩm mới.
   { "op": "replace", "path": "stat_data.Thế Giới.Vị Trí", "value": "King's Landing" }

2. "delta" — CỘNG THÊM/BỚT vào một số (dùng số âm để trừ).
   Dùng cho: HP giảm khi bị thương, Vàng tăng khi nhận thưởng, hảo cảm tăng/giảm dần.
   { "op": "delta", "path": "stat_data.Chỉ Số Sinh Tồn.HP", "value": -15 }
   { "op": "delta", "path": "stat_data.Mối Quan Hệ.NPC Chính.Tyrion Lannister.Độ Hảo Cảm", "value": 5 }

3. "insert" — THÊM một phần tử vào CUỐI một danh sách (mảng).
   Dùng cho: thêm ký ức mới cho NPC, thêm lời hứa, thêm nét tính cách.
   { "op": "insert", "path": "stat_data.Mối Quan Hệ.NPC Chính.Tyrion Lannister.Ký Ức",
     "value": { "Turn": 42, "Sự Việc": "Ngươi che chở hắn trước lời buộc tội của Cersei",
                "Cảm Xúc": "Biết Ơn", "Trọng Số": 70 } }

4. "remove" — XOÁ một field/phần tử.
   Dùng cho: dùng hết vật phẩm, một NPC rời khỏi nhóm.
   { "op": "remove", "path": "stat_data.Túi Đồ.Bình thuốc chữa thương" }

5. "move" — CHUYỂN giá trị từ chỗ này sang chỗ khác.
   Dùng cho: NPC chuyển từ "kẻ thù" sang "đồng minh" (hiếm dùng).
   { "op": "move", "from": "stat_data.A", "path": "stat_data.B" }

## CÁCH VIẾT path

- Luôn bắt đầu bằng "stat_data."
- Nối các cấp bằng dấu chấm, dùng ĐÚNG tên field tiếng Việt như trong bảng trạng thái.
- Với NPC/vật phẩm: path đi qua tên riêng, ví dụ:
    stat_data.Mối Quan Hệ.NPC Chính.<Tên NPC>.Độ Hảo Cảm
    stat_data.Túi Đồ.<Tên vật phẩm>.Số Lượng
- THÊM NPC MỚI: dùng "replace" với path tới tên NPC chưa có, value là object đầy đủ:
    { "op": "replace", "path": "stat_data.Mối Quan Hệ.NPC Chính.Ser Jorah Mormont",
      "value": { "Họ Tên": "Ser Jorah Mormont", "Tuổi": 50, "Độ Hảo Cảm": 10,
                 "Chức Vụ": "Hiệp sĩ lưu vong", "Nhà": "Mormont" } }
  (Không cần khai báo trước — hệ thống tự nhận path mới là "tạo mới".)

## ĐIỀU CẤM (QUAN TRỌNG)

✗ KHÔNG đụng field bắt đầu bằng dấu gạch dưới "_" (ví dụ _Seed, _Log, _Đang Chiến Đấu,
  _HP trong trận đánh). Đó là số của cỗ máy, ngươi ghi vào sẽ bị bỏ qua.
✗ KHÔNG tự đặt nhãn bậc: đừng ghi "Giai Đoạn Quan Hệ" hay "Giai Đoạn Đời" — hệ thống tự
  suy ra từ số. Ngươi chỉ chỉnh SỐ (Độ Hảo Cảm, Tuổi), nhãn tự cập nhật.
✗ KHÔNG tự tính kết quả trận đánh, số quân thương vong, ai thắng ai thua, tiến độ xây dựng,
  hay quân đi tới đâu. Khi có giao chiến, chỉ phát thẻ <combat_trigger> — cỗ máy sẽ tính và
  ghi kết quả. Ngươi kể lại kết quả đó ở lượt sau.
✗ KHÔNG bịa thay đổi không có trong lời kể. Nếu ngươi không kể ra việc gì đó xảy ra, đừng
  cập nhật nó. Cập nhật phải KHỚP với những gì ngươi vừa viết.
✗ KHÔNG cập nhật hàng loạt field không liên quan "cho chắc". Chỉ cập nhật cái thực sự đổi.

## THỜI GIAN TRÔI

Nếu trong lời kể thời gian trôi qua (nghỉ ngơi, hành trình, "ba ngày sau", "một tháng trôi qua"),
BÁO cho cỗ máy bằng cách cập nhật ngày:
   { "op": "delta", "path": "stat_data.Thế Giới.Ngày", "value": 3 }
Cỗ máy sẽ tự động tick các tiến trình dài (xây dựng, hành quân, kinh tế, mùa màng) theo số ngày
này. ĐỪNG tự cập nhật các tiến trình đó — chỉ báo thời gian, cỗ máy lo phần còn lại.

## NGUYÊN TẮC VÀNG

Bảng trạng thái là SỰ THẬT của thế giới. Nếu trí nhớ của ngươi (đoạn hội thoại) mâu thuẫn với
bảng trạng thái đang hiển thị, hãy TIN BẢNG TRẠNG THÁI. Ví dụ: nếu bảng ghi một NPC đang "THÙ
ĐỊCH" với người chơi, đừng kể như thể họ vẫn thân thiết, dù đoạn chat cũ có vẻ vậy — chuyện đã
thay đổi và bảng phản ánh hiện tại.
```
---

**Ghi chú triển khai cho lập trình viên (không nằm trong prompt gửi AI):**

- **Thẻ bọc:** ví dụ dùng `<UpdateVariable>...</UpdateVariable>` (khớp thực tế card MVU-ZOD trước đây của bạn); parser (mục 5.5/5.5c) bắt cả thẻ này lẫn khối `{"mvu_update":...}` trần để robust. Chọn MỘT quy ước và giữ nhất quán giữa prompt này và extractor.
- **Danh sách field trong prompt phải khớp schema cuối:** khi schema đổi (thêm hệ thống mới ở 10–17), cập nhật phần "CÁCH VIẾT path" cho khớp — hoặc tốt hơn, **sinh động** danh sách field chính từ Zod schema và chèn vào prompt lúc build (một macro `{{schema_fields}}`), để prompt luôn đồng bộ schema, không lệch thủ công.
- **Prompt này là entry `constant`** (luôn active, mục 4.1) prefix `[mvu_update]` — không phụ thuộc từ khoá, phải có mặt mọi lượt.
- **Kết hợp với render state (5.7.3):** prompt này dạy AI *cách ghi*; khối state render dạy AI *đọc gì*. Hai cái đi cặp trong buildPrompt (bước 1 và 2 ở 5.7.2).
- **Validate & tự sửa (5.3):** dù prompt cấm đụng `_`, extractor vẫn **lọc bỏ mọi op ghi vào field `_`** ở tầng code (không tin AI tuyệt đối) — prompt giảm lỗi, code chặn lỗi. Tương tự, op ghi nhãn bậc (Giai Đoạn Quan Hệ/Đời) bị bỏ qua vì engine tự dẫn xuất.
- **Ví dụ few-shot (tuỳ chọn, tăng độ chính xác):** có thể kèm 1–2 cặp [lời kể ngắn → mvu_update đúng] trong prompt để AI bắt chước. Ví dụ: *lời kể "Ngươi rút kiếm hạ tên cướp, nhặt túi vàng của hắn"* → patch `delta` Vàng +50 và (nếu có hệ chiến đấu 1v1 đơn giản) `delta` HP theo kết quc. Giữ few-shot ngắn để không tốn context.

### 5.4c Trích xuất & áp patch (extractor) — khớp với prompt 5.4b

Nối prompt trên với code (bổ sung mục 5.5/5.3):
```
onAIResponse(rawText):
  1. Trích mọi khối <UpdateVariable>...</UpdateVariable> (hoặc {"mvu_update":...}) bằng parser JS
     (KHÔNG regex mong manh — parse có xử lý lỗi; nhiều khối thì gộp ops theo thứ tự).
  2. Với mỗi op: LỌC AN TOÀN trước khi áp:
       • bỏ op có path chạm field prefix "_"          → log, không áp (chống AI ghi field readonly)
       • bỏ op ghi nhãn bậc (Giai Đoạn Quan Hệ/Đời)   → engine tự dẫn xuất
       • bỏ op ghi kết quả trận/quân số/tiến độ loop  → engine sở hữu (5.7.5)
  3. applyPatch(state, opsSạch) (mục 5.3, 5 op, safeParse + tự phục hồi).
  4. Chạy HIỆU ỨNG LAN TOẢ (5.7.4): affinityStage, tuổi, danh tiếng→Thái Độ, onTurnAdvance nếu ngày đổi.
  5. Ẩn khối <UpdateVariable> + thẻ kỹ thuật khỏi văn hiển thị (mục 5.5), giữ raw trong Dexie.
  6. Snapshot state cho reroll/undo (mục 5.3).
```
Triết lý hai lớp: **prompt (5.4b) làm AI ghi đúng ~hầu hết thời gian; extractor (5.4c) đảm bảo dù AI ghi sai vẫn không phá state.** Không lớp nào đủ một mình — prompt tốt giảm tải cho code, code chặt chặn hậu quả khi prompt trượt.

### 5.5 Ẩn dữ liệu kỹ thuật khỏi màn hình chat
- Bắt buộc: ẩn khối JSON patch khỏi màn hình chat (match `{"mvu_update":...}` → không render, chỉ áp dụng cho **display**, không đụng vào raw message lưu trong DB) — tương đương cơ chế "regex ẩn JSON" của ST nhưng làm bằng parser JS thật thay vì regex string-replace, vì app tự vẽ UI (không cần giả lập chat bubble của ST).

### 5.5b EJS engine cho lorebook động — BẮT BUỘC triển khai đầy đủ

App **phải có một EJS engine thực thi trong lorebook** (không chỉ nội suy biến đơn giản). Đây là cơ chế cốt lõi để lore **thay đổi theo trạng thái game** — cực kỳ quan trọng để nhập vai sống động và khớp với triết lý "diễn biến dẫn dắt" (mục 6.2). Pattern này lấy trực tiếp từ các card thực tế đã chạy (card "Đại Lãnh Chúa", "Đế Quốc La Mã Thần Thánh") và phải được tái hiện đúng.

EJS engine cần hỗ trợ trong nội dung mỗi lorebook entry:
- **Đọc biến MVU state:** hàm `getvar(path, { defaults })` đọc giá trị từ `stat_data` (vd `getvar('stat_data.Lãnh_Địa.Cư_dân.Lòng_dân', { defaults: 50 })`).
- **Logic điều kiện:** cú pháp EJS đầy đủ `<%_ if (...) { _%> ... <%_ } else if (...) { _%> ... <%_ } _%>` để rẽ nhánh nội dung theo state.
- **Nạp entry lore khác theo điều kiện:** hàm `getwi(id, name)` (get world info) chèn nội dung của 1 entry lore khác vào — cho phép 1 entry "điều phối" chọn nạp entry con nào tùy trạng thái.
- **Nội suy giá trị:** `<%= expr %>` (in giá trị, có escape) và `<%- expr %>` (in raw, cho HTML/nội dung entry khác).
- **Async:** hỗ trợ `await` trong template (vì `getwi` có thể bất đồng bộ).

**Ví dụ thực tế (bộ điều khiển lore đa giai đoạn theo Lòng Dân — nguyên mẫu từ card Đại Lãnh Chúa):**
```ejs
<%_
if (typeof morale === 'undefined') var morale = getvar('stat_data.Lãnh_Địa.Cư_dân.Lòng_dân', { defaults: 50 });
_%>
<%_ if (morale >= 0 && morale <= 29) { _%>
<%- await getwi(null, 'Lãnh_Địa_Giai_đoạn_01_Hỗn_loạn') %>
<%_ } else if (morale >= 30 && morale <= 49) { _%>
<%- await getwi(null, 'Lãnh_Địa_Giai_đoạn_02_Bất_ổn') %>
<%_ } else if (morale >= 50 && morale <= 69) { _%>
<%- await getwi(null, 'Lãnh_Địa_Giai_đoạn_03_Bình_yên') %>
<%_ } else if (morale >= 70 && morale <= 89) { _%>
<%- await getwi(null, 'Lãnh_Địa_Giai_đoạn_04_Phát_triển') %>
<%_ } else { _%>
<%- await getwi(null, 'Lãnh_Địa_Giai_đoạn_05_Thái_bình') %>
<%_ } _%>
```
Kết quả: mô tả lãnh địa mà AI nhận thay đổi theo Lòng Dân hiện tại — dân đang loạn thì lore mô tả cảnh hỗn loạn, dân yên thì mô tả cảnh thái bình. AI luôn kể đúng tình trạng thực tế của state mà không cần người viết lore lường trước mọi trường hợp trong 1 đoạn text cứng.

**Ví dụ 2 (kích hoạt sự kiện lịch sử theo thời gian trong game — từ card La Mã):**
```ejs
<%_ if (currentYear >= 298 && currentYear <= 300) { _%>
<%- await getwi(null, 'Sự_kiện_Chiến_Tranh_Ngũ_Vương') %>
<%_ } _%>
```
Gắn thẳng với cơ chế thời gian theo diễn biến (mục 6.2): khi truyện trôi tới mốc năm tương ứng, lore sự kiện tự động được đưa vào context để AI dệt vào cốt truyện.

**Yêu cầu kỹ thuật engine:**
- Dùng thư viện EJS (hoặc tương đương) chạy client-side; cung cấp các hàm cầu nối `getvar`/`getwi` truy cập MVU store + lorebook store.
- Render EJS **tại thời điểm build prompt** (mục 3.3): sau khi lore engine chọn entry active (mục 4), chạy EJS trên nội dung entry để ra text cuối cùng trước khi ghép vào prompt.
- **An toàn:** EJS chạy trên lore người dùng cung cấp (tin cậy ở mức người dùng tự đưa vào), nhưng vẫn giới hạn phạm vi thực thi (không cho truy cập tùy tiện ngoài các hàm cầu nối đã định), và luôn sanitize kết quả nếu render ra HTML (mục 23). Bọc EJS trong try/catch: entry lỗi cú pháp không được làm sập cả prompt — log lỗi, bỏ qua entry đó, tiếp tục.
- Đây là năng lực engine **bắt buộc**, không phải tùy chọn — vì lore người dùng sẽ cung cấp nhiều khả năng dùng chính pattern EJS này (họ quen làm card theo cách đó).

### 5.6 Hệ thống thẻ ngữ nghĩa cho nội dung đặc biệt (semantic narrative tags)

Tham khảo từ các card đã build trước đó (dùng hàng chục tag riêng: chiếu thư, thư ngoại giao, sự kiện, hội nghị triều đình...) — đây là pattern rất đáng áp dụng cho ASOIAF: thay vì mọi thứ AI viết ra đều là văn xuôi thường trong bong bóng chat, **quy định trước một tập thẻ ngữ nghĩa** để AI bọc các loại nội dung đặc biệt, frontend nhận diện thẻ và render bằng component riêng thay vì text thường.

Đề xuất bộ thẻ khởi điểm cho bối cảnh Westeros:
| Thẻ | Dùng khi | UI render |
|---|---|---|
| `<raven_scroll>...</raven_scroll>` | Thư từ/chim ưng đưa tin | Modal dạng cuộn giấy da, có con dấu huy hiệu Nhà gửi |
| `<royal_decree>...</royal_decree>` | Chiếu chỉ/lệnh của vua hoặc lãnh chúa | Modal trang trọng, viền vàng, có ấn triện |
| `<council_session>...</council_session>` | Họp Tiểu Hội Đồng / họp gia tộc (mục 13.3) | Layout dạng bàn tròn, liệt kê người tham dự, kèm 1-2 lựa chọn quyết định |
| `<event_popup>...</event_popup>` | Sự kiện bất ngờ (ám sát, phản loạn, thiên tai) | Banner nổi bật giữa màn hình, có thể kèm lựa chọn phản ứng nhanh |
| `<combat_trigger>...</combat_trigger>` | AI kể tới tình huống phải giao chiến, kích hoạt hệ thống chiến đấu (mục 7, luồng 2 lượt ở 6.2) | Không render như text — engine bắt thẻ, đọc thông tin đối thủ/bối cảnh, mở giao diện chiến đấu (tự chỉ huy hoặc auto-resolve) |
| `<battle_report>...</battle_report>` | Kết quả sau 1 trận đánh | Card tóm tắt thương vong, chiến lợi phẩm — liên kết dữ liệu combat log ở mục 7 |
| `<siege_update>...</siege_update>` | Diễn biến trong lúc vây thành (mục 12.2) | Card đếm ngược turn, tình trạng lương thực/trung thành lãnh địa bị vây |

**Cách hoạt động (không dùng iframe/regex-string-replace như bản gốc ST, vì app tự sở hữu renderer):**
1. Prompt hệ thống hướng dẫn AI: "nếu nội dung là [loại X], bọc trong thẻ `<tag_x>...</tag_x>`".
2. Trong lúc stream, parser quét response tìm cặp thẻ mở/đóng đã biết → phần bên trong thẻ tách khỏi luồng text thường, gắn `type` tương ứng.
3. Khi render message, đoạn nằm trong thẻ được vẽ bằng React component riêng (modal/card themed); phần còn lại vẫn hiển thị như tin nhắn narrative bình thường.
4. Thẻ không nhận diện được (AI gõ sai) → fallback hiển thị như text thường, không vỡ UI.
- Tập thẻ này lưu trong `content/westeros/narrativeTags.ts`, dễ mở rộng thêm tag mới (vd `<dragon_sighting>` nếu sau này thêm nội dung Targaryen/rồng) theo registry pattern giống macro engine ở mục 3.2.


### 5.7 Kiến trúc tích hợp — nối RAG, Lorebook, Bảng Trạng Thái, Trí Nhớ & Thẻ thành một (Central Nervous System)

> Các mục 3–5, 16bis mô tả từng hệ thống riêng. Mục này vẽ rõ **chúng nối vào nhau thế nào trong một lượt chơi** — luồng dữ liệu hai chiều: đọc-vào-prompt (context assembly) và ghi-ra-state (state mutation). Đây là "hệ thần kinh trung ương" của app; nắm sơ đồ này là nắm cách toàn bộ engine vận hành. Nguyên tắc bao trùm (đã nêu 16bis.3): **Bảng Trạng Thái (MVU state) là nguồn chân lý duy nhất; mọi hệ thống khác hoặc là NGUỒN nuôi nó, hoặc là NGƯỜI ĐỌC từ nó.**

#### 5.7.1 Bốn nguồn tri thức & vai trò của mỗi cái

| Hệ thống | Bản chất | Nội dung do ai tạo | Đọc/Ghi bởi AI | Vai trò |
|---|---|---|---|---|
| **Lorebook / RAG** (mục 4) | Tri thức **tĩnh** về thế giới | Người dùng cung cấp (file lore) | **Chỉ đọc** (AI không sửa lore) | "Bách khoa toàn thư" Westeros — địa danh, lịch sử, luật lệ, gia phả nền. Trigger theo từ khoá. |
| **Bảng Trạng Thái** (mục 5) | Tri thức **động** về ván chơi hiện tại | Engine + AI (qua patch) | **Đọc & ghi** (qua `mvu_update`) | Sự thật hiện tại: NPC, quan hệ, quân, lãnh địa, âm mưu, ngày/mùa. Thay đổi theo diễn biến. |
| **Trí Nhớ Dài Hạn** (mục 16bis) | **Lịch sử** đã xảy ra | Engine (tóm tắt) + AI (kể) | Đọc (tóm tắt) + ghi gián tiếp (kết tinh xuống state) | "Chuyện đã qua tới giờ" — chống quên khi chat trôi. |
| **Thẻ Ngữ Nghĩa** (mục 5.6) | **Tín hiệu** giữa AI ↔ engine | AI phát trong lời kể | AI ghi (phát thẻ), engine đọc | Kích hoạt hệ thống con (chiến đấu, hội đồng, thư từ) + đánh dấu nội dung đặc biệt để UI render. |

Phân vai rạch ròi này tránh chồng chéo: **lore là cái không đổi** (Winterfell luôn ở phương Bắc), **state là cái đang đổi** (ai đang giữ Winterfell lúc này), **trí nhớ là cái đã đổi** (Winterfell từng thất thủ ra sao), **thẻ là cái đang xảy ra** (một trận đánh vừa nổ ra).

#### 5.7.2 Luồng ĐỌC — lắp ráp context mỗi lượt (write → read)

Khi tới lượt AI trả lời, `buildPrompt()` (mục 3.3, mở rộng bởi 16bis.5) lắp ráp context từ cả 4 nguồn theo thứ tự ưu tiên. Sơ đồ:

```
Người chơi gõ hành động
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│ buildPrompt() — lắp ráp theo NGÂN SÁCH ƯU TIÊN (16bis.5)   │
│                                                            │
│ 1. Luật hệ thống + PROMPT CẬP NHẬT BẢNG (5.7.4/[mvu_update])│  ← luôn có
│ 2. BẢNG TRẠNG THÁI render dễ đọc (5.7.3)                    │  ← luôn có, NGUỒN CHÂN LÝ
│      • NPC trong cảnh: đầy đủ (quan hệ, tuổi, ký ức nổi bật)│
│      • phần còn lại: gọn                                    │
│ 3. KÝ ỨC BỀN liên quan (T2): NPC trong cảnh + chủ đề        │
│ 4. LORE active (RAG): quét từ khoá hành động + cảnh         │  ← EJS render theo state
│      • entry constant + entry khớp mạnh                     │     (getvar đọc chính state ở bước 2!)
│ 5. TÓM TẮT hồi cố (T3): 1-2 bản gần/liên quan nhất          │
│ 6. CHAT THÔ gần đây (T4): nhồi tối đa phần còn lại          │
│      + lời hành động mới của người chơi                     │
└───────────────────────────────────────────────────────────┘
        │
        ▼
   Gửi cho AI → AI tường thuật + (nếu cần) phát THẺ + trả MVU_UPDATE
```

**Mắt xích quan trọng nhất — Lore đọc được State qua EJS (mục 5.5b):** đây là chỗ RAG và Bảng Trạng Thái **thật sự nối vào nhau**, không chỉ nằm cạnh nhau. Một lore entry có thể viết:
```ejs
<% if (getvar("stat_data.Thái Độ Các Nhà.Lannister.Thái Độ") === "Thù Địch") { %>
Nhà Lannister hiện coi ngươi là kẻ thù. Lính gác Lannister sẽ cảnh giác, thương nhân trung thành với họ từ chối giao dịch.
<% } %>
```
→ Lore tĩnh trở nên **sống động theo state động**: cùng một địa danh, nội dung lore chèn vào prompt khác nhau tuỳ quan hệ hiện tại. Engine render EJS **sau khi** đã có state (bước 2 xong mới tới bước 4), nên `getvar` luôn đọc giá trị mới nhất. `getwi("keyEntryCon")` cho phép một entry nạp entry con → chuỗi lore phân nhánh theo tình huống.

**Nối Trí Nhớ:** ký ức bền (T2) và tóm tắt (T3) chính là các NPC memory (5.1b/16.1) + chapterSummaries (16bis.2) được lọc theo liên quan rồi chèn vào — nên "AI nhớ NPC này từng phản bội" là vì ký ức đó được **đọc từ state/Dexie vào prompt**, không phải AI tự nhớ.

#### 5.7.3 Render Bảng Trạng Thái cho AI đọc (không phải JSON thô)

State đưa vào prompt **không** ở dạng JSON `stat_data` khó tiêu, mà được `stateRenderer` (module `memory/`) format thành khối tiếng Việt tự nhiên, chỉ gồm phần liên quan:

```
【TRẠNG THÁI HIỆN TẠI — đây là sự thật, ưu tiên hơn trí nhớ hội thoại】
Nhân vật: Eddard Stark, Nhà Stark, Lãnh chúa Winterfell. HP 100/100. Vàng 5.000.
Vị trí: King's Landing. Ngày 15 tháng 3, năm 298 AC. Mùa: Thu (sắp sang Đông).

NPC trong cảnh:
• Tyrion Lannister (38 tuổi) — Quan hệ: THÂN THIẾT (52), Tin Cậy: 30. Chức: Quân Sư.
    Ký ức nổi bật: [Turn 34] ngươi cứu hắn khỏi ngục Eyrie (Biết Ơn, trọng số 90).
    Lời hứa chưa giữ với hắn: "sẽ nói tốt cho hắn trước nhà vua".
• Cersei Lannister (35 tuổi) — Quan hệ: THÙ ĐỊCH (-45), Tin Cậy: -60. Chức: Vương Hậu.

Các Nhà: Lannister → THÙ ĐỊCH với ngươi. Baratheon → ỦNG HỘ. Tully → TÍN NHIỆM (nhà mẹ).
Việc dở dang: đang điều tra cái chết của Jon Arryn; điệp viên "Chim Nhỏ" đang cài trong triều.
```

- **Nhãn chữ đi kèm số** (THÂN THIẾT (52)) — nhờ giai đoạn hảo cảm 5.1d, AI đọc nhãn dễ hơn số trần, ít hiểu sai.
- **Chi tiết giảm dần theo liên quan:** NPC trong cảnh đầy đủ; NPC vắng mặt chỉ tên + quan hệ; hệ thống không liên quan lượt này (vd kinh tế vùng khi đang tâm sự trong sảnh) có thể lược. Điều tiết bởi ngân sách 16bis.5.
- **Field `_`/`$` xử lý đúng:** field `$` (bí mật NPC) AI đọc được nhưng khối render này KHÔNG hiển thị cho người chơi (ẩn UI); field `_` (readonly) hiển thị để AI biết nhưng prompt cập nhật (5.7.4) cấm AI ghi vào.

#### 5.7.4 Luồng GHI — cập nhật state sau lượt (read → write)

Sau khi AI tường thuật, nó trả khối `mvu_update` phản ánh những gì vừa xảy ra **trong chính lời kể**. Engine áp vào state, rồi hiệu ứng lan toả:

```
AI trả lời = [văn tường thuật] + [thẻ ngữ nghĩa nếu có] + [khối mvu_update JSON]
        │
        ├─→ [văn] → hiển thị chat (đã ẩn JSON patch & thẻ kỹ thuật, mục 5.5)
        │
        ├─→ [thẻ] → engine đọc → kích hoạt hệ con:
        │       <combat_trigger> → mở Battle Resolver (7.9) → tự sinh patch riêng
        │       <council_session>/<raven_scroll> → render UI + chờ lựa chọn người chơi
        │
        └─→ [mvu_update] → applyPatch(state, ops) (5.3, 5 op) →
                │
                ▼
        ┌──────────────────────────────────────────────┐
        │ HIỆU ỨNG LAN TOẢ (engine tự chạy sau patch)   │
        │ • affinityStage: đổi số Hảo Cảm → cập nhật     │
        │     nhãn Giai Đoạn + toast nếu vượt ngưỡng (5.1d)│
        │ • tuổi NPC nếu Năm đổi (5.1e)                   │
        │ • danh tiếng đổi → Thái Độ các Nhà dịch (16.4) │
        │ • onTurnAdvance nếu thời gian trôi: xây dựng,   │
        │     quân di chuyển, kinh tế, sự kiện (6.2/10-17)│
        │ • kết tinh trí nhớ: ký ức mới, phai ký ức yếu   │
        │     (16bis.2); tóm tắt nếu vượt ngưỡng          │
        └──────────────────────────────────────────────┘
                │
                ▼
        State mới = nguồn chân lý cho lượt kế (quay lại 5.7.2)
```

**Vòng khép kín:** state lượt N+1 phản ánh mọi thứ xảy ra ở lượt N. Vì lượt kế lại render state này vào prompt (5.7.3), AI **luôn** thấy hậu quả hành động trước — kể cả khi chat gốc đã trôi khỏi context. Đây là lý do hệ thống không quên: **trí nhớ nằm ở state, không ở chat.**

#### 5.7.5 Ai được ghi cái gì — ranh giới AI ↔ Engine

Để tránh xung đột (AI và engine cùng sửa một field → loạn số), phân quyền ghi rõ ràng:

| Field | AI ghi (qua `mvu_update`)? | Engine ghi? | Lý do |
|---|---|---|---|
| Hảo Cảm, quan hệ, vị trí, túi đồ, NPC mới, ngày/mùa | ✅ | — | AI kể ra thì AI cập nhật |
| Nhãn Giai Đoạn Quan Hệ, Giai Đoạn Đời | ❌ | ✅ (suy từ số) | Tránh AI set nhãn lệch số (5.1d/5.1e) |
| Field prefix `_` (HP trong trận, `_Seed`, `_Log`, kết quả Battle Resolver) | ❌ (cấm) | ✅ | Engine giữ số chiến đấu/công thức (mục 7.9) |
| Quân số sau trận, thương vong, đổi chủ lãnh địa | ❌ | ✅ (Battle/siege resolver) | Kết quả tính bằng seed, không để AI bịa |
| Tiến độ xây dựng, quân đang di chuyển, thu chi kinh tế | ❌ | ✅ (onTurnAdvance loops) | Engine tick theo thời gian AI báo đã trôi |
| Tóm tắt, nhãn bậc, tuổi | ❌ | ✅ | Engine dẫn xuất |

Quy tắc gọn cho AI (sẽ nằm trong prompt 5.7.4/[mvu_update]): **"Chỉ cập nhật cái ngươi trực tiếp gây ra bằng lời kể. Không đụng field bắt đầu bằng `_`. Không tự tính kết quả trận đánh, quân số, hay tiến độ công trình — engine lo."**

#### 5.7.6 Sơ đồ một lượt hoàn chỉnh (tổng hợp)

```
      ┌─────────────────────── MỘT LƯỢT CHƠI ───────────────────────┐
      │                                                              │
 [Người chơi gõ] → buildPrompt: {luật+prompt cập nhật} + {STATE render}│
      │              + {ký ức T2} + {LORE active ⟵EJS đọc STATE} +    │
      │              + {tóm tắt T3} + {chat thô T4}                   │
      │                          │                                   │
      │                          ▼                                   │
      │                    [AI sinh phản hồi]                        │
      │                          │                                   │
      │        ┌─────────────────┼──────────────────┐               │
      │        ▼                 ▼                  ▼               │
      │     [văn kể]         [thẻ nếu có]      [mvu_update]          │
      │        │                 │                  │               │
      │   hiển thị chat     kích hoạt hệ con    applyPatch → STATE   │
      │   (ẩn JSON/thẻ)     (combat/hội đồng)        │               │
      │                          │                  ▼               │
      │                   engine sinh patch    HIỆU ỨNG LAN TOẢ      │
      │                          └──────┬───────────┘               │
      │                                 ▼                            │
      │                       STATE MỚI (nguồn chân lý)              │
      │                                 │                            │
      │                    (kết tinh trí nhớ, tóm tắt nếu cần)       │
      └─────────────────────────────────┼────────────────────────────┘
                                        ▼
                              [Lượt kế: quay lại đầu, STATE mới vào prompt]
```

Toàn bộ engine chỉ là vòng lặp này chạy đi chạy lại. Mọi hệ thống lớn (chiến đấu, chính trị, kinh tế, trí nhớ) đều **cắm vào một trong hai nửa**: nửa ĐỌC (nuôi context) hoặc nửa GHI (biến đổi state). Hiểu 5.7 là hiểu cách chúng phối hợp.

---

## 5bis. Hệ thống Xác Suất Thống Nhất (Unified Probability & Dice Engine)

> Prompt đã có RNG rải rác: combat 2D6 (7.9.3), `resolveFieldBattle` seed (7.5), ám sát `P(thành công)` (14.3), skill check sự kiện (17.1), phản trắc/số phận tướng (7.7). Mục này **gom tất cả về MỘT engine xác suất chung** để mọi thứ nhất quán, tái lập được, test được — và để bất kỳ hệ thống nào (kể cả thêm sau) đều dùng cùng một cách gieo may rủi. Nguyên tắc bao trùm khớp toàn app: **engine đổ xúc xắc & tính xác suất; AI kể lại kết quả.** AI không tự quyết thành/bại của hành động có rủi ро — nó mô tả diễn biến dẫn tới kết quả engine đã chốt.

Đặt trong `engine/probability/` — thuần, không side-effect, test bằng seed cố định.

### 5bis.1 Lõi RNG có hạt giống (Seeded RNG Core)

Toàn app dùng **một PRNG seedable duy nhất** (vd `seedrandom`, hoặc PRNG tự viết như mulberry32/xoshiro), không bao giờ gọi `Math.random()` trực tiếp cho bất cứ thứ gì ảnh hưởng state. Lý do: cùng seed → cùng kết quả → **reroll/undo không đổi kết quả đã chốt** (mục 5.3), và **test tái lập** được.

```ts
// engine/probability/rng.ts
type RNG = () => number;   // trả 0..1

function makeRng(seed: number | string): RNG { /* seedrandom(seed) */ }

// SEED GỐC CỦA VÁN: cố định khi tạo nhân vật, lưu trong state (readonly)
"_Seed Gốc": z.coerce.number().int().prefault(0),   // thêm vào _engineMeta (mục 5.1)

// SEED THEO SỰ KIỆN: mỗi lần cần roll, tạo seed dẫn xuất từ (seed gốc + bộ đếm + nhãn)
// → mỗi roll độc lập nhưng vẫn tái lập; reroll cùng lượt cho cùng chuỗi roll
function eventSeed(rootSeed: number, turnCount: number, label: string): number {
  return hash(`${rootSeed}:${turnCount}:${label}`);   // hash ổn định (vd cyrb53)
}
```

**Streams (luồng roll tách biệt):** các hệ thống khác nhau dùng nhãn khác nhau (`"combat"`, `"social"`, `"event"`, `"treason"`...) để roll của hệ này không "ăn" chuỗi ngẫu nhiên của hệ kia — reroll một trận đánh không làm đổi kết quả một cuộc thuyết phục ở cùng lượt. Đây là lý do dùng `eventSeed(root, turn, label)` thay vì một RNG global chạy tuần tự.

**Nguồn seed:** `_Seed Gốc` sinh khi tạo nhân vật (từ thời gian + lựa chọn, hoặc để người chơi nhập "seed thế giới" như game roguelike — tùy chọn hay). Trận đánh có `_Seed` riêng (7.12) dẫn xuất từ đây.

> **Quy ước tên:** các mục khác (7.5, 7.7, 14.1-14.2, 15.2, 17.1...) viết `seededRandom(...)` như bí danh minh hoạ cho một lần lấy số ngẫu nhiên tái lập được — tất cả **hiện thực bằng lõi RNG này** (`makeRng`/`eventSeed`), không phải một RNG riêng. Đọc `seededRandom(seed)` = "lấy số 0..1 từ lõi RNG với seed dẫn xuất".

### 5bis.2 Kiểm Định Thống Nhất (Unified Check) — xương sống mọi hành động có rủi ro

**Mọi hành động phi chiến đấu có thể thành/bại** (thuyết phục, lừa gạt, trộm cắp, do thám, ẩn nấp, chữa bệnh, mưu đồ, mặc cả, dò xét nói dối, warg, đọc điềm...) đi qua **một hàm duy nhất** `resolveCheck`. Không mỗi hệ thống tự bịa công thức — tất cả gọi chung, nên cân bằng đồng nhất và AI luôn hiểu cách đọc kết quả.

**Mô hình d100 (phần trăm) — trực quan cho người chơi:**
```
resolveCheck({ chỉSốChính, kỹNăng, thiênPhú, độKhó, hoànCảnh, seed }):
  # 1. Tính ngưỡng thành công (target %), 5..95 (luôn chừa 5% hai đầu — không bao giờ 0%/100%)
  target = BASE                                    # nền 50%
         + chỉSốChính_scaled                       # (Chỉ Số Cốt Lõi 1-20, mục 5.1f) → (giá trị-10)×3  → -27..+30
         + kỹNăng × 4                              # (Kỹ Năng 0-10, mục 5.1f) → 0..+40
         + thiênPhúBonus                           # cộng/trừ từ thiên phú liên quan (parser 5.1f-C1)
         + hoànCảnh                                # tình huống (có lợi/bất lợi, đạo cụ, đồng minh) -30..+30
         - độKhóDC                                 # độ khó việc (bảng 5bis.3)
  target = clamp(target, 5, 95)

  # 2. Đổ d100
  roll = 1 + floor(rng(seed) * 100)                # 1..100

  # 3. Phân bậc kết quả (5bis.4) theo khoảng cách roll vs target
  return gradeResult(roll, target)
```

- **Chỉ số chính** chọn theo bản chất việc: thuyết phục→Uy Tín, trộm/ẩn nấp→Nhanh Nhẹn, nhận nói dối→Tinh Tường, chữa bệnh/mưu lược→Trí Tuệ, áp đảo thể chất→Sức Mạnh, chịu đựng→Thể Chất. Kỹ năng chọn kỹ năng khớp (Thuyết Phục, Ẩn Nấp, Y Thuật...). Engine biết cặp (chỉ số, kỹ năng) nào cho loại việc nào qua một bảng ánh xạ.
- **AI KHÔNG tự quyết** thành/bại — khi lời kể dẫn tới một hành động có rủi ro, AI phát tín hiệu (thẻ hoặc cờ, 5bis.6) nêu *loại việc + độ khó ước lượng*; engine chạy `resolveCheck` rồi trả bậc kết quả; lượt kế AI tường thuật khớp bậc đó. Giống hệt luồng 2 lượt của combat (6.2).
- **Minh bạch với người chơi:** trước khi hành động rủi ro (nhất là trong sự kiện 17.1), UI hiện % thành công đã tính kèm breakdown (5bis.5: "Thuyết phục — ~68% · nền 50, Uy Tín +12, kỹ năng +16, độ khó −10") để người chơi cân nhắc, rồi animation xúc xắc khi chốt.

### 5bis.2b Bảng Ánh Xạ Việc → (Chỉ Số, Kỹ Năng) — CheckMap

`resolveCheck` (5bis.2) cần biết mỗi loại việc dùng **chỉ số cốt lõi** nào (5.1f-A) + **kỹ năng** nào (5.1f-D). Đây là bảng tra `checkMap` — data thuần trong `engine/probability/checkMap.ts`, **bạn chỉnh được không đụng engine**. Mỗi mục: `{ id, chỉSốChính, kỹNăng, phụ?, ghiChú }`. Khi AI phát tín hiệu một hành động (5bis.6), nó gắn `checkId`; engine tra bảng này để lấy đúng cặp (chỉ số, kỹ năng) rồi tính target.

**Công thức nhắc lại:** `target = 50 + (chỉSốChính−10)×3 + kỹNăng×4 + phụ + thiênPhú + hoànCảnh − DC`. "Phụ" là đóng góp nhỏ từ chỉ số/kỹ năng thứ hai (nếu có), tính bằng nửa hệ số (vd `(chỉSốPhụ−10)×1.5`) để không nhân đôi sức mạnh.

#### Nhóm Xã Hội (Uy Tín / Tinh Tường chủ đạo)

| checkId | Việc | Chỉ số chính | Kỹ năng | Phụ | Ghi chú |
|---|---|---|---|---|---|
| `persuade` | Thuyết phục ai làm/tin điều gì | Uy Tín | Thuyết Phục | — | +Hảo Cảm mục tiêu (5bis.5) |
| `intimidate` | Hù doạ, ép bằng uy thế | Uy Tín | Hù Doạ | Sức Mạnh (phụ) | +Uy Dũng danh vọng (16.4) |
| `deceive` | Lừa gạt, nói dối trơn tru | Uy Tín | Lừa Gạt | Tinh Tường | opposed vs Tinh Tường mục tiêu |
| `negotiate` | Mặc cả, đàm phán điều khoản | Uy Tín | Đàm Phán | Trí Tuệ | opposed vs đối tác; ảnh hưởng giá (15) |
| `court_etiquette` | Ứng xử đúng nghi thức cung đình | Uy Tín | Nghi Thức Cung Đình | — | thất bại → mất mặt, giảm Hảo Cảm quý tộc |
| `gather_rumor` | Moi tin đồn nơi quán xá/chợ | Tinh Tường | Thu Thập Tin Đồn | — | Nửa Vời = tin sai lệch |
| `detect_lie` | Nhận ra kẻ khác đang nói dối | Tinh Tường | Thu Thập Tin Đồn | — | opposed vs Lừa Gạt của đối phương |
| `inspire_troops` | Khích lệ ba quân trước trận | Uy Tín | Chỉ Huy Quân | — | thành công → +Sĩ Khí (nối 7.7) |
| `seduce` | Quyến rũ, mê hoặc | Uy Tín | Thuyết Phục | Nhanh Nhẹn | tùy bối cảnh/độ tuổi hợp lệ |

#### Nhóm Lén Lút & Sinh Tồn (Nhanh Nhẹn / Tinh Tường / Thể Chất)

| checkId | Việc | Chỉ số chính | Kỹ năng | Phụ | Ghi chú |
|---|---|---|---|---|---|
| `sneak` | Ẩn nấp, đi không gây tiếng | Nhanh Nhẹn | Ẩn Nấp | — | opposed vs Tinh Tường lính canh |
| `steal` | Móc túi, trộm vật | Nhanh Nhẹn | Ẩn Nấp | — | Đại Thất Bại = bị bắt quả tang |
| `pick_lock` | Cạy khoá, mở cơ quan | Nhanh Nhẹn | Ẩn Nấp | Trí Tuệ | cần đồ nghề (trang bị 5.1f-E) |
| `track` | Lần theo dấu vết | Tinh Tường | Lần Theo Dấu Vết | — | môi trường ảnh hưởng DC |
| `hunt` | Săn bắn kiếm ăn | Tinh Tường | Săn Bắn | Nhanh Nhẹn | nối lương thực khi hành quân |
| `climb` | Leo trèo vách/tường | Sức Mạnh | Leo Trèo | Nhanh Nhẹn | Đại Thất Bại = ngã, mất HP |
| `endure_weather` | Chịu đựng rét/bão/nắng gắt | Thể Chất | Chịu Đựng Thời Tiết | — | quan trọng Era Đông/phương Bắc |
| `escape` | Tẩu thoát khỏi truy đuổi/trói | Nhanh Nhẹn | Ẩn Nấp | Thể Chất | opposed vs kẻ đuổi |
| `first_aid` | Sơ cứu vết thương tại chỗ | Trí Tuệ | Sơ Cứu | — | thành công → hồi HP nhẹ |

#### Nhóm Trí Tuệ & Học Vấn (Trí Tuệ / Tinh Tường)

| checkId | Việc | Chỉ số chính | Kỹ năng | Phụ | Ghi chú |
|---|---|---|---|---|---|
| `scheme` | Bày mưu, gài bẫy chính trị | Trí Tuệ | Mưu Lược | Tinh Tường | nối âm mưu (14) |
| `recall_lore` | Nhớ ra tri thức sử/luật/gia phả | Trí Tuệ | Học Vấn | — | mở thông tin ẩn cho người chơi |
| `heal_disease` | Chẩn & chữa bệnh (Maester) | Trí Tuệ | Y Thuật Maester | — | dịch bệnh (khủng hoảng 8.5b) |
| `translate` | Đọc/dịch ngôn ngữ lạ | Trí Tuệ | Ngôn Ngữ | — | Valyrian/tiếng Man... |
| `read_terrain` | Đọc địa hình, chọn bãi chiến | Tinh Tường | Đọc Bản Đồ & Địa Hình | Trí Tuệ | +lợi thế địa hình combat (7.6) |
| `appraise` | Định giá vật phẩm/tài sản | Trí Tuệ | Buôn Bán | Tinh Tường | tránh bị lừa giá |
| `sense_motive` | Đọc vị ý đồ/tâm trạng NPC | Tinh Tường | Thu Thập Tin Đồn | Trí Tuệ | hé lộ Thái Độ thật (nối sương mù 7.5) |

#### Nhóm Thủ Công & Kinh Tế (Trí Tuệ / Sức Mạnh)

| checkId | Việc | Chỉ số chính | Kỹ năng | Phụ | Ghi chú |
|---|---|---|---|---|---|
| `forge` | Rèn đúc vũ khí/giáp | Sức Mạnh | Rèn Đúc | Trí Tuệ | chất lượng đồ ra theo bậc kết quả |
| `cook` | Nấu ăn (yến tiệc/hành quân) | Tinh Tường | Nấu Ăn | — | tiệc thành công → +Hảo Cảm khách |
| `trade` | Buôn bán kiếm lời | Uy Tín | Buôn Bán | Trí Tuệ | nối tuyến thương mại (15) |
| `build` | Chỉ đạo xây công trình | Trí Tuệ | Xây Dựng | — | nối lãnh địa (10), giảm thời gian/chi phí |

#### Nhóm Chiến Đấu ngoài trận đánh (Sức Mạnh / Nhanh Nhẹn)

Chiến đấu chính thức đi qua engine combat (mục 7), nhưng vài **kiểm định lẻ** liên quan vũ lực dùng `resolveCheck`:

| checkId | Việc | Chỉ số chính | Kỹ năng | Phụ | Ghi chú |
|---|---|---|---|---|---|
| `feat_of_strength` | Phá cửa, nâng vật nặng, vật tay | Sức Mạnh | Chiến Đấu Tay Không | Thể Chất | — |
| `horsemanship` | Điều khiển ngựa trong tình huống khó | Nhanh Nhẹn | Cưỡi Ngựa Chiến | — | phi nước đại địa hình hiểm, nhảy chướng ngại |
| `quick_draw` | Rút vũ khí/phản xạ chớp nhoáng | Nhanh Nhẹn | (vũ khí đang cầm) | — | giành ra đòn trước (nối initiative 7.1) |
| `disarm_trap` | Gỡ bẫy chiến trường/hầm | Nhanh Nhẹn | Ẩn Nấp | Tinh Tường | Đại Thất Bại = kích bẫy |

#### Nhóm Ma Thuật (gated theo Era + thiên phú — 5.1f)

Chỉ khả dụng khi nhân vật có thiên phú tương ứng + Era bật (mục 7.15). Ma thuật ASOIAF **bất định và có giá** — nên DC cao và Đại Thất Bại nặng:

| checkId | Việc | Chỉ số chính | Kỹ năng | Phụ | Ghi chú |
|---|---|---|---|---|---|
| `warg` | Nhập hồn thú (sói/quạ...) | Tinh Tường | Nhập Hồn Thú | Trí Tuệ | cần thiên phú Warg; do thám qua thú |
| `green_dream` | Chiêm mộng, thấy điềm | Tinh Tường | Chiêm Mộng | — | cần Greenseer; điềm mơ hồ, engine gieo hint |
| `fire_magic` | Thuật lửa R'hllor | Trí Tuệ | Thuật Lửa | Uy Tín | cần "Được R'hllor Chọn"; hiếm, tốn Pháp Lực |
| `brew_poison` | Pha chế/dùng độc dược | Trí Tuệ | Độc Dược | Tinh Tường | nối ám sát (14.3) |
| `faceless_art` | Nghệ thuật đổi mặt Vô Diện | Nhanh Nhẹn | Nghệ Thuật Vô Diện | Uy Tín | cực hiếm; đội lốt người khác |

#### Cơ chế ánh xạ động & fallback

- **AI gợi ý, engine chốt:** khi phát tín hiệu hành động (5bis.6), AI nêu `checkId` gần nhất + DC ước lượng. Nếu AI mô tả một việc **không có trong bảng** (roleplay mở luôn sinh tình huống lạ), engine **fallback**: (a) khớp mờ theo mô tả về checkId gần nhất, hoặc (b) AI tự chỉ định cặp (chỉ số, kỹ năng) hợp lý từ danh mục 5.1f, hoặc (c) dùng **chỉ số trần không kỹ năng** (kỹ năng = 0) cho việc không đòi chuyên môn. Không bao giờ kẹt — luôn có đường tính.
- **Kỹ năng chưa học (cấp 0):** vẫn check được, chỉ dựa chỉ số cốt lõi (kỹ năng đóng góp 0). Người chưa học Y Thuật vẫn thử sơ cứu bằng Trí Tuệ trần, xác suất thấp hơn nhiều — hợp lý.
- **Opposed check (việc có đối thủ):** với `deceive`/`negotiate`/`sneak`/`detect_lie`..., DC không cố định mà = ngưỡng dẫn từ chỉ số+kỹ năng liên quan của **đối phương** (vd lừa một mưu sĩ Trí Tuệ 18 khó hơn lừa lính quèn). Engine tính DC động từ state đối tượng.
- **Chỉ số phụ nhân nửa:** để một việc thưởng nhân vật "toàn diện" (vd đàm phán giỏi nhờ cả Uy Tín lẫn Trí Tuệ) mà không phá cân bằng — phụ chỉ +½ hệ số.
- **Bạn tùy biến:** thêm checkId mới, đổi cặp chỉ số/kỹ năng, chỉnh chỉ số phụ — tất cả trong `checkMap.ts`, engine đọc runtime. Muốn game thiên về mưu trí thì tăng vai Trí Tuệ ở nhiều việc; thiên về vũ lực thì ngược lại.

### 5bis.3 Thang Độ Khó chuẩn (Difficulty DC)

Một thang bậc dùng cho MỌI kiểm định — engine + AI cùng hiểu "khó tới đâu":

| Bậc | DC (trừ vào target) | Ví dụ |
|---|---|---|
| Dễ Ợt | 0 | Việc gần như ai cũng làm được, chỉ roll khi có áp lực |
| Dễ | 10 | Thuyết phục người vốn đã thiện cảm; trèo tường thấp |
| Thường | 20 | Mặc cả giá chợ; lẻn qua lính gác lơ đễnh |
| Khó | 35 | Thuyết phục lãnh chúa trung lập; đánh cắp vật được canh |
| Rất Khó | 50 | Lừa một mưu sĩ lọc lõi; ám sát mục tiêu có phòng vệ |
| Nan Giải | 65 | Thuyết phục kẻ thù tha mạng; do thám phủ được canh nghiêm ngặt |
| Gần Như Bất Khả | 80 | Xoay chuyển một quyết định lịch sử lớn bằng lời nói |

DC do AI ước lượng khi phát tín hiệu (theo bối cảnh), engine có thể tinh chỉnh bằng bảng. Với việc **có đối thủ** (mặc cả với NPC, dò nói dối), DC nâng theo chỉ số liên quan của đối thủ (kiểu "opposed check") thay vì DC cố định.

### 5bis.4 Bậc Kết Quả chuẩn (Result Grades) — dùng chung toàn app

Không chỉ nhị phân thắng/thua. Năm bậc, dựa trên khoảng cách giữa `roll` và `target`, cho kết quả có sắc thái + nguyên liệu để AI kể:

| Bậc | Điều kiện | Ý nghĩa |
|---|---|---|
| **Đại Thành Công** (Crit Success) | roll ≤ target−30 **hoặc** roll ≤ 5 (luôn) | Vượt mong đợi: thêm lợi ích bất ngờ (NPC không chỉ đồng ý mà còn thành đồng minh) |
| **Thành Công** | roll ≤ target | Đạt điều muốn |
| **Thành Công Nửa Vời** (Partial) | target < roll ≤ target+15 | Được, nhưng có cái giá/khuyết (thuyết phục xong nhưng NPC đòi điều kiện; trộm được nhưng bị thấy mặt) |
| **Thất Bại** | roll > target+15 | Không đạt |
| **Đại Thất Bại** (Crit Fail) | roll ≥ target+30 **hoặc** roll ≥ 96 (luôn) | Hỏng nặng + hậu quả xấu (bị lộ, gây thù, mất đồ, bị thương) |

- **Luôn chừa bất ngờ:** roll ≤5 luôn ít nhất Đại Thành Công, roll ≥96 luôn Đại Thất Bại — dù chỉ số cao/thấp tới đâu (đúng tinh thần "không bao giờ chắc chắn 100%" đã dùng ở combat 7.5). Người mạnh vẫn có thể vấp; người yếu vẫn có tia hy vọng.
- **Thành Công Nửa Vời** là bậc khiến truyện hay: hiếm khi mọi thứ trơn tru hoàn toàn — bậc này cho AI cớ tạo biến chuyển thú vị (đạt mục tiêu nhưng mở ra rắc rối mới), rất hợp giọng ASOIAF nơi mọi thắng lợi đều có giá.
- Bậc kết quả trả về cho AI dưới dạng nhãn + gợi ý hệ quả; AI kể khớp và (nếu cần) trả `mvu_update` áp thay đổi. Với việc có tác động số rõ (mặc cả giảm giá, trộm được X vàng), engine tự áp; việc thuần tường thuật thì AI kể.

### 5bis.5 Modifier gom từ toàn hệ thống (Modifier Sources)

`resolveCheck` cộng modifier từ mọi nguồn đã có, thống nhất một chỗ (không hệ nào tự cộng lén):
- **Chỉ số cốt lõi + kỹ năng** (5.1f) — nền tảng năng lực nhân vật.
- **Thiên phú** (5.1f-C, parser C1) — bonus/malus có điều kiện (Lưỡi Bạc +thuyết phục; Tiếng Xấu −xã hội với người trọng danh dự).
- **Trang bị** (5.1f-E) — vật phẩm liên quan (trang sức tăng uy tín; đồ nghề trộm tăng ẩn nấp).
- **Quan hệ NPC** (5.1d) — Hảo Cảm/Tin Cậy của đối tượng cộng vào việc xã hội với họ (thuyết phục người Thân Thiết dễ hơn nhiều).
- **Danh vọng** (16.4) — Uy Dũng cao → hù doạ dễ; Vinh Dự cao → người trọng danh dự tin lời hơn.
- **Hoàn cảnh** — địa lợi, có đồng minh hỗ trợ, có bằng chứng/đòn bẩy (tống tiền 14.3), thời điểm.
- **Độ Khó ván** (7.9.6) — Nhàn Hạ cộng nhẹ target cho người chơi; Chân Thực không thiên vị (hoặc trừ nhẹ). Áp thống nhất ở đây thay vì rải mỗi hệ.
- **Trạng thái nhân vật** — bị thương/kiệt sức/lâm bệnh (5.1b) trừ target các việc thể chất.

Engine phơi bày một **breakdown** (mảnh cộng/trừ) cho UI hiện minh bạch "vì sao 68%": nền 50, kỹ năng +32, Hảo Cảm +10, độ khó −24... — người chơi hiểu rõ, tin engine (giống combat log expand xem roll ở 7.11).

### 5bis.6 Ai roll cái gì — ranh giới Engine ↔ AI (rất quan trọng)

Phân định để không mâu thuẫn triết lý "engine giữ số":

| Loại ngẫu nhiên | Ai quyết | Cơ chế |
|---|---|---|
| Hành động có rủi ro & hệ quả (thành/bại một việc) | **Engine** (`resolveCheck`) | AI phát tín hiệu loại việc + DC → engine roll → AI kể kết quả |
| Kết quả chiến đấu (mọi quy mô) | **Engine** (mục 7) | Battle Resolver / combat 1v1, seed cố định |
| Sự kiện định kỳ (phản trắc, số phận tướng, biến cố turn) | **Engine** | roll theo `eventSeed`, xác suất từ state (7.7, 17.1) |
| Sinh sự kiện ngẫu nhiên (loại nào xảy ra) | **Engine chọn từ pool** đủ điều kiện, **AI kể** | weighted pick theo trọng số + điều kiện (17.1) |
| Chi tiết tường thuật thuần màu (màu áo NPC lạ, tên quán, thời tiết nhỏ không ảnh hưởng cơ chế) | **AI tự do** | không cần roll — cho AI ngẫu hứng, miễn không đụng số/state |
| Thời tiết ảnh hưởng combat/mùa | **Engine** (bảng xác suất theo mùa+vùng, 8.7) | roll ảnh hưởng hệ số 7.6 |

Ranh giới gọn: **cái gì có hệ quả cơ học (đổi state, thắng/thua, sống/chết) → engine roll và giữ số. Cái gì thuần màu sắc kể chuyện → AI tự do.** Khi nghi ngờ, nghiêng về engine roll để tái lập được.

### 5bis.7 Trọng số & Bảng xác suất tùy biến (Weighted Tables)

Cho các hệ thống cần "chọn ngẫu nhiên có trọng số" (sự kiện nào nổ ra, loại khủng hoảng, chiến lợi phẩm, biến cố thời tiết), một helper chung:
```ts
// engine/probability/weightedPick.ts
function weightedPick<T>(items: { value: T; weight: number; condition?: () => boolean }[], rng: RNG): T {
  const pool = items.filter(i => !i.condition || i.condition());  // lọc điều kiện trước
  // ... chọn theo tổng trọng số
}
```
- Dùng cho: pool sự kiện (17.1), bảng rơi đồ sau trận (7.10), khủng hoảng khởi đầu (8.5b), thời tiết theo mùa (8.7), biến cố kinh tế (15). Mỗi bảng là data thuần (`content/.../tables.ts`) — **bạn chỉnh trọng số được mà không đụng engine**, đúng tinh thần tùy biến (9.6.2).
- Trọng số có thể **động theo state**: sự kiện "nạn đói" nặng trọng số hơn khi Lương thấp; "ám sát" trọng số cao hơn khi ngươi nhiều kẻ thù. Điều kiện + trọng số động khiến may rủi *có ngữ cảnh*, không phi lý.

### 5bis.8 Nối vào phần còn lại (thay các RNG lẻ về đây)

Các mục sau **dùng chung** engine này thay vì tự chế:
- **Combat (7):** `_Seed` trận + `fogRoll` (7.9.3) là ứng dụng của 5bis.1; kết quả trận không dùng `resolveCheck` (có công thức Battle Power riêng) nhưng **cùng lõi RNG** để tái lập.
- **1v1 (7.14):** to-hit/damage roll qua lõi RNG; các đòn "cơ hội" có thể dùng `resolveCheck` (né/đỡ).
- **Ám sát & mưu đồ (14.3):** `P(thành công)` cũ → viết lại thành `resolveCheck` với chỉ số Nhanh Nhẹn/kỹ năng sát thủ vs phòng vệ mục tiêu (opposed). Đại Thất Bại = bị bắt/lộ (hậu quả ngoại giao nặng như đã nêu).
- **Sự kiện & skill check (17.1):** skill check trong lựa chọn sự kiện → `resolveCheck`; sinh sự kiện → `weightedPick`. Animation xúc xắc (17.1) hiển thị roll của engine.
- **Phản trắc, số phận tướng (7.7):** roll `eventSeed` label `"treason"`/`"general_fate"`, xác suất từ state (Trung Thành, mức bại).
- **Ngoại giao (13/12.1):** xin viện binh, khả năng bị đâm sau lưng → `resolveCheck` dựa Thái Độ Các Nhà; hoặc để AI sáng tạo trong khung nếu tác động nhỏ (như mục 12.1 đã lưu ý — không phải mọi thứ cần công thức, nhưng khi cần số thì dùng engine này).
- **Kinh tế (15), thời tiết (8.7):** biến cố qua `weightedPick` trọng số động theo state.

Kết quả: **một cách gieo may rủi duy nhất** cho cả game — nhất quán, minh bạch, tái lập, tùy biến qua data. Không còn mỗi hệ một kiểu roll rời rạc.

---

## 6. Bảng trạng thái nhân vật (Status Panel) — chi tiết, realtime

Sub-panel tách rõ, mỗi cái là 1 component riêng để dễ test/tái sử dụng:
- **OverviewPanel:** tên, House (kèm huy hiệu SVG), cấp/EXP (progress bar), vàng.
- **VitalsPanel:** HP/Stamina/Mana — 3 thanh bar, đổi màu theo % (xanh > 50%, vàng 20–50%, đỏ < 20%).
- **InventoryPanel:** grid item, click mở modal chi tiết, phân loại theo tag (vũ khí/giáp/tiêu hao/quest item).
- **SkillsPanel:** danh sách kỹ năng + mô tả ngắn, badge cấp độ nếu có.
- **RelationshipsPanel:** danh sách NPC + affinity score (thanh -100→100) + status badge.
- **HouseInfoPanel:** huy hiệu, châm ngôn, vùng đất.
- **ReputationPanel:** danh tiếng theo từng phe (list hoặc radar chart nhỏ).
- **LocationPanel:** vị trí hiện tại — link nhanh mở Bản Đồ Tương Tác (mục 9) đúng vị trí đang đứng.
- **CalendarPanel:** ngày/giờ/mùa Westeros + thời tiết hiện tại.
- **StatusEffectsPanel:** buff/debuff, icon + tooltip mô tả + thời gian còn lại (tính theo turn hoặc theo ngày trong game).
- **RealmPanel** (chỉ hiện nếu nhân vật chính có lãnh địa/chức vụ triều đình): shortcut nhanh tới Lãnh Địa (mục 10) và Tiểu Hội Đồng (mục 13) đang liên quan.
- **ReputationPanel (đa chiều)** (mục 16.4): 4 trục Vinh Dự / Nhân Từ / Uy Dũng / Xảo Quyệt dạng radar hoặc 4 thanh.
- **IntriguePanel** (chỉ hiện khi có điệp viên/âm mưu đang chạy — mục 14): danh sách điệp viên (độ thâm nhập, mức bị nghi ngờ), âm mưu đang tiến hành (tiến độ, độ bại lộ), con tin đang giữ.
- **EconomyPanel** (chỉ hiện khi có lãnh địa — mục 15): tổng thu/chi mỗi turn, tuyến thương mại đang hoạt động, mức thuế hiện tại, cảnh báo khủng hoảng (nạn đói/nổi loạn sắp xảy ra).
- **QuestTracker** (mục 17.2): quest đang làm nổi bật nhất + hạn chót, mở rộng thành Journal đầy đủ khi bấm.

Nguyên tắc chung: panel của 1 hệ thống **chỉ hiện khi hệ thống đó đang có dữ liệu liên quan** (chưa có lãnh địa thì ẩn EconomyPanel/RealmPanel), tránh làm rối UI cho người chơi chỉ muốn nhập vai đơn thuần.

**Responsive:** PC = sidebar cố định (có thể thu gọn/mở rộng); mobile = bottom-sheet kéo lên từ cạnh dưới (dùng thư viện gesture nhẹ hoặc tự viết touch handler), không che khuất ô nhập chat khi đóng, có tab chuyển nhanh giữa các sub-panel trên mobile để tránh cuộn quá dài.

**Theme pack theo Nhà/giai đoạn truyện** (tham khảo cách các card trước đó có nhiều bộ theme riêng cho từng giai đoạn lịch sử, chỉ 1 bộ active tại 1 thời điểm): định nghĩa Status Panel bằng CSS variables (`--accent-primary`, `--accent-secondary`, `--panel-texture`...) thay vì hard-code màu, rồi tạo sẵn vài theme pack (Stark = xám/xanh băng giá, Lannister = đỏ/vàng, Targaryen = đen/đỏ rồng...). Theme tự đổi khi nhân vật chính đổi Nhà phục vụ, hoặc người chơi tự chọn thủ công trong Settings > Appearance.

### 6.1 Layout tổng thể màn hình chơi (Game Screen)

App vận hành **hybrid**: khung chat (nhập vai) và các panel/nút hành động (quản lý-chiến thuật) quan trọng ngang nhau, luôn truy cập được cùng lúc chứ không phải 2 chế độ tách rời. Layout đề xuất:

> Lưu ý ký hiệu: trong các sơ đồ và bảng dưới đây, `[icon:tên]` là **chỗ đặt icon SVG tự vẽ** (theo ràng buộc mỹ thuật điểm 1-2 ở đầu prompt) — KHÔNG render chữ "[icon:...]" cũng KHÔNG render emoji, mà thay bằng SVG component tương ứng.

**PC (≥1024px) — bố cục 3 cột:**
```
┌──────────────────────────────────────────────────────────────┐
│  TOP BAR: [[icon:menu] Menu] Tên NV · Nhà(huy hiệu) · [icon:lịch] Ngày/Mùa · Turn# · [[icon:cài-đặt]]  │
├────────────┬────────────────────────────────┬────────────────┤
│  LEFT RAIL │        KHUNG CHAT (giữa)        │  STATUS PANEL   │
│  (nav dọc) │  - lịch sử tin nhắn (virtual)  │  (mục 6, cuộn)  │
│  icon tab: │  - thẻ ngữ nghĩa render inline │  các sub-panel  │
│  [icon:chat] Chat   │  - ô nhập + nút gửi            │  hiện theo ngữ  │
│  [icon:bản-đồ] Bản đồ │                                │  cảnh (6.x)     │
│  [icon:lãnh-địa] Lãnh địa│  ┌── ACTION DECK (dưới chat) ─┐ │                 │
│  [icon:quân-sự] Quân sự │  │ nút hành động theo ngữ cảnh│ │                 │
│  [icon:triều-đình] Triều  │  └────────────────────────────┘ │                 │
│  [icon:mưu-đồ] Mưu đồ │                                │                 │
│  [icon:nhật-ký] Nhật ký│                                │                 │
└────────────┴────────────────────────────────┴────────────────┘
```
- **Left rail** đổi nội dung cột giữa: Chat là mặc định; bấm [icon:bản-đồ]/[icon:lãnh-địa]/[icon:quân-sự]... thay cột giữa bằng màn hình hệ thống tương ứng (bản đồ toàn màn, bảng lãnh địa...) **nhưng vẫn giữ được chat ở tab** — không mất mạch truyện. Badge số đỏ trên icon khi có việc cần chú ý (lãnh địa bị vây, quest sắp hết hạn, âm mưu sắp lộ).
- **Status panel bên phải** luôn hiện (thu gọn được), phản ánh realtime state.
- **Action Deck** (dưới chat): dải nút hành động **đổi theo ngữ cảnh hiện tại** (xem 6.3) — đây là cầu nối chính giữa "bấm nút" và "nhập vai".

**Mobile (<768px) — 1 cột + điều hướng dưới:**
```
┌─────────────────────────────┐
│ TOP: Nhà · [icon:lịch]Ngày · Turn# [icon:cài-đặt] │
├─────────────────────────────┤
│                             │
│      KHUNG CHAT (full)      │
│   thẻ ngữ nghĩa inline      │
│                             │
├─────────────────────────────┤
│  ACTION DECK (chip cuộn ngang)│
├─────────────────────────────┤
│ ô nhập chat          [Gửi] │
├─────────────────────────────┤
│ [icon:chat]  [icon:bản-đồ]  [icon:lãnh-địa]  [icon:quân-sự]  [icon:triều-đình]  [icon:nhật-ký]  ⋯ │ ← bottom nav
└─────────────────────────────┘
```
- Bottom nav thay cột giữa (full-screen từng hệ thống). Status panel = bottom-sheet vuốt lên từ mép (nút [icon:bảng] hoặc vuốt). Mọi màn hình hệ thống trên mobile là full-screen có nút ← quay lại chat.

### 6.2 Vòng đời 1 turn — mọi thứ trôi theo diễn biến do AI dẫn dắt

**Triết lý cốt lõi (đọc kỹ — định hình toàn bộ cách chơi):** game **KHÔNG có cơ chế tua/đẩy thời gian thủ công** (không nút "trôi 1 ngày/tuần", không "nghỉ/chờ", không đẩy lượt trống). **Thời gian và mọi diễn biến trôi hoàn toàn theo lời kể của AI.** Người chơi hành động → AI viết diễn biến → hệ thống phản ứng theo đúng những gì AI vừa kể → state cập nhật → lượt kế AI kể tiếp dựa trên state mới. Thế giới không "tick" độc lập; nó chuyển động qua từng đoạn tường thuật.

**Vòng lặp cơ bản mỗi lượt:**
```
1. Người chơi nhập hành động (gõ chat tự do HOẶC bấm nút Action Deck sinh ra 1 câu hành động, sửa được trước khi gửi)
2. buildPrompt() — chèn state hiện tại + lore (EJS render giá trị động, mục 4.3) + ký ức NPC liên quan (mục 16.1)
3. Gọi AI (streaming) — AI tường thuật diễn biến + trả khối mvu_update (JSON patch) phản ánh những gì vừa xảy ra trong lời kể
4. applyPatch() cập nhật StatDataSchema (mục 5.3) — biến trạng thái đổi ĐÚNG theo diễn biến AI vừa viết
5. Nếu diễn biến AI kể có kích hoạt 1 hệ thống chuyên (chiến đấu, sự kiện lớn...) → chạy hệ thống đó (xem luồng bên dưới)
6. Diff hiển thị: panel nào đổi thì highlight/animate (mục 6.4)
7. Action Deck tính lại nút khả dụng cho ngữ cảnh mới
```

**Điểm mấu chốt:** state đổi vì **AI kể ra điều đó**, không phải vì đồng hồ chạy. Nếu AI viết "ngươi nghỉ tại quán trọ ba ngày", engine mới nhích ngày +3 (đọc từ patch AI trả). Nếu AI viết "mùa đông đã tràn tới phương Bắc", mùa mới đổi. Engine **phản ứng theo tường thuật**, giữ số cho chính xác, chứ không tự ý đẩy thời gian khi người chơi chưa làm gì.

**Luồng khi diễn biến kích hoạt một hệ thống chuyên (ví dụ CHIẾN ĐẤU — mẫu quan trọng nhất, áp dụng tương tự cho các hệ thống khác):**

Đây là cách các hệ thống (chiến đấu mục 7, vây thành 12.2, sự kiện 17...) đan vào mạch tường thuật, **trải trên 2 lượt chat**:

```
LƯỢT N (kích hoạt + phân giải cơ chế):
  a. AI đang kể, dẫn tới tình huống nhân vật phải chiến đấu với ai đó
     (vd "Gã lính đánh thuê rút kiếm lao về phía ngươi...")
  b. AI báo hiệu kích hoạt chiến đấu — bằng thẻ ngữ nghĩa (mục 5.6) hoặc cờ trong mvu_update
     (vd đặt stat_data."Chế Độ Hiện Tại" hoặc phát 1 thẻ <combat_trigger> với thông tin đối thủ)
  c. Engine mở hệ thống chiến đấu (mục 7): người chơi tự chỉ huy (turn-based 7.1)
     hoặc auto-resolve (7.5) — ENGINE GIỮ SỐ, tính trúng/trượt/sát thương bằng công thức + seed,
     AI KHÔNG bịa kết quả
  d. Kết thúc trận, engine tính xong: thắng/thua, thương tích, EXP, vật phẩm rơi
  e. applyPatch() cập nhật NGAY vào bảng trạng thái: HP giảm, +EXP, +vật phẩm, quan hệ đổi...
     (các biến cập nhật ngay sau khi cơ chế phân giải, đúng như bạn mô tả)

LƯỢT N+1 (AI tường thuật kết quả):
  f. buildPrompt() lần kế CHÈN kết quả trận đấu (đã nằm trong state + có thể kèm 1 tóm tắt kết quả
     dạng ẩn cho AI đọc) vào context
  g. AI đọc kết quả và VIẾT DIỄN BIẾN dẫn tới việc chiến thắng/thất bại
     (vd "Lưỡi kiếm của ngươi tìm thấy khe hở nơi giáp gã... gã đổ gục. Ngươi thở dốc, tay còn run,
      nhưng trận này ngươi đã thắng." — khớp với HP/EXP đã cập nhật ở lượt N)
  h. Mạch truyện chảy tiếp tự nhiên từ kết quả đó
```

Nguyên tắc chung của mẫu này: **cơ chế phân giải trước (engine, chính xác) → state cập nhật ngay → lượt kế AI tường thuật hệ quả (đúng theo số đã chốt)**. AI không bao giờ vừa kể vừa tự quyết thắng thua ở cùng một chỗ — luôn để engine phân giải, rồi mới kể lại. Điều này đảm bảo tường thuật và số liệu không bao giờ mâu thuẫn (AI không thể kể "ngươi thắng" trong khi engine tính ra thua).

Các hệ thống khác đan vào tương tự: sự kiện ngẫu nhiên (17.1) do AI dẫn ra trong lời kể → hiện thẻ lựa chọn → người chơi chọn → áp patch → lượt kế AI kể hệ quả; hoàn tất công trình/quân tới nơi (10.3/11.4) chỉ xảy ra khi diễn biến truyện đã trôi đủ (AI kể thời gian trôi), lúc đó tick loop tương ứng và AI báo tin trong mạch kể (chim ưng đưa thư, sứ giả báo cáo...) chứ không bằng đồng hồ tự chạy.

**Về khái niệm "turn" / thời gian trôi và hàm `onTurnAdvance()`:** trong toàn bộ tài liệu này, khi nói "mỗi turn", "N turn", "±/turn" (vd chi phí xây dựng còn N turn, thu nhập/turn), **"turn" = một đơn vị thời gian trong game (thường 1 ngày), và số đơn vị trôi qua mỗi lượt do AI quyết định qua diễn biến kể** — KHÔNG phải "mỗi tin nhắn tự động +1". Cơ chế:
- AI trong khối `mvu_update` báo thời gian đã trôi bao nhiêu (vd cập nhật `stat_data."Thế Giới"."Ngày"` hoặc trả 1 field kiểu `"thời_gian_trôi": 3` khi kể "ba ngày sau...").
- Engine đọc số đó → gọi `onTurnAdvance()` **đúng số lần tương ứng** (trôi 3 ngày → tick 3 lần các loop xây dựng/di chuyển/kinh tế...). Nếu diễn biến chỉ là hội thoại trong vài phút (AI không kể thời gian trôi đáng kể), `onTurnAdvance()` **không chạy** — công trình không nhích, kho không đổi, vì trong truyện chưa đủ thời gian.
- Nhờ vậy tiến độ chiến lược (xây thành mất "10 ngày", quân hành quân "5 ngày") khớp tự nhiên với thời gian tường thuật: người chơi cà kê hội thoại cả buổi trong quán trọ thì công trình vẫn đứng yên; người chơi để truyện nhảy "một tháng sau" thì mọi loop tick 30 lần cùng lúc và AI tóm tắt những gì đã thay đổi. Thời gian phục vụ truyện, không ép truyện chạy theo đồng hồ.

### 6.3 Action Deck — nút hành động theo ngữ cảnh

Dải nút ngay dưới chat, **nội dung thay đổi theo state + vị trí + ai đang ở trong cảnh**. Đây là thứ khiến người chơi vừa nhập vai vừa "chơi" được mà không cần gõ mọi thứ:
- Mỗi nút khi bấm → **chèn 1 câu hành động vào ô chat** (người chơi sửa được trước khi gửi) HOẶC mở panel/modal thao tác (vd bấm "Xây dựng" mở panel lãnh địa). Nút không tự gửi ngay — cho người chơi quyền biên tập, giữ tính nhập vai.
- Ví dụ Action Deck theo ngữ cảnh:
  | Ngữ cảnh (state) | Nút gợi ý xuất hiện |
  |---|---|
  | Đang ở lãnh địa mình cai trị | [icon:lãnh-địa] Xây dựng · [icon:kinh-tế] Đặt thuế · [icon:quân-sự] Tuyển quân · [icon:dân-số] Duyệt dân tình |
  | Có NPC trong cảnh | [icon:chat] Trò chuyện · [icon:tặng-quà] Tặng quà · [icon:đề-nghị] Đề nghị · [icon:uy-hiếp] Uy hiếp (hiện theo quan hệ) |
  | Đang trong triều đình | [icon:triều-đình] Bổ nhiệm · [icon:nhật-ký] Ban lệnh · [icon:vận-động] Vận động · [icon:bàn-riêng] Bàn chuyện riêng |
  | Đang có chiến tranh | [icon:bản-đồ] Điều quân · [icon:chiến-trường] Xem chiến trường · [icon:đàm-phán] Đàm phán hoà |
  | Có điệp viên hoạt động | [icon:mưu-đồ] Chỉ thị điệp viên · [icon:báo-cáo-mật] Nhận báo cáo mật |
  | Mặc định (đang đi đường/tự do) | [icon:hành-động-tự-do] Hành động tự do · [icon:quan-sát] Quan sát · [icon:di-chuyển] Di chuyển · [icon:chat] Trò chuyện |
- Nút chỉ hiện khi **hợp lệ theo state** (không có lãnh địa → ẩn nút xây; không có quyền → ẩn nút bổ nhiệm, đúng logic mục 13.2). Tránh trưng nút làm được điều mà lore hiện tại cấm.
- **Không có nút tua/đẩy thời gian** (theo triết lý mục 6.2): mọi nút đều là hành động nhập vai cụ thể mà AI sẽ phản hồi bằng diễn biến. Nếu người chơi muốn "chờ" hay "để thời gian trôi", họ diễn đạt qua hành động nhập vai (vd gõ "Ta lui về nghỉ ngơi và chờ tin từ tiền tuyến") và AI kể tiếp diễn biến trong khoảng thời gian đó — thời gian nhích theo lời kể, không theo nút bấm cơ học.

### 6.4 Phản hồi trực quan khi state đổi (Game Feel)

Chi tiết nhỏ nhưng quyết định độ "đã" khi chơi:
- **Số nhảy có animation:** HP/Vàng/Trung Thành đổi → số đếm lướt (count-up/down) + flash màu (xanh khi tăng, đỏ khi giảm), không đổi cụp một cái.
- **Toast tinh gọn góc màn hình** cho thay đổi nhỏ ("+50 Vàng từ thuế", "Lãnh địa Winterfell: +1 Nông Trại"), gom nhóm nếu nhiều thay đổi cùng turn thay vì spam.
- **Badge cảnh báo đỏ** trên icon left rail/bottom nav khi có việc gấp; chuông nhẹ (tắt được) khi sự kiện quan trọng.
- **Delta panel:** khi mở lại 1 panel sau vài turn, đánh dấu "▲/▼" cạnh chỉ số đã đổi so với lần xem trước, để người chơi thấy ngay xu hướng (dân số đang giảm dần? trung thành đang tụt?).
- **Empty state có hồn:** panel chưa có dữ liệu không để trống trơn — hiện gợi ý nhập vai ("Ngươi chưa có lãnh địa nào. Hãy lập công hoặc chiếm lấy một vùng đất để bắt đầu xây dựng cơ nghiệp.").

### 6.5 Các vòng lặp gameplay & cách hệ thống kết nối (điều khiến game thú vị)

Các hệ thống không rời rạc — chúng khoá vào nhau tạo thành vòng lặp có ý nghĩa. Đây là "trải nghiệm chơi" mà mọi mục kỹ thuật phía sau phục vụ:

**Vòng lặp cốt lõi (mỗi lượt chat):** nhập vai/ra quyết định → AI tường thuật diễn biến + state đổi theo đúng lời kể → thấy hệ quả ngay (chat + panel) → cơ hội/vấn đề mới hiện ra → lại quyết định. Chat làm "mặt tiền cảm xúc", panel làm "bộ máy hệ quả" — hai thứ củng cố nhau chứ không tách rời. Thời gian trong game nhích theo diễn biến AI kể (mục 6.2), không theo đồng hồ cơ học.

**Vòng lặp quyền lực (dài hạn):** nhân vật quèn → lập công/mưu đồ → có lãnh địa → xây dựng kinh tế → nuôi quân → bành trướng/tham chính → có ảnh hưởng triều đình → tranh ngôi/định hình lịch sử. Mỗi nấc mở khoá hệ thống mới (có lãnh địa mới mở kinh tế/xây dựng; vào triều mới mở bổ nhiệm/âm mưu cấp cao), nên độ phức tạp tăng dần tự nhiên chứ không đổ hết một lúc.

**Các hệ thống nuôi lẫn nhau** (ví dụ chuỗi nhân quả người chơi sẽ cảm nhận):
- Kinh tế → Quân sự: kho lương/vàng (mục 15) nuôi quân (11); hết lương → quân rã ngũ, không đánh được.
- Quân sự → Chính trị: thắng trận (7) → danh tiếng Uy Dũng (16.4) → các Nhà đổi thái độ (5.1) → dễ liên minh/hôn nhân (13.4).
- Chính trị → Quân sự: hôn nhân/liên minh (13.4) → xin được viện binh (12.3); âm mưu (14) → lật đối thủ không cần đánh.
- Mưu đồ ↔ Tình báo: điệp viên (14.1) cấp tin → mở âm mưu/phục kích/tống tiền; nhưng địch cũng cài điệp viên mình → phải phòng thủ.
- Thời gian → Kinh tế: khi diễn biến truyện trôi tới mùa đông (AI kể, mục 8.7) → nạn đói nếu không tích lương (15.4) → nổi loạn → mất lãnh địa. "Winter is coming" thành áp lực thật — nhưng mùa đông tới vì cốt truyện dẫn tới đó, không vì bộ đếm turn tự chạy.
- NPC nhớ (16.1) → mọi hệ thống: NPC bạn từng đối xử tốt/xấu sẽ trung thành/phản trắc trong chiến tranh, bổ nhiệm, âm mưu — hành động cũ vọng lại về sau.

**Nhiều lối chơi (không ép 1 con đường):** người chơi có thể thắng bằng kiếm (chinh phạt quân sự), bằng vàng (thao túng kinh tế/thương mại), bằng mưu (ám sát/âm mưu chiếm quyền), hoặc bằng lời (ngoại giao/hôn nhân/liên minh). Danh tiếng đa chiều (16.4) và Action Deck theo ngữ cảnh (6.3) đảm bảo mỗi lối đều có công cụ riêng. Người thích thuần nhập vai vẫn chơi được — chỉ chat, panel ẩn bớt (mục 6 nguyên tắc ẩn panel không liên quan).

**Nhịp căng-chùng:** xen kẽ đoạn yên bình (xây dựng, hội thoại, quản lý) với đoạn cao trào (chiến tranh, sự kiện khủng hoảng, cột mốc lịch sử 17.3). Engine sự kiện (17.1) + timeline canon (17.3) chủ động tạo sóng gió khi mọi thứ quá phẳng, tránh game trôi vô vị.

---

## 7. Hệ thống chiến đấu (chiến thuật — 1 trận cụ thể)

**Cách chiến đấu đan vào mạch truyện (quan trọng — theo triết lý mục 6.2):** một trận đánh KHÔNG do người chơi bấm nút "chiến đấu" từ hư không, mà **nảy sinh từ diễn biến AI kể** (AI dẫn truyện tới chỗ nhân vật phải giao chiến). Trình tự trải trên 2 lượt: (1) AI kể tới tình huống chiến đấu → báo hiệu kích hoạt (thẻ ngữ nghĩa hoặc cờ trong `mvu_update`) → engine mở hệ thống chiến đấu bên dưới, phân giải bằng công thức + seed, cập nhật state ngay (HP/EXP/vật phẩm...); (2) lượt chat kế, AI đọc kết quả đã chốt trong state và **tường thuật diễn biến dẫn tới thắng/thua** cho khớp. Engine giữ số, AI kể lại — không bao giờ để AI vừa kể vừa tự quyết thắng thua ở cùng chỗ. Xem sơ đồ luồng đầy đủ ở mục 6.2.

### 7.1 Cơ chế lượt
- Turn-based, initiative = `d20 + mod(Nhanh Nhẹn)`, sắp xếp giảm dần → thứ tự hành động trong trận. (`d20` lấy từ lõi RNG 5bis; `mod(chỉ số)` = quy đổi chỉ số cốt lõi 1-20 sang bonus, vd `(chỉ số−10)/2` kiểu D&D.)
- AI đóng vai GM mô tả bằng lời, **engine tính toán mọi con số**, AI chỉ nhận kết quả (JSON) rồi tường thuật lại — không để AI tự quyết định trúng/trượt hay sát thương.

### 7.2 Công thức đề xuất
> `attackerModifier`/`attackerDamageModifier` dẫn từ **chỉ số cốt lõi + kỹ năng vũ khí** (5.1f): đòn cận chiến dùng `mod(Sức Mạnh) + cấp kỹ năng vũ khí đang cầm` (vd Kiếm & Khiên); đòn tầm xa dùng `mod(Nhanh Nhẹn) + cấp Cung/Nỏ`. `targetArmorClass` = `_Phòng Thủ` (5.1f-B, gồm giáp đang mặc). `damageReduction` từ giáp; vũ khí `valyrian`/`obsidian` bỏ qua phần lớn (7.14).
```
toHit = d20(seed) + attackerModifier          // d20 từ lõi RNG 5bis; attackerModifier = mod(chỉ số hợp đòn) + cấp kỹ năng vũ khí
hit = toHit >= targetArmorClass                // targetArmorClass = _Phòng Thủ (5.1f-B)
if hit:
  isCrit = (naturalRoll == 20)
  damage = rollDamageDice(weapon.damageDice) + attackerDamageModifier
  if isCrit: damage *= 2
  damage = max(damage - target.damageReduction, 0)
  target.hp -= damage
applyStatusEffectsIfAny(weapon, target) // vd vũ khí có "poison" -> áp debuff Poisoned
```
- Trạng thái debuff mẫu: `Bleed` (mất máu mỗi turn), `Poison` (mất máu + giảm stat theo thời gian), `Stun` (mất lượt), `Weakened` (giảm damage output).
- Trang bị: mỗi item có modifier riêng (`+atk`, `+def`, `+dex`…), cộng dồn vào công thức trên.

### 7.3 UI chiến đấu
- Thanh HP 2 phe hiển thị song song, combat log dạng feed cuộn được (mỗi dòng: ai làm gì, kết quả số, có thể expand xem chi tiết roll).
- Nút hành động nhanh (Tấn công / Phòng thủ / Dùng skill / Dùng item / Bỏ chạy).
- Kết thúc trận: áp EXP, vật phẩm rơi, thương tích còn lại vào MVU state qua patch chuẩn (dùng lại engine ở mục 5), kèm tường thuật trong thẻ `<battle_report>` (mục 5.6).

### 7.4 Quy mô lớn (đại chiến giữa 2 đội quân)
Trận đại quân: thay vì tính từng đơn vị, tính theo phe (tổng quân số, tổng sức mạnh trung bình) → công thức xác suất thắng dựa trên tỉ lệ lực lượng + modifier chiến thuật/địa hình, kết quả tóm tắt (thương vong ước tính, lãnh thổ thay đổi) thay vì combat log chi tiết từng roll.

**Schema đơn vị quân** (tham khảo pattern "Biên Chế Quân Sự" đã dùng thực tế, mở rộng thêm ở mục 11):
```ts
const MilitaryUnitSchema = z.object({
  "Tướng Chỉ Huy": safeString().prefault("Tạm Khuyết"),  // khớp key trong "Tướng Lĩnh" mục 7.7 nếu có
  "Số Lượng": z.coerce.number().int().min(0),
  "Hậu Cần": z.enum(["Dồi Dào", "Cầm Cự Được", "Cực Kỳ Thiếu Thốn"]).prefault("Cầm Cự Được"),
  "Sĩ Khí": z.enum(["Hăng Hái", "Ổn Định", "Dao Động", "Sắp Binh Biến"]).prefault("Ổn Định"),
  "Trang Bị": z.enum(["Trọng Giáp Tinh Nhuệ", "Đồng Bộ Chỉnh Tề", "Thô Sơ"]).prefault("Đồng Bộ Chỉnh Tề"),
  "Huấn Luyện": z.enum(["Tinh Nhuệ", "Thành Thạo", "Mới Lập Đội", "Rời Rạc"]).prefault("Mới Lập Đội"),
});
// trong StatDataSchema: "Biên Chế Quân Sự": z.record(safeString().describe("Tên đơn vị"), MilitaryUnitSchema).prefault({})
```
Mỗi enum này vừa dùng để **tính công thức thắng thua** (map enum → hệ số nhân, vd Hậu Cần "Cực Kỳ Thiếu Thốn" → -20% hiệu quả chiến đấu) vừa để **AI mô tả tường thuật** đúng tình trạng quân đội mà không cần bịa số. Mục 11-12 mở rộng schema này thêm loại quân, vị trí đồn trú, và lớp chiến lược bao ngoài (tuyên chiến, vây thành).

### 7.5 Công thức đại chiến (field battle) — chi tiết
Khi 2 lực lượng gặp nhau ngoài đồng trống, engine tính theo **sức mạnh hiệu dụng (Effective Power)** mỗi phe rồi ra kết quả xác suất, thay vì mô phỏng từng lính:
```
unitEffectivePower(unit):
  base = unit."Số Lượng"
  m = 1.0
  m *= { "Tinh Nhuệ":1.4, "Thành Thạo":1.15, "Mới Lập Đội":0.9, "Rời Rạc":0.7 }[unit.Huấn Luyện]
  m *= { "Trọng Giáp Tinh Nhuệ":1.3, "Đồng Bộ Chỉnh Tề":1.0, "Thô Sơ":0.75 }[unit.Trang Bị]
  m *= { "Hăng Hái":1.2, "Ổn Định":1.0, "Dao Động":0.8, "Sắp Binh Biến":0.5 }[unit.Sĩ Khí]
  m *= { "Dồi Dào":1.1, "Cầm Cự Được":1.0, "Cực Kỳ Thiếu Thốn":0.8 }[unit.Hậu Cần]
  m *= generalModifier(unit."Tướng Chỉ Huy")        // mục 7.7
  m *= terrainMultiplier(unit."Loại Quân", battle.terrain)  // mục 7.6
  return base * m

resolveFieldBattle(sideA[], sideB[], terrain, seed):
  # tương khắc loại quân (mục 11.2) áp trước khi cộng tổng
  powerA = Σ unitEffectivePower(u) * counterBonus(u, sideB) for u in sideA
  powerB = Σ unitEffectivePower(u) * counterBonus(u, sideA) for u in sideB
  ratio = powerA / (powerA + powerB)
  roll = seededRandom(seed)                          // 0..1, để tái lập + test
  winnerA = roll < clamp(ratio, 0.05, 0.95)          // luôn chừa 5% bất ngờ, không bao giờ chắc chắn 100%
  # thương vong: bên thua mất nhiều hơn, chênh lệch power càng lớn thương vong bên thua càng cao
  margin = abs(ratio - 0.5) * 2                       // 0..1
  loserCasualtyRate = 0.25 + margin * 0.45            // 25%..70%
  winnerCasualtyRate = 0.30 - margin * 0.20           // 10%..30%
  applyCasualties(); adjustMorale(); adjustWarScore() // mục 12.1
  return BattleResult { winner, casualties, capturedGenerals?, terrainAfter }
```
- Kết quả tường thuật qua thẻ `<battle_report>` (mục 5.6). Người chơi có thể chọn "tự chỉ huy" (chuyển sang combat chiến thuật turn-based mục 7.1 cho trận quan trọng) hoặc "giao cho tướng" (auto-resolve bằng công thức trên — nhanh hơn).

### 7.6 Địa hình (terrain)
```ts
const TerrainSchema = z.enum([
  "Đồng Bằng", "Rừng Rậm", "Đồi Núi", "Đầm Lầy", "Sông/Lối Vượt Sông",
  "Tuyết/Băng Giá", "Sa Mạc", "Thành Trì (thủ)", "Hẻm Núi"
]);
```
Bảng hệ số `terrainMultiplier(loạiQuân, terrain)` — mỗi địa hình thiên vị loại quân khác nhau:
| Địa hình | Kỵ Binh | Bộ Binh | Cung Thủ | Ghi chú |
|---|---|---|---|---|
| Đồng Bằng | 1.3 | 1.0 | 1.0 | kỵ binh tung hoành |
| Rừng Rậm | 0.6 | 1.1 | 1.2 | kỵ binh vô dụng, phục kích lợi |
| Đồi Núi | 0.7 | 1.2 | 1.1 | phe thủ cao điểm lợi |
| Đầm Lầy | 0.4 | 0.9 | 0.8 | mọi bên đều khổ, kỵ binh tệ nhất |
| Vượt Sông | 0.6 | 0.8 | 1.3 | bên đang vượt sông chịu phạt nặng |
| Tuyết/Băng | 0.7 | 0.85 | 0.9 | quân phương Bắc (Stark/Nhà quen lạnh) miễn phạt |
| Sa Mạc | 0.8 | 0.8 | 0.9 | quân Martell/Dorne miễn phạt |
| Hẻm Núi | 0.5 | 1.3 | 1.4 | ít quân thủ được trước nhiều quân (kiểu Bloody Gate) |

- Địa hình 1 trận lấy từ `MapRegion` nơi diễn ra (mục 9) hoặc AI chỉ định trong lời tường thuật khi hợp lý. "Nhà quen địa hình" (Stark↔tuyết, Martell↔sa mạc, Greyjoy↔biển) được miễn hệ số phạt tương ứng — bảng miễn trừ này trong `content/westeros/terrainAffinity.ts`.

### 7.7 Tướng lĩnh (Generals)
```ts
const GeneralSchema = z.object({
  "Chỉ Số Thống Soái": clampedStat(0, 100, 50),   // ảnh hưởng generalModifier
  "Chỉ Số Võ Lực": clampedStat(0, 100, 50),        // giá trị khi tham gia đấu tay đôi/xung phong
  "Đặc Tính": z.array(z.enum([
    "Kỵ Binh Đại Sư",        // +hệ số khi chỉ huy kỵ binh
    "Bậc Thầy Công Thành",   // +hiệu quả vây thành (mục 12.2)
    "Phòng Thủ Kiên Cường",  // +khi ở thế thủ
    "Táo Bạo",               // +power nhưng +thương vong bên mình
    "Thận Trọng",            // -thương vong bên mình nhưng -power
    "Được Lính Sùng Bái",    // +Sĩ Khí đơn vị chỉ huy
    "Phản Trắc",             // rủi ro làm phản nếu Độ Hảo Cảm thấp
  ])).prefault([]),
  "Trung Thành": clampedStat(-100, 100, 0),        // thấp + "Phản Trắc" => nguy cơ đảo ngũ/dâng thành
  "Còn Sống": z.boolean().prefault(true),
  "Bị Bắt Bởi": safeString().optional(),           // nếu bị bắt làm tù binh
});
// trong StatDataSchema: "Tướng Lĩnh": z.record(safeString().describe("Họ tên tướng"), GeneralSchema).prefault({})
```
```
generalModifier(generalName):
  g = state.stat_data."Tướng Lĩnh"[generalName]
  if not g or not g."Còn Sống": return 0.85          // không tướng => phạt nhẹ
  m = 0.8 + (g."Chỉ Số Thống Soái" / 100) * 0.5      // 0.8..1.3
  apply đặc tính phù hợp bối cảnh (loại quân/thủ-công/địa hình)
  return m
```
- **Tướng bị bắt/tử trận:** sau đại chiến, nếu bên thua có tướng, `seededRandom` quyết định tướng đó tử trận / bị bắt / thoát. Tướng bị bắt → làm con tin (liên kết hệ thống chính trị mục 14: đòi tiền chuộc, trao đổi tù binh, hành quyết ảnh hưởng danh tiếng).
- **Phản trắc:** tướng có đặc tính "Phản Trắc" + Trung Thành < -30 → mỗi turn có xác suất (engine roll) làm phản: mang quân bỏ đi, hoặc dâng thành đang thủ cho địch. AI tường thuật, engine quyết định có xảy ra hay không.

### 7.8 Hải chiến (Naval)
```ts
const FleetSchema = z.object({
  "Đô Đốc": safeString().prefault("Khuyết"),         // có thể là 1 General
  "Số Chiến Thuyền": z.coerce.number().int().min(0),
  "Loại Hạm": z.enum(["Thuyền Dài (Greyjoy)", "Chiến Thuyền Nặng", "Thuyền Buôn Vũ Trang", "Hạm Đội Hoả Công"]).prefault("Chiến Thuyền Nặng"),
  "Tình Trạng": z.enum(["Sẵn Sàng", "Hư Hại", "Đang Sửa"]).prefault("Sẵn Sàng"),
  "Lãnh Địa Neo Đậu": safeString(),                  // phải có Bến Cảng (mục 10.2)
});
// trong StatDataSchema: "Hạm Đội": z.record(safeString().describe("Tên hạm đội"), FleetSchema).prefault({})
```
- Hải chiến dùng công thức tương tự đại chiến (7.5) nhưng thay terrain bằng **điều kiện biển** (`z.enum(["Biển Lặng","Sóng Lớn","Sương Mù","Bão"])` — Bão gây thương vong ngẫu nhiên cả 2 phe, Sương Mù giảm lợi thế số đông).
- Loại hạm có tương khắc riêng: Thuyền Dài Greyjoy nhanh + giỏi áp mạn (+khi Sóng Lớn), Hạm Đội Hoả Công khắc cụm thuyền lớn đứng yên (kiểu Trận Blackwater) nhưng vô dụng khi Sóng Lớn.
- **Đổ bộ:** hạm đội chở được bộ binh (giới hạn theo Số Chiến Thuyền) tới lãnh địa ven biển địch → mở vây thành (mục 12.2) từ hướng biển, bỏ qua phòng thủ đường bộ.
- **Phong toả cảng địch:** neo hạm đội chặn 1 cảng → cắt giao thương + tiếp tế đường biển của lãnh địa bị phong toả (liên kết kinh tế mục 15).

---

## 7.9 Engine phán định trận đánh (Battle Resolver) — công thức chuẩn hoá cho MỌI quy mô

Mục 7.5 đã phác `resolveFieldBattle` theo Effective Power. Mục này **đặc tả đầy đủ** engine phán định để lập trình viên implement 1:1, dùng chung cho đại chiến, giao tranh, công thành (7.4b/12.2 chỉ thêm biến tường thành), hải chiến (7.8 thay địa hình bằng điều kiện biển). Đây là hàm thuần (pure function) trong `engine/combat/battleResolver.ts` — cùng input + cùng seed luôn ra cùng kết quả (điều kiện bắt buộc để test và để reroll không đổi kết quả đã chốt, mục 5.3).

**Nguyên tắc tối thượng (nhắc lại — quyết định toàn bộ thiết kế mục này):** engine đổ xúc xắc, engine tính mọi con số. AI **không** tự đổ 2D6, **không** tự quyết thắng bại, **không** tự bịa thương vong. AI chỉ nhận `BattleResult` đã chốt (đã ghi vào `Trận Đang Diễn._Log` + state) rồi tường thuật lại qua `<battle_report>` (mục 5.6) ở lượt kế. Mọi công thức dưới đây chạy trong JS, không nằm trong prompt gửi cho AI. (Đây là điểm khác biệt cốt lõi so với các preset card kiểu "AI tự xuất khối phán định" — app tự sở hữu engine nên không cần nhờ AI tính, tránh hoàn toàn việc model bịa số.)

### 7.9.1 Chuẩn hoá chỉ số đầu vào (0–100 thang chung)

Mọi enum chất lượng ở `MilitaryUnitSchema` (7.4) được engine map sang thang 0–100 trước khi tính, để công thức đồng nhất. Đồng thời cung cấp một **thang mô tả 7 bậc** dùng chung cho cả tường thuật lẫn tính toán:

```ts
// engine/combat/scales.ts
// Thang 0-100 → nhãn mô tả (để AI kể đúng "quân tinh nhuệ"/"ô hợp" mà không cần bịa số)
function qualityBand(v: number): string {
  if (v <= 20) return "Rệu Rã";       // sụp đổ
  if (v <= 40) return "Non Kém";      // kém cỏi
  if (v <= 60) return "Tạm Dùng";     // có thể dùng
  if (v <= 75) return "Thiện Chiến";  // lương hảo
  if (v <= 85) return "Tinh Nhuệ";    // tinh nhuệ
  if (v <= 95) return "Danh Quân";    // danh quân
  return "Huyền Thoại";               // truyền kỳ (96-100)
}

// Map enum MilitaryUnitSchema (7.4) → điểm số 0-100
const MORALE_SCORE  = { "Hăng Hái":85, "Ổn Định":65, "Dao Động":40, "Sắp Binh Biến":15 };
const TRAIN_SCORE   = { "Tinh Nhuệ":85, "Thành Thạo":65, "Mới Lập Đội":45, "Rời Rạc":25 };
const LOGI_SCORE    = { "Dồi Dào":85, "Cầm Cự Được":60, "Cực Kỳ Thiếu Thốn":30 };
const EQUIP_SCORE   = { "Trọng Giáp Tinh Nhuệ":85, "Đồng Bộ Chỉnh Tề":60, "Thô Sơ":30 };
```

**Gộp nhiều đơn vị một phe:** nếu một phe có nhiều đơn vị trong `Biên Chế Quân Sự`, engine lấy **trung bình gia quyền theo Số Lượng** cho từng chỉ số (sĩ khí, huấn luyện, hậu cần, trang bị), rồi cộng tổng quân số. Đơn vị 5.000 lính sĩ khí cao kéo trung bình mạnh hơn đơn vị 500 lính.

**Thiếu dữ liệu:** nếu ngữ cảnh có giao tranh nhưng `Biên Chế Quân Sự` chưa có đơn vị tương ứng (vd quân địch NPC chưa từng khai báo), engine ước lượng từ `Thái Độ Các Nhà` (5.1) / lore, hoặc nhận số ước lượng do AI cung cấp trong thuộc tính thẻ `<combat_trigger>` (vd `enemy_size="8000"`) — nhưng **giá trị đó là input cho engine tính**, không phải kết quả. AI đề xuất quân số hợp lý theo truyện; engine mới ra thắng bại.

### 7.9.2 Công thức Chiến Lực (Battle Power)

Thay cho `unitEffectivePower` ở 7.5, dùng dạng nhân đầy đủ 4 hệ số (tương thích ngược — chỉ chi tiết hoá):

```
chiếnLực(phe) = hệSốQuânSố × hệSốChấtLượng × hệSốTướng × hệSốThếTrận

hệSốQuânSố    = tổngQuânSố / 100          // 300 lính → 3.0 ; 8000 lính → 80.0
hệSốChấtLượng = (sĩKhí + huấnLuyện + hậuCần) / 3 / 100   // 0..1 (dùng điểm 0-100 ở 7.9.1)
hệSốTướng     = 1 + (thốngSoái×0.6 + trưởngMưu×0.4) / 200 // 1.0..1.5 (GeneralSchema 7.7)
hệSốThếTrận   = ưuKhuyếtBinhChủng × hệSốĐịaHình × hệSốHậuCần × hệSốTrangBịKhoaKỹ
```

- **`hệSốTướng`** dùng `Chỉ Số Thống Soái` (7.7) làm chính; nếu tướng có đặc tính khớp bối cảnh (Kỵ Binh Đại Sư khi chỉ huy kỵ, Bậc Thầy Công Thành khi vây thành, Phòng Thủ Kiên Cường khi thủ) → cộng thêm 0.05–0.1. Không tướng → 0.85 (phạt, như 7.7).
- **`ưuKhuyếtBinhChủng`** (0.7–1.3, cơ sở 1.0): **engine KHÔNG tra bảng cứng theo tên binh chủng**. Đây là chỗ hiếm hoi engine cần "phán đoán tổng hợp" — nhưng vì engine không suy luận như AI, ta **lượng hoá bằng ma trận có sẵn** kết hợp 3 yếu tố: (a) tương khắc binh chủng (mục 11.2, vd trường thương khắc kỵ, cung khắc bộ hở giáp), (b) chênh lệch đẳng cấp huấn luyện — khắc chế chỉ phát huy khi bên khắc chế không quá non kém (bộ binh Rời Rạc dù đông cũng khó thực thi "bộ khắc kỵ" trước kỵ binh Tinh Nhuệ), (c) độ hợp địa hình của binh chủng (đã có ở 7.6). Ba yếu tố này engine tính được bằng số; kết quả clamp về 0.7–1.3. Ranh giới tham khảo: cấu hình rất hợp chiến trường 1.15–1.3 / hơi ưu 1.05–1.15 / mỗi bên có sở trường 0.9–1.1 / hơi khuyết 0.85–0.95 / hoàn toàn lệch 0.7–0.85.
- **`hệSốĐịaHình`** dùng thẳng bảng 7.6 (`terrainMultiplier`) + lớp thời tiết 7.6+ (mưa/tuyết/sương mù/gió) + miễn phạt theo Nhà quen địa hình. Với công/thủ thành: phe thủ 1.3–1.5, phe công 0.6–0.8.
- **`hệSốHậuCần`** (tiếp tế đường tới chiến trường, **khác** với chỉ số Hậu Cần trong chất lượng — cái này là tuyến tiếp tế chiến dịch): Đầy Đủ 1.0 / Tạm Được 0.85 / Thiếu Hụt 0.7 / **Bị Cắt Đứt 0.5** (nối phong toả cảng 7.8, cắt đường tiếp tế bằng tình báo 14, hoặc vây thành 12.2).
- **`hệSốTrangBịKhoaKỹ`** (0.85–1.15): mỗi bậc chênh trang bị (7.9.1) ±0.04–0.08; cộng buff công nghệ nếu lãnh địa đã nghiên cứu (mục 10, vd rèn thép tốt hơn, nỏ công thành) — mỗi buff ≤0.05, tổng buff công nghệ ≤0.1. Clamp 0.85–1.15.

Chiến lực cuối cùng của mỗi phe làm tròn.

### 7.9.2b Ma trận `ưuKhuyếtBinhChủng` — lượng hoá đầy đủ (engine tính, không nhờ AI)

Ở 7.9.2, `ưuKhuyếtBinhChủng` được mô tả là "phán đoán tổng hợp 3 yếu tố". Vì engine không suy luận như AI, mục này **đặc tả thành công thức số chạy được**. Hàm nằm trong `engine/combat/troopMatchup.ts`, thuần và test được.

**Ý tưởng:** một phe thường là **hỗn hợp nhiều binh chủng** (vd 60% bộ binh + 30% kỵ binh + 10% cung thủ). Engine tính hệ số cho *cấu hình phe ta đối đầu cấu hình phe địch trên địa hình cụ thể*, gồm 4 lớp nhân với nhau rồi clamp về 0.7–1.3:

```
ưuKhuyếtBinhChủng(pheTa, pheĐịch, địaHình, thờiTiết) =
  clamp( lớpTươngKhắc × lớpĐịaHình × lớpChấtLượngThựcThi × lớpKhắcChếĐặcBiệt , 0.7, 1.3 )
```

#### Lớp 1 — Tương khắc binh chủng (kéo/búa/bao mở rộng)

Bảng hệ số cặp đôi `COUNTER[loạiTa][loạiĐịch]` (giá trị = binh chủng ta hiệu quả thế nào **khi gặp** binh chủng địch đó). >1.0 là khắc chế, <1.0 là bị khắc:

```ts
// engine/combat/troopMatchup.ts — hệ số cơ sở, 6 binh chủng "thường"
const COUNTER = {
  //             vsBộ   vsThương vsKỵ   vsKỵNhẹ vsCung  vsCôngThành
  "Bộ Binh":    { "Bộ Binh":1.0, "Trường Thương":0.9, "Kỵ Binh":0.85, "Kỵ Binh Nhẹ":1.05, "Cung Thủ":1.15, "Công Thành":1.1 },
  "Trường Thương":{ "Bộ Binh":1.1, "Trường Thương":1.0, "Kỵ Binh":1.35, "Kỵ Binh Nhẹ":1.25, "Cung Thủ":0.85, "Công Thành":1.0 },
  "Kỵ Binh":    { "Bộ Binh":1.2, "Trường Thương":0.65, "Kỵ Binh":1.0, "Kỵ Binh Nhẹ":1.15, "Cung Thủ":1.4, "Công Thành":0.7 },
  "Kỵ Binh Nhẹ":{ "Bộ Binh":0.95,"Trường Thương":0.75, "Kỵ Binh":0.85,"Kỵ Binh Nhẹ":1.0, "Cung Thủ":1.3, "Công Thành":0.6 },
  "Cung Thủ":   { "Bộ Binh":0.85,"Trường Thương":1.15, "Kỵ Binh":0.6, "Kỵ Binh Nhẹ":0.7, "Cung Thủ":1.0, "Công Thành":0.9 },
  "Công Thành": { "Bộ Binh":0.9, "Trường Thương":1.0, "Kỵ Binh":1.3, "Kỵ Binh Nhẹ":1.4, "Cung Thủ":1.1, "Công Thành":1.0 },
};
```
Vòng khắc chế lõi vẫn giữ tinh thần kéo-búa-bao của mục 11.2 nhưng chi tiết hơn: **Trường Thương khắc Kỵ** (tường giáo chặn ngựa), **Kỵ khắc Cung/Bộ hở đội hình** (xung phong), **Cung khắc Trường Thương/Bộ nặng** (bắn tỉa đội hình chậm), **Kỵ Nhẹ khắc Cung** (đuổi bắt) nhưng thua Trường Thương. Công Thành ngoài đồng trống chậm chạp → dễ bị kỵ đè (0.7 khi gặp Kỵ).

**Tính cho phe hỗn hợp:** lấy trung bình gia quyền theo tỷ lệ quân mỗi binh chủng hai bên.
```
lớpTươngKhắc(pheTa, pheĐịch):
  s = 0
  for (loạiTa, tỷTrọngTa) in pheTa.thànhPhần:      // vd {"Bộ Binh":0.6, "Kỵ Binh":0.4}
    for (loạiĐịch, tỷTrọngĐịch) in pheĐịch.thànhPhần:
      s += COUNTER[loạiTa][loạiĐịch] × tỷTrọngTa × tỷTrọngĐịch
  return s     // quanh 1.0; phe có binh chủng khắc thành phần chính của địch sẽ >1.0
```

#### Lớp 2 — Địa hình × binh chủng (dùng bảng 7.6, gia quyền theo thành phần)

```
lớpĐịaHình(pheTa, địaHình, thờiTiết):
  h = 0
  for (loạiTa, tỷTrọng) in pheTa.thànhPhần:
    hệSố = terrainMultiplier(loạiTa, địaHình)      // bảng 7.6
    hệSố *= weatherMultiplier(loạiTa, thờiTiết)    // 7.6+ (mưa/tuyết/sương/gió)
    hệSố *= houseAffinityBonus(pheTa.nhà, địaHình)  // Stark↔tuyết, Martell↔sa mạc... miễn phạt
    h += hệSố × tỷTrọng
  return h / tổngTỷTrọng      // chuẩn hoá về ~1.0
```
Kỵ binh trên Đồng Bằng kéo hệ số lên; kỵ binh trong Đầm Lầy/Rừng kéo xuống. Phe biết chọn binh chủng hợp địa hình được thưởng.

#### Lớp 3 — Chất lượng thực thi (khắc chế chỉ hiệu quả nếu quân đủ trình)

Đây là điểm tinh tế lấy từ file tham khảo: **bộ binh Rời Rạc dù đông cũng không thực thi nổi "bộ khắc kỵ" trước kỵ binh Tinh Nhuệ**. Lớp này giảm hiệu lực khắc chế của Lớp 1 nếu bên ra đòn khắc chế non kém hơn nhiều so với mục tiêu:

```
lớpChấtLượngThựcThi(pheTa, pheĐịch):
  Δ = (huấnLuyệnTrungBình(pheTa) − huấnLuyệnTrungBình(pheĐịch)) / 100   // −1..+1, dùng điểm 0-100 (7.9.1)
  // Δ dương (ta tinh nhuệ hơn) → khuếch đại ưu thế; Δ âm → khắc chế của ta bị bóp
  return clamp(1 + Δ × 0.25, 0.85, 1.15)
```
Chênh 40 điểm huấn luyện (~2 bậc) đổi ±0.1 hệ số — đủ để "quân ô hợp đông" không auto thắng "quân tinh nhuệ ít" chỉ nhờ tên binh chủng.

#### Lớp 4 — Khắc chế đặc biệt (binh chủng đặc biệt & vũ khí độc nhất)

Cửa cho các binh chủng đặc biệt (mục 11.2b) và yếu tố ASOIAF phát huy. Cộng dồn các bonus có điều kiện, mỗi cái nhỏ để không phá cân bằng:
```
lớpKhắcChếĐặcBiệt(pheTa, pheĐịch, địaHình):
  m = 1.0
  áp mọi rule đặc biệt khớp điều kiện (bảng 11.2b), vd:
    - pheTa có "Voi Chiến" và pheĐịch chủ yếu Kỵ Binh (ngựa sợ voi)  → m *= 1.12
    - pheTa có "Cung Thủ Dothraki" và địaHình Đồng Bằng               → m *= 1.1
    - pheTa có "Vô Diện/Sát Thủ" trong trận Giao Tranh (7.13)          → m *= 1.08 (ám sát chỉ huy)
    - pheĐịch có "Unsullied" (miễn nhiễm sợ hãi) và pheTa cậy sĩ khí áp đảo → m *= 0.92
  return clamp(m, 0.85, 1.15)
```

**Kết quả** 4 lớp nhân lại, clamp 0.7–1.3, đưa vào `hệSốThếTrận` ở 7.9.2. Toàn bộ là số học — engine chạy, test được bằng seed, AI **không** đụng vào. AI chỉ đọc kết quả để kể ("giáo dài Nhà Tyrell dựng thành rừng thép chặn kỵ binh Lannister").

**Ví dụ chạy tay:** phe ta 60% Trường Thương + 40% Cung Thủ (Tinh Nhuệ, 80đ) vs phe địch 70% Kỵ Binh + 30% Bộ Binh (Thành Thạo, 65đ), địa hình Đồi Núi:
- Lớp 1: Trường Thương vs Kỵ (1.35) và vs Bộ (1.1); Cung vs Kỵ (0.6) và vs Bộ (0.85) → gia quyền ≈ (0.6×0.7×1.35 + 0.6×0.3×1.1 + 0.4×0.7×0.6 + 0.4×0.3×0.85) ≈ **1.03**... tính đủ ra ≈1.0–1.05
- Lớp 2: Đồi Núi phạt kỵ địch, lợi cung/bộ thủ ta → ta ≈ **1.1**
- Lớp 3: ta hơn 15đ huấn luyện → **~1.04**
- Lớp 4: không rule đặc biệt → 1.0
- Tổng ≈ 1.03 × 1.1 × 1.04 ≈ **1.18** cho phe ta (ưu thế rõ, đúng trực giác: giáo+cung thủ tinh nhuệ trên đồi núi chấp kỵ binh).

---


### 7.9.3 Nhiễu loạn ngẫu nhiên (Fog of War roll) — engine đổ, không phải AI

Chiến tranh có yếu tố may rủi (viện quân tới đúng lúc, một cánh vỡ trận bất ngờ, sương mù che mắt). Engine mô phỏng bằng **2D6 từ seed cố định của trận** (`Trận Đang Diễn._Seed`), cộng vào phe đang **chiếm ưu thế tỷ lệ chiến lực**:

```ts
function fogRoll(seed: number): { dice: [number, number]; mod: number } {
  const rng = seededRng(seed);           // deterministic, tái lập được
  const d1 = 1 + Math.floor(rng() * 6);
  const d2 = 1 + Math.floor(rng() * 6);
  const sum = d1 + d2;
  const mod = { 2:-25, 3:-12, 4:-12, 5:-5, 6:-5, 7:0, 8:5, 9:5, 10:12, 11:12, 12:25 }[sum];
  return { dice: [d1, d2], mod };
}
```
| 2D6 | Nhiễu loạn | Ý nghĩa (AI dùng để kể) | Xác suất |
|---|---|---|---|
| 2 | −25 | Đại ách vận (tướng trúng tên, thuốc súng nổ kho) | 2.8% |
| 3–4 | −12 | Bất lợi (lạc đường, tin sai) | 8.3% |
| 5–6 | −5 | Hơi bất lợi | 27.8% |
| 7 | 0 | Không biến cố | 16.7% |
| 8–9 | +5 | Hơi thuận | 27.8% |
| 10–11 | +12 | Thuận (viện quân tới sớm) | 8.3% |
| 12 | +25 | Đại hảo vận (địch tự loạn) | 2.8% |

Giá trị `mod` chia 100 rồi cộng vào **tỷ lệ** chiến lực ở 7.9.4. `dice` được ghi vào `_Log` để `<battle_report>` có thể kể "một trận cuồng phong bất chợt..." đúng với roll — minh bạch, người chơi mở log thấy được cả xúc xắc.

### 7.9.4 Phán định thắng bại — thang 7 bậc

```
tỷLệ = chiếnLực(bênMạnh) / chiếnLực(bênYếu) + fogMod/100
```
| Tỷ lệ | Kết quả | Mô tả |
|---|---|---|
| ≥ 2.0 | **Đại Thắng** | Địch tan tác không thành quân |
| 1.5–1.9 | **Thắng** | Ưu thế rõ, địch bại lui |
| 1.2–1.4 | **Tiểu Thắng** | Miễn cưỡng thắng, địch rút có trật tự |
| 0.9–1.1 | **Giằng Co** | Hai bên cầm cự, ai nấy thu quân |
| 0.6–0.8 | **Tiểu Bại** | Không địch lại nhưng chưa vỡ, vừa đánh vừa lui |
| 0.3–0.5 | **Bại** | Khuyết thế rõ, trận cước đại loạn |
| < 0.3 | **Đại Bại** | Toàn quân tan tác, tổn hơn nửa |

Đây thay cho công thức `winnerA = roll < clamp(ratio,...)` ở 7.5 — vẫn giữ tinh thần "luôn chừa bất ngờ": nhiễu loạn 2D6 có thể lật một trận cận kề (tỷ lệ 1.15 gặp roll −25 → tụt xuống Giằng Co), nhưng chênh lệch quá lớn thì may rủi không cứu nổi (đúng thực tế). Với công/thủ thành và hải chiến, dùng cùng thang này sau khi đã nhân biến tường thành / điều kiện biển vào chiến lực.

### 7.9.5 Thương vong & sĩ khí sau trận

```
tỷLệThươngVong (% quân tham chiến):
  Phe thắng: ĐạiThắng 1-3% · Thắng 3-8% · TiểuThắng 5-12% · GiằngCo 8-15%
  Phe bại:   TiểuBại 10-20% · Bại 15-30% · ĐạiBại 25-50%
biếnĐộngSĩKhí (enum shift, quy về điểm 0-100 rồi map lại enum 7.4):
  ĐạiThắng: thắng +6..+8 / bại −11..−15
  Thắng:    thắng +3..+5 / bại −6..−10
  TiểuThắng:thắng +1..+3 / bại −1..−5
  GiằngCo:  cả hai −2..+2 (cầm cự lâu hao mòn cả đôi)
```
- Engine roll trong khoảng (từ cùng seed) để ra số cụ thể; thương vong ít nhất 1 người, làm tròn; sĩ khí clamp 0–100 rồi map ngược về enum `Sĩ Khí` (Hăng Hái/Ổn Định/Dao Động/Sắp Binh Biến).
- **Quân chết là chết** (nối 7.10): trừ vĩnh viễn khỏi `Số Lượng` của đơn vị. Đơn vị tụt về 0 → xoá khỏi `Biên Chế Quân Sự`.
- **Số phận tướng** (nối 7.7): bên bại có tướng → roll tử trận / bị bắt / thoát; xác suất tử trận-bị bắt tăng theo mức bại (Đại Bại nguy nhất) và theo đặc tính (Táo Bạo nguy hơn Thận Trọng).

### 7.9.6 Ba mức Độ Khó (Difficulty) — chỉnh hệ số, không phá công thức

Dùng `stat_data."Cài Đặt Ván"."Độ Khó Chiến Đấu"` (đã khai báo ở mục 5.1, enum `["Nhàn Hạ","Cân Bằng","Chân Thực"]`). Engine áp trước khi phán định:

- **Nhàn Hạ** (thế giới thiên vị người chơi): chiến lực địch ×0.7 ở hệ số chất lượng & tướng, trang bị-khoa kỹ địch ×0.8; khi phán định **nâng kết quả người chơi 1 bậc** (đáng Bại → thành Tiểu Bại); thương vong quân ta lấy cận dưới, quân địch cận trên; xác suất tướng ta tử trận rất thấp; AI địch bảo thủ (ít truy kích, dễ trúng mai phục — phản ánh qua fog roll thiên vị nhẹ).
- **Cân Bằng** (mặc định): mọi thứ theo công thức gốc, không thiên vị. Đáng thắng thì thắng, đáng thua thì thua.
- **Chân Thực** (lịch sử làm chuẩn): địch không suy yếu; **làm tròn tỷ lệ xuống** (1.49 tính là bậc 1.4 chứ không 1.5); thương vong quân ta lấy khoảng trung-cao; tướng xung trận rủi ro thật; **sĩ khí sụp đổ dây chuyền** — một cánh vỡ (đơn vị tụt Sắp Binh Biến) kéo các đơn vị cùng phe −1 bậc sĩ khí trong cùng trận; thời gian thu thập tàn binh & hồi phục sau đại bại tính bằng **tháng** (nhiều lần `onTurnAdvance`), không bằng ngày.

Độ khó lưu trong Settings (mục 21), đổi được giữa chừng. Tất cả chỉ nhân/dịch hệ số — **không** thêm nhánh công thức riêng, giữ engine một đường.

## 7.10 Giao thức thẻ & định dạng `<battle_report>` (chi tiết hoá 5.6)

Luồng 2 lượt (mục 6.2) áp dụng: **Lượt N** AI phát `<combat_trigger>` → engine phán định (7.9) → ghi state. **Lượt N+1** AI đọc kết quả, phát `<battle_report>` tường thuật. Engine chèn sẵn một khối dữ liệu (ẩn khỏi chat, cho AI đọc) để AI kể đúng số:

```
<battle_report outcome="Tiểu Thắng" scale="Đại Chiến" terrain="Đồi Núi">
Binh lực: Quân ta 6.000 | Quân địch 7.500
Tố chất: Ta sĩ khí Ổn Định, huấn luyện Thành Thạo | Địch sĩ khí Dao Động, huấn luyện Mới Lập Đội
Trang bị: Ta Đồng Bộ Chỉnh Tề | Địch Thô Sơ
Tướng: Ta Robb Stark (Thống 82 / Mưu 70) | Địch Ser Amory (Thống 45 / Mưu 40)
Xúc xắc: 2D6=9, nhiễu loạn +5 (nghiêng về ta)
Diễn biến then chốt: cánh phải địch vỡ trước, ta truy kích tàn quân
Thương vong: Ta tổn 410 | Địch tổn 1.120
Sĩ khí: Ta +2 (→ Hăng Hái) | Địch −4 (→ Sắp Binh Biến)
</battle_report>
```
**Quy tắc:**
- Các dòng trên do **engine điền sẵn từ `BattleResult`** rồi đưa cho AI trong context ẩn; AI **không tự chế số**, chỉ dùng chúng làm xương sống để viết văn tường thuật bên **ngoài** thẻ (đoạn văn xuôi sau thẻ).
- Frontend render thẻ này thành **card tóm tắt trận** (thanh cán cân nghiêng, hai cột thương vong, số phận tướng, delta lãnh thổ trên bản đồ mục 9) — kính mờ, SVG, không emoji (mục 7.11).
- AI **nghiêm cấm** lặp lại y nguyên định dạng khối này trong đoạn văn xuôi; số liệu hoà vào lời kể tự nhiên ("hơn nghìn quân Lannister nằm lại triền đồi").
- Thẻ gõ sai/thiếu dòng → frontend fallback text thường, không vỡ UI (mục 5.6).

## 7.11 Bút pháp tường thuật trận đánh (Battle Narration) — hướng dẫn cho AI

Đây là phần **prompt gửi cho AI** (khác 7.9 là code engine). Nạp như một lorebook entry `[mvu_update]` hoặc khối trong system prompt, kích hoạt khi có `<battle_report>`. Mục tiêu: chiến đấu đọc như **chương chiến tranh trong tiểu thuyết**, không phải bản tin thể thao.

Sau khi nhận `BattleResult`, tường thuật **bắt buộc** theo nhịp:
1. **Bày trận & xuất quân** trước — thế đất, hàng ngũ, khí thế hai bên, tâm thế chủ tướng.
2. **Điểm tiếp chiến then chốt** — dùng đúng "Diễn Biến Then Chốt" engine trả (cánh nào vỡ trước, viện quân, dũng tướng đột trận). Bước ngoặt phải có **nguyên cớ rõ ràng**, không thắng/thua khơi khơi.
3. **Tĩnh bút thu lại** sau trận — một khoảng lặng: cờ rách, đao gãy, tà dương, tiếng rên thương binh, chủ tướng đứng giữa bãi chiến. Cho người đọc thở.

Ràng buộc: số liệu hoà vào văn ("tổn hơn ba trăm nhân mã"), **không** đọc lại bảng phán định; giữ đúng kết quả engine (không được kể thắng khi engine ra bại); độ dài co giãn theo quy mô (đụng độ nhỏ vài đoạn, đại chiến quyết định cả chương có thể dài hơn). Với Westeros: tận dụng chất riêng — bùn tuyết phương Bắc, tiếng tù và, huy hiệu Nhà tung bay, sự tàn khốc không tô hồng (đúng giọng ASOIAF).

## 7.12 Ba tầng quy mô & công tắc chung (thu gọn từ đề xuất trước — chốt để implement)

Để 7.1–7.9 không rời rạc, một enum + một khối state điều phối tất cả:

```ts
const CombatScaleSchema = z.enum([
  "Đấu Tay Đôi",  // 1v1/vài cá nhân — turn-based chi tiết (7.1-7.3)
  "Giao Tranh",   // 5-50 mỗi bên — nhóm nhỏ (7.13)
  "Đại Chiến",    // đội quân — Battle Resolver (7.9)
  "Vây Thành",    // công/thủ thành (7.4b/12.2 + biến tường thành)
  "Hải Chiến",    // hạm đội (7.8, dùng 7.9 thay địa hình bằng điều kiện biển)
]).prefault("Đấu Tay Đôi");

// trong StatDataSchema:
"Trận Đang Diễn": z.object({
  "_Đang Chiến Đấu": z.boolean().prefault(false),  // readonly — engine bật/tắt
  "Quy Mô": CombatScaleSchema,
  "_Seed": z.coerce.number().int().prefault(0),     // readonly — cố định cả trận (reroll không đổi kết quả đã chốt)
  "Địa Hình": TerrainSchema.optional(),
  "Điều Kiện": safeString().optional(),             // thời tiết / điều kiện biển
  "Phe Ta": z.array(safeString()).prefault([]),     // tham chiếu key Biên Chế Quân Sự / Tướng Lĩnh
  "Phe Địch": z.array(safeString()).prefault([]),
  "_Log": z.array(safeString()).prefault([]),       // readonly — combat log engine ghi
}).prefault({}),
```
Công tắc: AI phát `<combat_trigger scale="..." terrain="..." enemy="...">` (mục 5.6) → engine dựng `Trận Đang Diễn`, cố định `_Seed` → **nếu quy mô ≥ Giao Tranh, hỏi người chơi "Tự Chỉ Huy / Giao Cho Tướng"** → chạy engine tầng tương ứng → ghi `_Log` + patch state → set `_Đang Chiến Đấu=false`. Lượt kế AI phát `<battle_report>`. "Tự Chỉ Huy" hạ Đại Chiến xuống combat turn-based cho khoảnh khắc quyết định; "Giao Cho Tướng" auto-resolve 7.9 (nhanh). Người mê nhập vai luôn chọn giao tướng; người thích chiến thuật tự cầm quân.

## 7.13 Tầng giữa — Giao Tranh (Skirmish)

Lấp khoảng trống 1-người ↔ đội-quân (phục kích trên đường, đột kích trại, ẩu đả trong sảnh, đụng độ ngoài Tường Thành):

```ts
const SkirmishSideSchema = z.object({
  "Quân Số": z.coerce.number().int().min(1),
  "Chất Lượng": z.enum(["Tinh Nhuệ","Thường","Ô Hợp"]).prefault("Thường"),
  "Nhân Vật Then Chốt": z.array(safeString()).prefault([]),  // PC/NPC có stat riêng (tính theo 7.1)
}).prefault({});
```
- **Cách tính:** nhân vật then chốt (PC, tướng, NPC có tên) đánh theo combat chi tiết 7.1; lính vô danh gộp thành "pool sát thương"/vòng theo `Quân Số × hệ số Chất Lượng`, trừ dần HP pool phe kia. Phe cạn pool trước → tan/rút. Vẫn dùng seed để tái lập.
- **Quyết định người chơi/vòng:** dồn hướng — "bảo vệ nhân vật then chốt", "hạ chỉ huy địch", "mở đường tháo chạy", "kêu hàng". Không roll suông.
- **Bất ngờ:** phục kích → phe phục đánh trước 1 vòng miễn phản đòn (nối tag Rừng Rậm/Hẻm Núi 7.6); đêm/sương mù → giảm hiệu quả quân đông.

## 7.14 Chiều sâu 1v1 & hệ quả sau trận (chốt từ đề xuất trước)

**Đấu tay đôi (7.1+):** mỗi lượt chọn **Thế Đứng** (Tấn Công Liều +toHit/+dmg nhưng −AC · Cân Bằng · Phòng Thủ +AC/−toHit · Nhắm Chí Mạng mở crit 19–20 nhưng −5 toHit) + tiêu **Thể Lực** cho đòn đặc biệt (hết Thể Lực → chỉ đánh thường, dễ Stun). Thép Valyria/obsidian bỏ qua phần lớn `damageReduction` và là **điều kiện cứng** diệt kẻ siêu nhiên. **Trial by combat**: một trận 1v1 có thể *thay* cả đại chiến nếu hai bên đồng ý — thắng → áp thẳng kết quả chiến lược (nối `Chỉ Số Võ Lực` 7.7).

**Hệ quả sau MỌI trận (7.9.5 + patch mục 5):** thương tật lâu dài (Chân Tập Tễnh −cơ động, Sẹo Mặt ±phản ứng xã hội, Mất Một Tay khoá vài hành động — nối trí nhớ NPC 16.1); **danh tiếng Uy Dũng** (16.4) đổi Thái Độ các Nhà (5.1) → dễ/khó liên minh (13.4); **tù binh** tướng địch → con tin (14.4: chuộc/đổi/xử — xử tù binh sai cách mất Vinh Dự với Nhà trọng danh dự); **hao tổn thật** (quân/tướng/lương trừ vĩnh viễn) để chiến tranh **đắt**, giữ trọng lượng cho các hệ chính trị/kinh tế.

## 7.15 Kẻ thù siêu nhiên & rồng (tùy Era) — lớp đặc trưng ASOIAF

Bật theo Era (mục 8.2) & chế độ tường thuật (8.3): Chiến Tranh Ngũ Vương thì rồng/Others hiếm; Trường Dạ / Chinh Phạt Aegon thì trung tâm.

**Rồng** — hệ số phi đối xứng vào chiến lực phe sở hữu + **đốt cổng thành** (bỏ qua biến tường thành ở vây thành). Không bất khả chiến bại: scorpion/nỏ khổng lồ, giáo tẩm độc, địa hình hẹp, **rồng đối rồng** có thể hạ/làm bị thương (seed roll, xác suất thấp nhưng ≠ 0 — luôn chừa bất ngờ). Rồng "Kiệt Sức"/"Bị Thương" mất phần lớn hệ số → cửa cho phe yếu. Rồng bị hạ → roll số phận kỵ sĩ (7.7).
```ts
const DragonSchema = z.object({
  "Tên": safeString(),
  "Kích Cỡ": z.enum(["Non","Trưởng Thành","Khổng Lồ (Balerion-class)"]).prefault("Non"),
  "Kỵ Sĩ": safeString().optional(),      // phải có bond
  "Tình Trạng": z.enum(["Khỏe","Bị Thương","Kiệt Sức"]).prefault("Khỏe"),
  "_HP": clampedStat(0, 1000, 1000),
}).prefault({});
```
**Others / wights** (nếu Era bật): **material-gate** — wight miễn nhiễm vũ khí thường (chỉ **lửa** diệt); White Walker chỉ **obsidian** hoặc **thép Valyria** phá. Thiếu vật liệu đúng → chiến lực bao nhiêu cũng vô nghĩa, buộc đi tìm dragonglass/Valyrian (nối kinh tế/khám phá). Đội quân người chết **không có enum Sĩ Khí** (không dao động/binh biến) và **bổ sung bằng chính tử sĩ hai bên** sau mỗi trận (thua đau → địch mạnh thêm) — chiến tranh tiêu hao thành ác mộng, không thắng bằng cách thường.

---

## 8. Màn hình mở đầu, Thời Kỳ & Tạo nhân vật

### 8.1 Main Menu
Màn hình đầu tiên khi mở app:
- **Bắt Đầu Mới** → vào luồng New Game (mục 8.3).
- **Tiếp Tục** → danh sách save slot (thumbnail, tên nhân vật, Thời Kỳ đang chơi, thời điểm lưu gần nhất) — bấm để load thẳng, nút xoá riêng từng slot kèm modal xác nhận. Nếu chưa có save nào, nút disable + tooltip giải thích.
- **Cài Đặt** → mở Settings (mục 21) — truy cập được kể cả khi chưa có save nào.
- (tuỳ chọn, thêm sau nếu còn thời gian): **Giới thiệu/Credits**, **Nhập file save** ngay từ menu (import JSON không cần vào game trước).

### 8.2 Dữ liệu Thời Kỳ (Era) — cấu trúc seed
Toàn bộ nhân vật canon, Nhà khả dụng và điểm khởi đầu đều gắn theo 1 **Thời Kỳ (Era)** cụ thể, thay vì dùng chung 1 danh sách phẳng cho mọi lúc trong dòng thời gian ASOIAF:
```ts
interface EraData {
  id: string;
  name: string;                        // "Chiến Tranh Ngũ Vương"
  yearRange: string;                    // "298 – 300 AC"
  blurb: string;                        // mô tả ngắn bối cảnh
  availableHouses: string[];            // Nhà nào đang tồn tại/có vai trò trong era này
  canonCharacters: CanonCharacter[];    // roster nhân vật có sẵn để đóng vai
  startingHooks: StartingHook[];        // các mốc/điểm khởi đầu cụ thể trong era
}
interface CanonCharacter {
  id: string; name: string; house: string; role: string;
  blurb: string; startingHookIds: string[]; // hook nào hợp với nhân vật này
}
interface StartingHook {
  id: string; title: string; year: string; desc: string;
  mode?: "Theo Sát Nguyên Tác" | "Diễn Giải Tự Do";
}
```
Seed tối thiểu 4 Era để app chạy demo được ngay (lore sâu do user tự nạp qua lorebook riêng — xem non-goals mục 21):
- **"Cuộc Chinh Phạt Của Aegon"** (~2 BC – 1 AC) — canon: Aegon Targaryen, Visenya Targaryen, Rhaenys Targaryen.
- **"Loạn Robert"** (282 – 283 AC) — canon: Robert Baratheon, Eddard Stark, Rhaegar Targaryen.
- **"Chiến Tranh Ngũ Vương"** (298 – 300 AC) — canon: Eddard Stark, Tyrion Lannister, Daenerys Targaryen, Jon Snow, Cersei Lannister.
- **"Tự Do / Sandbox"** — không gán năm cố định, không có roster canon (chỉ dùng tuyến Tự Tạo), dành cho người chơi muốn tự bịa hoàn toàn bối cảnh qua lorebook riêng.
Kiến trúc theo `id` tách rời nên thêm Era mới (vd "Vũ Điệu Rồng") sau này chỉ là thêm 1 file data, không đụng code engine.

### 8.3 Luồng Bắt Đầu Mới (New Game) — tổng quan
```
1. Chọn Thời Kỳ (hiện card mỗi era: tên, năm, blurb)
2. Chọn Tuyến Nhân Vật:
   a) "Đóng Vai Nhân Vật Có Sẵn" (mục 8.4)
   b) "Tự Tạo Nhân Vật" (mục 8.5)
3. (tuỳ chọn) Chọn CHẾ ĐỘ TƯỜNG THUẬT: "Theo Sát Nguyên Tác" vs "Diễn Giải Tự Do (AU)"
   -> mức độ BÁM LORE gốc. Lưu vào state, nhắc AI trong system prompt,
      lọc startingHook/lorebook entry gắn mode tương ứng
4. (tuỳ chọn) Chọn HƯỚNG KỊCH BẢN: "Người Chơi Là Trung Tâm" vs "Người Chơi Là Bối Cảnh"
   -> AI ĐỐI XỬ VỚI DÒNG LỊCH SỬ CANON thế nào (trục KHÁC với bước 3):
      • "Người Chơi Là Trung Tâm": dòng sự kiện canon UỐN THEO hành động của bạn —
        bạn cứu được nhân vật đáng lẽ phải chết, đổi được cục diện lớn. Thế giới xoay quanh bạn.
      • "Người Chơi Là Bối Cảnh": đại cục vẫn CHẢY THEO QUỸ ĐẠO nguyên tác bất kể bạn làm gì
        ở quy mô nhỏ — Ned vẫn có thể mất đầu, Đỏ Cưới vẫn xảy ra; bạn xoay xở cầu sinh
        trong kẽ hở lịch sử, sức nặng nằm ở việc sống sót giữa biến động ngoài tầm với.
   -> lưu vào state, đưa vào system prompt định hướng cách AI cân giữa ý chí người chơi và canon
5. Xác nhận -> flow kỹ thuật ở mục 8.6
```
> **Hai trục bổ sung nhau, đừng nhầm:** bước 3 (chế độ tường thuật) hỏi *"bám sát văn bản gốc tới đâu"* (giọng văn, chi tiết, có yếu tố siêu nhiên không); bước 4 (hướng kịch bản) hỏi *"ai điều khiển bánh xe lịch sử"* (bạn viết lại được canon hay chỉ sống trong nó). Có thể phối: "Theo Sát Nguyên Tác + Người Chơi Là Bối Cảnh" = trải nghiệm sát truyện nhất, bạn là hạt cát trong cơn bão canon; "Diễn Giải Tự Do + Người Chơi Là Trung Tâm" = sandbox AU tối đa, bạn định hình tất cả.

Đây là **thứ tự đề xuất, không phải bắt buộc cứng** — nếu lúc code thấy gộp bước 2+3+4 lại hoặc thêm màn preview trước khi xác nhận hợp lý hơn, cứ điều chỉnh. Tinh thần cốt lõi cần giữ: **Thời Kỳ quyết định nhân vật/Nhà/lore nào khả dụng**, người chơi chọn đóng vai có sẵn hay tự tạo trong khuôn khổ đó.

### 8.4 Tuyến "Đóng Vai Nhân Vật Có Sẵn"
- Hiển thị `canonCharacters` đã lọc theo Era chọn ở bước 1, mỗi thẻ hiện tên, Nhà, vai trò, blurb ngắn.
- Chọn 1 nhân vật → hiển thị `startingHooks` khớp `startingHookIds` của nhân vật đó (mỗi hook là 1 mốc/tình huống cụ thể để bắt đầu, vd "Ned Stark vừa nhận tin được phong Bàn Tay Nhà Vua").
- Chọn 1 hook → đây chính là điểm bắt đầu truyện, chuyển sang bước xác nhận (mục 8.6).

### 8.4b Nâng cấp tuyến "Đóng Vai Nhân Vật Có Sẵn" — nạp đủ chỉ số/thiên phú/kỹ năng/trang bị

Nhân vật canon (8.4) không chỉ có tên + blurb, mà mỗi `canonCharacter` trong seed Era (8.2) khai báo **bộ chỉ số đầy đủ** theo schema 5.1f, phản ánh đúng nguyên tác:
```ts
// ví dụ trong content/westeros/eras/<era>/characters.ts
{
  id: "eddard-stark",
  "Chỉ Số Cốt Lõi": { "Sức Mạnh":14,"Nhanh Nhẹn":11,"Thể Chất":14,"Trí Tuệ":12,"Tinh Tường":15,"Uy Tín":13 },
  "Thiên Phú": { "Danh Dự Sắt Đá":{...}, "Kiếm Sĩ Thiên Bẩm":{...}, "Lãnh Chúa Phương Bắc":{...} },
  "Kỹ Năng": { "Kiếm & Khiên":{Cấp:7}, "Chỉ Huy Quân":{Cấp:8}, "Nghi Thức Cung Đình":{Cấp:5}, "Học Vấn":{Cấp:6} },
  "Trang Bị Đang Mặc": { "Vũ Khí Chính": { Tên:"Ice", "Phẩm Chất":"Thép Valyria", "Đặc Tính":["valyrian","gia truyền"] } },
  startingHookIds: [...],
}
```
- Khi người chơi chọn nhân vật canon → applyInitVar nạp nguyên bộ chỉ số này vào state. Người chơi **nhập vai một nhân vật đã thành hình** với sức mạnh đúng lore (Ned giỏi kiếm & chỉ huy nhưng vụng chính trị cung đình; Tyrion Trí Tuệ/Uy Tín cao nhưng Sức Mạnh thấp + khiếm khuyết Lùn; Jaime Kiếm Sĩ đỉnh cao...).
- **Tuỳ chọn tinh chỉnh nhẹ:** cho phép người chơi thêm/sửa persona (ngoại hình, tính cách) và **gán ảnh chân dung** (5.1c) cho nhân vật mình đóng, nhưng khoá chỉ số cốt lõi/thiên phú canon (giữ tính nguyên bản). Có thể mở "chế độ tự do" cho ai muốn sửa cả chỉ số.

### 8.5 (NÂNG CẤP) Tuyến "Tự Tạo Nhân Vật" — wizard đầy đủ

Thay 6 bước sơ lược cũ bằng **wizard chi tiết** dùng toàn bộ schema 5.1f. Danh sách mỗi bước lọc theo `availableHouses`/Era + chế độ tường thuật đã chọn. UI mỗi bước là 1 màn kính mờ, có nút Lùi/Tiếp, thanh tiến trình, và **panel preview nhân vật cập nhật realtime** bên cạnh (thấy ngay lựa chọn ảnh hưởng chỉ số thế nào).

**Bước 1 — Nhà & Xuất Thân.** Chọn Nhà (trong `availableHouses`, hoặc "Không thuộc Nhà lớn"), rồi **Xuất Thân** — mỗi loại cho gói chỉ số nền + thiên phú/kỹ năng khởi điểm + trang bị + **gói tài sản** khác nhau (đây là "class nền", ảnh hưởng cơ học thật, không chỉ mô tả):

| Xuất Thân | Bonus chỉ số nền | Thiên phú tặng | Kỹ năng khởi điểm | Gói Tài Sản khởi đầu | Ghi chú |
|---|---|---|---|---|---|
| Lãnh Chúa Kế Vị | +2 Uy Tín, +1 Trí Tuệ, +1 Thống Ngự | Duyên Quý Nhân + Lãnh Chúa (mở lãnh địa) | Nghi Thức +3, Chỉ Huy Quân +3, Học Vấn +2 | **Lãnh địa + chư hầu**: Vàng 5.000, Lương 20.000, Thu 2.000/Chi 1.200 mỗi kỳ, có quân đồn trú | Nối lãnh địa (10) + kinh tế (15) ngay từ đầu; nhiều kẻ dòm ngó |
| Quý Tộc Nhỏ | +2 Uy Tín, +1 Trí Tuệ | Duyên Quý Nhân | Nghi Thức +3, Học Vấn +2, Cưỡi Ngựa +2 | Trang viên: Vàng 2.000, Lương 5.000, Thu 500/Chi 300 | Có tước nhỏ, không lãnh địa lớn |
| Hiệp Sĩ | +2 Sức Mạnh, +1 Thể Chất | Kiếm Sĩ Thiên Bẩm | Kiếm & Khiên +4, Cưỡi Ngựa Chiến +3 | Ngựa chiến + giáp xích + Vàng 300 | Danh dự hiệp sĩ, sống nhờ phò tá/giải đấu |
| Lính Đánh Thuê | +2 Nhanh Nhẹn, +1 Sức Mạnh | Thân Thủ Mèo Rừng | vũ khí tự chọn +3, Sinh Tồn +2, Hù Doạ +2 | Vũ khí cá nhân + Vàng 150 | Linh hoạt, không ràng buộc trung thành |
| Học Trò Học Viện (Maester) | +3 Trí Tuệ | Mưu Sĩ Lọc Lõi | Y Thuật +4, Học Vấn +4, Ngôn Ngữ +2 | Túi thuốc + sách + Vàng 100 | Tri thức uyên bác, yếu chiến đấu |
| Thương Nhân Giàu | +1 Uy Tín, +1 Trí Tuệ, +1 điểm point-buy | Thương Cổ Cự Phú | Buôn Bán +4, Đàm Phán +2 | **Vốn buôn lớn**: Vàng 3.000, tuyến thương mại nhỏ (nối 15), nhưng không đất/quân | Giàu tiền mặt, yếu vũ lực & danh vọng |
| Thường Dân Cùng Khổ | +2 Thể Chất, +1 điểm point-buy | (chọn thêm) | Sinh Tồn +3, Thủ Công +2 | Gần như trắng tay: Vàng 10, ít lương | Bắt đầu từ đáy, tự do định hình |
| Con Hoang (Bastard) | +1 Sức Mạnh, +1 Nhanh Nhẹn | Tiếng Xấu (khiếm khuyết, +điểm) | Kiếm +2, Sinh Tồn +2 | Vũ khí thường + Vàng 50 | Bị kỳ thị nhưng bền bỉ (kiểu Jon/Ramsay) |
| Điệp Viên/Sát Thủ | +2 Nhanh Nhẹn, +1 Tinh Tường | Con Mắt Tinh Đời | Ẩn Nấp +3, Lừa Gạt +3, Độc Dược +2 | Dao găm + áo choàng ẩn + lọ độc + Vàng 200 | Tuyến mưu đồ/ám sát (nối 14) |
| Kẻ Mang Dòng Máu Cổ | +1 Trí Tuệ, +1 Tinh Tường | **thiên phú ma thuật ẩn** (Warg/Greenseer/Máu Rồng tuỳ Nhà+Era) | tuỳ dòng máu | Ít (Vàng 50) | Chỉ mở nếu Era cho phép; sức mạnh thức tỉnh dần |

> **Gói tài sản** ánh xạ vào state ngay lúc initvar: Vàng → `Thông Tin Nhân Vật.Vàng`; Lương/Thu/Chi → khối kinh tế (mục 15); lãnh địa → khối Lãnh Địa (mục 10) + quân đồn trú (mục 11). Chênh lệch khởi điểm này **có ý nghĩa cơ học** (Lãnh Chúa mở ngay lối chơi chiến lược/quản trị; Thường Dân phải cày từ đầu) — tham khảo pattern gói tài sản gắn giai cấp của các card tạo kịch bản có sẵn. Số cụ thể co giãn theo Độ Khó.

**Bước 2 — Phân Bổ Chỉ Số Cốt Lõi (Point-Buy).** 6 chỉ số bắt đầu ở 8, người chơi có **quỹ điểm cố định** (vd 12 điểm, chỉnh theo độ khó) để nâng, mỗi chỉ số trần 15 lúc tạo (để dành đất phát triển tới 20). Bonus xuất thân (Bước 1) cộng SAU point-buy. Có thể **hạ một chỉ số xuống tối thiểu 6 để lấy thêm điểm** dồn chỗ khác. Panel preview hiển thị ngay Chỉ Số Phái Sinh (HP tối đa, Phòng Thủ...) đổi theo. Cách point-buy tuyến tính (1 điểm = +1) cho dễ hiểu; nếu muốn cân bằng hơn có thể làm chi phí luỹ tiến (nâng từ 13→14 tốn 2 điểm), nhưng ưu tiên đơn giản trước.

**Bước 3 — Chọn Thiên Phú.** Từ ngân hàng thiên phú (5.1f-C) đã lọc theo Era + Nhà + xuất thân: chọn **2 thiên phú tích cực**. Muốn thêm → **nhận 1 Khiếm Khuyết đổi 1 thiên phú/điểm** (đánh đổi kiểu ASOIAF). Thiên phú ma thuật chỉ hiện nếu Era bật + xuất thân/Nhà hợp lệ (không phải ai cũng warg được). Mỗi lựa chọn hiện rõ hiệu ứng cơ học + màu tường thuật nó mở.

**Bước 4 — Phân Bổ Kỹ Năng.** Có **quỹ điểm kỹ năng** (vd 15 điểm, +điểm từ xuất thân) rải vào danh mục kỹ năng (5.1f-D). Trần khởi điểm mỗi kỹ năng là 5 (bậc thầy 10 để dành cho lúc chơi). Kỹ năng nhóm Ma Thuật chỉ mở nếu đã chọn thiên phú ma thuật tương ứng ở Bước 3. Preview cảnh báo nếu dồn hết vào 1 nhóm (gợi ý cân bằng, không ép).

**Bước 5 — Trang Bị Khởi Đầu.** Chọn gói trang bị hoặc tự sắm bằng vàng khởi điểm (từ xuất thân):
- Gói dựng sẵn theo xuất thân (Hiệp Sĩ: kiếm dài + khiên + giáp xích + ngựa; Maester: dao nhỏ + sách + túi thuốc; Sát thủ: dao găm + áo choàng ẩn + lọ độc...).
- Hoặc **tự chọn** từ danh sách vũ khí/giáp cơ bản theo giá (nối kinh tế 15). Phẩm chất khởi đầu tối đa "Tinh Xảo" — đồ "Thép Valyria"/"Vô Giá" KHÔNG mua được lúc tạo (phải kiếm trong game), trừ khi đóng vai canon có sẵn (8.4b). Món equipped áp ngay vào Chỉ Số Phái Sinh, thấy trong preview.

**Bước 6 — Persona & Chân Dung.** Nhập ngoại hình, tính cách, tiểu sử tự do (đưa vào lore entry khởi tạo + `Tính Cách` 4 trục ở 16.2); **gán ảnh chân dung** cho nhân vật (5.1c, upload → Dexie); đặt biệt danh nếu muốn. AI dùng phần này để nhất quán giọng nhân vật.

**Bước 7 — Danh Vọng & Khủng Hoảng Khởi Đầu.** Hai lựa chọn định hình vị thế mở màn:
- **Danh Vọng khởi điểm:** phần lớn nhân vật tự tạo bắt đầu "Vô Danh Tiểu Tốt" (16.4), nhưng xuất thân cao (Lãnh Chúa) hoặc chọn thiên phú danh tiếng có thể khởi ở bậc thấp của thang Vinh; con hoang/tiếng xấu khởi ở bậc Nhục nhẹ. Đặt điểm xuất phát cho hành trình danh vọng.
- **Khủng Hoảng Hiện Tại (chọn 1):** một tình thế nguy cấp gắn ngay vào nhân vật lúc mở màn — biến game khởi động **có xung đột** thay vì tẻ nhạt. Danh sách lọc theo xuất thân + Nhà + Era (nối `crisisData` seed). Ví dụ:
  - Lãnh Chúa → "Chư hầu ngươi sắp nổi loạn vì thuế nặng" / "Kho lương chỉ đủ qua nửa mùa đông đang tới"
  - Con Hoang → "Cha vừa mất, người anh đích tôn muốn tống ngươi khỏi lâu đài trước khi ngươi tranh quyền"
  - Hiệp Sĩ lưu vong → "Ngươi mắc nợ máu một lãnh chúa quyền thế, sát thủ đang lần theo"
  - Thương nhân → "Một đối thủ vu cho ngươi tội buôn lậu, quan quân sắp tới khám"
  - Giữa Chiến Tranh Ngũ Vương (Era) → "Đại quân địch đang tiến về lãnh địa ngươi, viện binh còn xa"
  Khủng hoảng này được engine đưa vào tin nhắn mở đầu + lore khởi tạo, thành móc kịch tính AI khai triển ngay lượt đầu.

**Bước 8 — Một Tâm Phúc Khởi Đầu (tùy chọn).** Chọn có/không một **NPC trung thành đi cùng từ đầu** (dùng `NpcSchema` 5.1b):
- **"Ta có một tâm phúc"** → tạo nhanh 1 NPC đồng hành: chọn nguyên mẫu (vệ sĩ trung thành / quân sư lọc lõi / bạn nối khố / hiệp sĩ thề trung / hầu gái tinh ranh...), đặt tên, **gán ảnh (tùy chọn)**, engine tạo NPC với Hảo Cảm khởi điểm cao (Thân Thiết/Tri Kỷ) + Tin Cậy cao + năng lực/kỹ năng phù hợp nguyên mẫu. Cho người chơi một điểm tựa quan hệ ngay lúc mở màn (nối hệ NPC 16 + hảo cảm 5.1d).
- **"Ta quen đơn thương độc mã"** → bỏ qua, bắt đầu một mình (khó hơn, hợp tuyến sát thủ/lưu vong).

**Bước 9 — Điểm Bắt Đầu (Starting Hook).** Chọn tình huống mở màn phù hợp Era + xuất thân + khủng hoảng đã chọn (khác canon hook ở chỗ sinh động theo nhân vật tự tạo): vd Hiệp Sĩ vô danh → "ngươi vừa tới một giải đấu thương hy vọng đổi đời"; Con Hoang phương Bắc → "ngươi bị đuổi khỏi lâu đài cha, phải tự mưu sinh". Có thể để AI sinh hook ngẫu nhiên hợp hồ sơ. → chuyển sang xác nhận (8.6).

**Bước 10 — Preview & Xác Nhận.** Màn tổng kết "Cuộn Giấy Vận Mệnh": char card đầy đủ (ảnh, chỉ số cốt lõi + phái sinh, thiên phú, kỹ năng, trang bị đang mặc, gói tài sản, danh vọng, khủng hoảng, tâm phúc, persona) dạng poster kính mờ. Nút "Bước Vào Loạn Thế" → flow kỹ thuật 8.6.

**Cân bằng theo Độ Khó:** quỹ điểm point-buy/kỹ năng và số thiên phú co giãn theo `Độ Khó` (7.9.6) — Nhàn Hạ cho nhiều điểm hơn, Chân Thực ít hơn (nhân vật khởi đầu yếu, phải vươn lên). Lưu chọn lựa để engine áp initvar.

### 8.5b Ngân hàng Khủng Hoảng Khởi Đầu (Starting Crisis Bank)

Bước 7 wizard (8.5) cho người chơi chọn 1 **Khủng Hoảng Hiện Tại** — móc kịch tính gắn ngay nhân vật lúc mở màn. Đây là ngân hàng đầy đủ, lưu `content/westeros/startingCrises.ts`, mỗi mục có cấu trúc:

```ts
interface StartingCrisis {
  id: string;
  title: string;            // tên ngắn hiển thị trong wizard
  desc: string;             // mô tả đưa vào lore khởi tạo + tin nhắn mở đầu
  origins: string[];        // xuất thân phù hợp (rỗng = mọi xuất thân)
  eras?: string[];          // Era phù hợp (rỗng = mọi Era)
  houses?: string[];        // Nhà phù hợp (rỗng = mọi Nhà)
  tags: string[];           // "chính trị","quân sự","gia tộc","sinh tồn","tài chính","siêu nhiên"
  initialStateHint?: string; // gợi ý cho engine set state khởi đầu (vd sĩ khí thấp, kho lương cạn)
}
```
Wizard lọc theo xuất thân + Nhà + Era người chơi đã chọn, hiện 4–6 khủng hoảng khớp + tùy chọn "Khởi đầu yên bình (không khủng hoảng)" + "Để AI tự gieo". Engine đưa `desc` vào lore entry khởi tạo (8.6) để AI khai triển ngay lượt đầu.

#### Nhóm theo Xuất Thân

**A. Lãnh Chúa / Quý Tộc (cai trị đất & người)**
| Title | Mô tả (rút gọn) | Tags |
|---|---|---|
| Chư Hầu Bất Mãn | Các gia tộc chư hầu phản đối vì thuế nặng/nghĩa vụ quân dịch; vài kẻ đã ngừng nộp cống, bàn tán chuyện ly khai. | chính trị, gia tộc |
| Kho Lương Cạn Trước Đông | Mùa đông đang tới mà kho dự trữ chỉ đủ nửa mùa; dân bắt đầu hoảng, nạn đói lấp ló. | sinh tồn, tài chính |
| Tranh Chấp Kế Vị | Cha/anh vừa mất, một người họ hàng cũng đòi quyền thừa kế lãnh địa, chư hầu chia phe. | gia tộc, chính trị |
| Cường Địch Áp Biên | Một lãnh chúa láng giềng mạnh hơn đang tập binh sát biên giới, viện cớ tranh chấp đất cũ. | quân sự |
| Nợ Sắt Ngân Hàng | Ngươi nợ Ngân Hàng Sắt Braavos một khoản lớn (hoặc nợ một Nhà chủ nợ); hạn trả sắp tới, không trả thì tai hoạ. | tài chính |
| Dịch Bệnh Lan Tràn | Một chứng bệnh (đậu xám?) bùng trong lãnh địa, dân chết dần, phải phong toả hay liều cứu chữa. | sinh tồn |
| Phản Thần Trong Nhà | Một cận thần/quản gia tin cẩn đang âm thầm bán tin cho kẻ địch; ngươi mới chỉ ngờ ngợ. | chính trị, mưu đồ |

**B. Hiệp Sĩ / Lính Đánh Thuê (sống bằng lưỡi kiếm)**
| Title | Mô tả | Tags |
|---|---|---|
| Nợ Máu Truy Đuổi | Ngươi lỡ giết/làm nhục người của một lãnh chúa quyền thế; sát thủ và thợ săn tiền thưởng đang lần theo. | sinh tồn, chính trị |
| Chủ Cũ Phản Bội | Lãnh chúa ngươi phụng sự vừa quỵt tiền công/vu tội cho ngươi để phủi trách nhiệm; ngươi bị truy nã oan. | chính trị, tài chính |
| Giải Đấu Định Mệnh | Một giải đấu thương lớn sắp mở, giải thưởng đủ đổi đời — nhưng đối thủ toàn danh tướng, và có kẻ muốn ngươi bại. | quân sự |
| Đội Quân Tan Rã | Đoàn lính đánh thuê của ngươi vừa thua trận/hết tiền, quân sắp ly tán; phải tìm hợp đồng mới gấp. | quân sự, tài chính |

**C. Con Hoang / Xuất Thân Thấp (vươn lên từ đáy)**
| Title | Mô tả | Tags |
|---|---|---|
| Bị Đuổi Khỏi Nhà | Cha vừa mất, người thừa kế đích tôn muốn tống ngươi đi trước khi ngươi kịp tranh chấp gì; ngươi có ít ngày. | gia tộc |
| Thân Phận Bị Nghi | Có kẻ bắt đầu nghi ngờ dòng máu/quá khứ thật của ngươi — điều ngươi giấu kín có thể bị phanh phui. | chính trị, mưu đồ |
| Món Nợ Xã Hội Đen | Ngươi mắc nợ một băng nhóm/tú bà ở thành thị; chúng đòi ngươi làm việc bẩn để trừ nợ. | tài chính, sinh tồn |
| Cơ Hội Đổi Đời | Một quý nhân bất ngờ để mắt tới ngươi và hứa cất nhắc — nhưng cái giá và động cơ của ông ta còn mờ ám. | chính trị |

**D. Học Trò Học Viện / Maester (tri thức & âm mưu)**
| Title | Mô tả | Tags |
|---|---|---|
| Bí Mật Nguy Hiểm | Ngươi tình cờ phát hiện một bí mật động trời (thân thế, âm mưu, tri thức cấm); biết điều đó khiến ngươi thành mục tiêu. | mưu đồ, siêu nhiên |
| Bị Vu Đầu Độc | Lãnh chúa ngươi phục vụ đột ngột ngã bệnh/qua đời, ngươi — người coi thuốc — bị nghi hạ độc. | chính trị |
| Tri Thức Cấm | Ngươi theo đuổi một nhánh học vấn bị Học Viện/Đức Tin cấm đoán; có người đã để ý và cảnh cáo. | siêu nhiên, chính trị |

**E. Điệp Viên / Sát Thủ (bóng tối)**
| Title | Mô tả | Tags |
|---|---|---|
| Hợp Đồng Bất Khả | Ngươi nhận (hoặc bị ép nhận) một hợp đồng ám sát gần như bất khả thi; từ chối cũng chết. | mưu đồ, sinh tồn |
| Vỏ Bọc Sắp Lộ | Thân phận giả của ngươi trong triều/gia tộc mục tiêu sắp bị bóc trần; phải hành động hoặc bỏ chạy. | mưu đồ |
| Bị Chính Tổ Chức Truy Sát | Ngươi biết quá nhiều hoặc cãi lệnh; hội của ngươi (Faceless Men? một Nhà?) nay muốn diệt khẩu. | mưu đồ, sinh tồn |

**F. Thương Nhân (tiền & mạng lưới)**
| Title | Mô tả | Tags |
|---|---|---|
| Bị Vu Buôn Lậu | Một đối thủ vu cho ngươi tội buôn lậu/trốn thuế; quan quân sắp tới khám kho, cần chạy chọt hoặc chứng minh trong sạch. | tài chính, chính trị |
| Đoàn Hàng Bị Cướp | Một chuyến hàng lớn (cả gia sản) bị cướp/đắm; ngươi bên bờ phá sản, phải gỡ gạc. | tài chính |
| Độc Quyền Bị Đe Doạ | Một thế lực lớn muốn nuốt tuyến thương mại của ngươi, ép giá hoặc dùng bạo lực. | tài chính, chính trị |

#### Nhóm theo Thời Kỳ (chồng lên xuất thân)

- **Chinh Phạt Aegon (~2 BC–1 AC):** "Rồng Đến Từ Biển" — tin ba con rồng Targaryen đổ bộ, các Vua trong vùng ngươi phải chọn quy hàng hay kháng cự (mọi xuất thân). "Vua Của Ngươi Triệu Tập Cần Vương" — lãnh chúa ngươi phục vụ gọi ngươi ra trận chống quân xâm lược.
- **Vũ Điệu Rồng (129–131 AC):** "Chọn Phe Trong Nội Chiến" — Xanh (Aegon II) hay Đen (Rhaenyra)? Chọn sai bên là diệt vong. "Rồng Đối Rồng Trên Bầu Trời" — vùng ngươi nằm giữa hai phe, sắp thành chiến trường.
- **Loạn Robert (282–283 AC):** "Cuộc Nổi Dậy Đã Bắt Đầu" — Robert phất cờ chống Vua Điên, ngươi phải chọn trung thành Targaryen hay theo phiến quân. "Vua Điên Nghi Kỵ" — nếu gần triều đình, sự hoang tưởng của Aerys II đe doạ chính ngươi.
- **Chiến Tranh Ngũ Vương (298–300 AC):** "Năm Vị Vua Xưng Đế" — Bảy Phủ tan thành loạn, lãnh địa/lòng trung của ngươi bị giằng xé giữa các phe. "Đại Quân Áp Sát" — một trong năm đạo quân đang tiến về vùng ngươi. "Đỏ Cưới Đang Được Bày" (nếu liên quan Nhà Stark/Frey/Tully) — một cái bẫy phản trắc sắp giăng, ngươi có thể vô tình dính vào.
- **Trường Dạ / Beyond the Wall (Era siêu nhiên bật):** "Bóng Trắng Sau Tường Thành" — tin đồn về Người Chết trỗi dậy ở phương Bắc xa; ít ai tin, nhưng điềm báo đang tới. "Mùa Đông Không Dứt" — cái lạnh siêu nhiên lan xuống, mùa màng chết, sinh tồn thành ưu tiên số một.

#### Cách khủng hoảng ảnh hưởng khởi đầu

- **Vào lore + tin nhắn mở đầu:** `desc` được `buildInitLoreEntry` (8.6) đưa vào entry constant + tin mở, nên AI khai triển tình huống ngay lượt đầu thay vì mở màn tẻ nhạt.
- **Set state khởi đầu qua `initialStateHint`:** engine có thể áp trạng thái phản ánh khủng hoảng — vd "Kho Lương Cạn" → set Lương thấp trong khối kinh tế (15); "Chư Hầu Bất Mãn" → set Thái Độ vài Nhà chư hầu về Bất Mãn/Dao Động (5.1); "Cường Địch Áp Biên" → tạo một đơn vị quân địch gần lãnh địa (11) + đánh dấu trên bản đồ (9).
- **Không khoá lối chơi:** khủng hoảng là điểm xuất phát kịch tính, không phải nhiệm vụ bắt buộc — người chơi tự do giải quyết, phớt lờ, hay biến nó thành cơ hội. Nối hệ Quest (17.2) nếu muốn theo dõi.
- **Cân bằng theo Độ Khó:** Chân Thực có thể cho khủng hoảng nặng hơn (nhiều mặt trận cùng lúc); Nhàn Hạ cho khủng hoảng nhẹ, dễ gỡ.

### 8.6 Xác nhận & bắt đầu chơi (flow kỹ thuật — dùng chung cho cả 2 tuyến)
Tham khảo đúng pattern đã chạy thật ở màn hình mở đầu của các card trước đó (ghi lore trước, đẩy tin nhắn mở, rồi tự trigger AI — không bắt người chơi tự gõ tin nhắn đầu tiên):
```
onConfirmCharacterCreation(userData, era, hook?):
  1. loreEntry = buildInitLoreEntry(userData, era, hook)  // gộp lựa chọn + bối cảnh era/hook thành 1 entry constant,
                                                            // position "before_char"
  2. loreEngine.addEntry(loreEntry)
  3. openingMessage = formatUserDataAsOpeningMessage(userData, era, hook)
  4. chatStore.appendMessage({ role: "user", content: openingMessage })
  5. mvuEngine.applyInitVar(userData, era)     // set initvar StatDataSchema, bao gồm Thế Giới.Năm theo era.yearRange
  6. triggerAiGeneration()                     // gọi API ngay
```
Theme UI: đổi accent color theo Nhà đã chọn ngay khi có kết quả (bước 1 wizard, hoặc ngay khi chọn xong nhân vật canon).

### 8.6b Bổ sung flow kỹ thuật — nạp nhân vật đầy đủ vào state

Mở rộng `onConfirmCharacterCreation` (8.6) để nạp toàn bộ schema 5.1f:
```
onConfirmCharacterCreation(userData, era, hook?):
  ... (bước 1-4 như cũ: lore entry, opening message) ...
  5. mvuEngine.applyInitVar(userData, era):
       • set Chỉ Số Cốt Lõi (point-buy + bonus xuất thân)
       • set Thiên Phú, Kỹ Năng đã chọn
       • set Trang Bị Đang Mặc + Túi Đồ + Vàng khởi điểm
       • engine TÍNH Chỉ Số Phái Sinh từ cốt lõi+trang bị+cấp (mục 5.1f-B)
       • set HP/Thể Lực hiện tại = trần vừa tính
       • lưu ảnh chân dung vào Dexie (5.1c), gán khoá vào state
       • set Thế Giới.Năm theo era.yearRange
  6. triggerAiGeneration()
```
Sau bước này, Status Panel (mục 6) hiển thị đầy đủ nhân vật; mọi phán định về sau (combat 7, xã hội, mưu đồ 14) đọc đúng chỉ số/kỹ năng/trang bị vừa tạo.

### 8.7 Seed data nền tảng (Nhà lớn, địa danh, lịch Westeros)
Dữ liệu dùng chung cho mọi Era (mỗi Era chỉ tham chiếu subset qua `availableHouses`):

**Các Nhà lớn:**
```ts
interface HouseData {
  id: string; name: string; sigil: string; words: string; seat: string;
  region: string; themeColor: { primary: string; secondary: string };
}
```
Seed tối thiểu: Stark (Winterfell, phương Bắc, "Mùa đông đang đến"), Lannister (Casterly Rock, phương Tây — châm ngôn phổ biến "Ta không bao giờ trả nợ" là không chính thức, châm ngôn thật là im lặng), Targaryen (Dragonstone, "Lửa và Máu"), Baratheon (Storm's End, "Cơn thịnh nộ của ta là vô song"), Greyjoy (Pyke, "Chúng ta không gieo trồng"), Tyrell (Highgarden, "Đang trỗi dậy"), Martell (Sunspear, "Không bao giờ khuất phục, không bao giờ đầu hàng"), Arryn (The Eyrie, "Cao và hùng mạnh"), Tully (Riverrun, "Gia đình, Nghĩa vụ, Danh dự").

**Địa danh chính** (cho bản đồ mục 9 + lore mặc định): Winterfell, King's Landing, The Wall, Dragonstone, Casterly Rock, Highgarden, Sunspear, The Eyrie, Riverrun, Pyke, Storm's End, Braavos, White Harbor, Oldtown.

**Lịch Westeros** (thiết kế riêng vì canon không quy định chi tiết):
- Năm tính theo mốc AC (After Conquest).
- 12 tháng/năm (đặt tên trung tính), mỗi mùa (Xuân/Hạ/Thu/Đông) **kéo dài không cố định** (đặc trưng thế giới ASOIAF) — engine random độ dài mùa trong khoảng hợp lý (vd 2–8 năm) khi bắt đầu game mới, không đổi mùa giữa chừng trừ khi cốt truyện yêu cầu.
- Thời tiết: bảng xác suất theo mùa + vùng miền (phương Bắc mùa đông dễ có bão tuyết, phương Nam hiếm khi có tuyết).

---

## 9. Bản đồ tương tác (Interactive Map)

### 9.1 Nguồn ảnh bản đồ & cách tận dụng quartermaester.info

Người dùng đề xuất tham khảo **quartermaester.info** — bản đồ Westeros tương tác rất tốt. Phân tích để dùng cho đúng:

**quartermaester.info gồm gì** (để học hỏi): bản đồ Westeros + Essos có địa danh chính xác; các **layer bật/tắt** (lãnh thổ theo Nhà quý tộc "Nobility", theo khu vực "Constituencies"); **đường đi nhân vật theo thời gian** (path của Ned, Dany, Tyrion...); **thanh trượt spoiler** giới hạn theo chương/tập để ẩn diễn biến chưa tới; deep-link tới 1 địa danh bằng URL dạng `#@Winterfell`; và link ra wiki awoiaf.westeros.org cho chi tiết mỗi địa danh.

**Ràng buộc quan trọng — KHÔNG nhúng/sao chép trực tiếp:** bản đồ và mọi địa danh là **tài sản trí tuệ của George R.R. Martin**; lớp tile bản đồ do hoạ sĩ khác vẽ (theMountainGoat) và site chạy trên **Google Maps API** (có Điều khoản dịch vụ riêng). Vì vậy **không** lấy tile/ảnh của họ nhúng vào app của ta, **không** rút dữ liệu toạ độ của họ để tái phân phối. Làm vậy vi phạm bản quyền + ToS.

**Cách tận dụng hợp lệ và thông minh:**
1. **Học mô hình layer** (đây là giá trị lớn nhất): app của ta bê nguyên ý tưởng nhiều layer bật/tắt — layer lãnh thổ theo Nhà, layer quân đội, layer đường đi/di chuyển, và (rất hợp ASOIAF) **thanh xem lại hành trình** để tua ngược xem bản đồ ở các mốc quá khứ của ván chơi. Mô hình này định hình mục 9.3 bên dưới.
2. **Deep-link ra quartermaester cho tra cứu lore:** khi người chơi bấm 1 địa danh trên bản đồ của ta, popup có nút "Xem trên bản đồ Westeros" mở `https://quartermaester.info/#@<TênĐịaDanh>` ở tab mới, và/hoặc nút mở trang wiki awoiaf tương ứng. Ta **liên kết** tới nguồn ngoài để người chơi tra cứu, thay vì copy nội dung của họ vào app — vừa đúng luật vừa cho người chơi kho lore khổng lồ có sẵn.
3. **Ảnh nền bản đồ của ta:** dùng ảnh bản đồ Westeros mà người dùng **tự cung cấp** (sẽ đưa file sau) hoặc nguồn có giấy phép phù hợp (nhiều bản đồ fan-art cho phép dùng phi thương mại — kiểm tra giấy phép trước). Đặt vào `content/westeros/assets/map.(png|jpg|webp)`, khai báo kích thước gốc trong `mapConfig.ts`; mọi toạ độ vùng/địa danh tính theo hệ px ảnh này (hệ toạ độ riêng của app, tương tự cách card "Đại Lãnh Chúa" tự dựng canvas toạ độ 50000×50000px cho bản đồ của nó).

**Thiết kế "cắm ảnh vào là chạy":** trong lúc chưa có ảnh thật, dùng placeholder (nền gradient trầm + phác thảo SVG các vùng chính) để milestone bản đồ vẫn build/test độc lập. Thay ảnh thật vào sau chỉ cần cập nhật `mapConfig.ts` + toạ độ polygon/marker, không đổi code engine. Bản thân data địa danh/vùng của ta tự xây (toạ độ tự đặt trên ảnh của mình), **không** phụ thuộc dữ liệu quartermaester.

### 9.2 Cấu trúc dữ liệu vùng/địa danh
```ts
interface MapRegion {
  id: string;                     // "the-north", "the-riverlands"... khớp regionId trong stat_data."Chủ Quyền Lãnh Thổ" (9.5.1) + "Lãnh Địa" (mục 10)
  name: string;
  polygonPx: [number, number][];  // toạ độ đa giác theo px ảnh gốc (vẽ qua map editor 9.6.2)
  // Nhà kiểm soát KHÔNG lưu ở đây — đọc động từ stat_data."Chủ Quyền Lãnh Thổ"[id]."Nhà Kiểm Soát" (nguồn chân lý, 9.5.1);
  // màu tô suy ra runtime theo chế độ hiển thị (Chính Trị dùng HOUSE_COLORS 9.5.4 / Quan Hệ dùng heatmap Thái Độ 9.5.2)
}
interface MapMarker {
  id: string; name: string; type: "castle" | "city" | "landmark" | "army" | "player";
  x: number; y: number;           // px trên ảnh gốc
  territoryId?: string;           // link tới mục 10 nếu là 1 lãnh địa xây dựng được
  quartermaesterName?: string;    // tên chuẩn để deep-link ra quartermaester.info/#@<tên> (mục 9.1)
  wikiSlug?: string;              // slug awoiaf.westeros.org cho nút "tra cứu lore"
}
```

### 9.3 Layer hiển thị (mô hình đa layer học từ quartermaester — mục 9.1)
- **Base layer:** ảnh bản đồ (`L.imageOverlay` với Leaflet, hoặc `<img>` nền cho bản tự viết). Phủ 1 lớp gradient/vignette trầm rất nhẹ lên ảnh để đồng bộ tông màu ít bão hoà của app (ràng buộc mỹ thuật điểm 4), giúp bản đồ không "chỏi" với UI kính mờ xung quanh.
- **Territory layer (Nhà quý tộc):** polygon tô màu theo Nhà kiểm soát vùng (đọc động từ state, **cơ chế đầy đủ ở 9.5** — 2 chế độ Chính Trị/Quan Hệ + animation đổi màu khi chiếm), opacity thấp để không che chi tiết ảnh; hover/click mở panel lãnh địa (mục 10). Đây là bản "Nobility layer" của quartermaester nhưng gắn với state game của ta (ai đang kiểm soát vùng nào thay đổi theo diễn biến chơi, đổi màu realtime khi chiếm/mất).
- **Marker layer:** icon SVG lâu đài/thành phố (click mở popup lore ngắn + nút deep-link quartermaester/wiki — mục 9.1), icon quân đội đang di chuyển (mục 11), icon vị trí nhân vật chính (đồng bộ `stat_data."Thế Giới"."Vị Trí"`). Tất cả icon là SVG tự vẽ, không emoji, không ảnh bitmap.
- **Path layer (đường đi/di chuyển):** vẽ đường hành quân của các đơn vị quân (mục 11.4) và — tuỳ chọn hay — đường di chuyển của chính nhân vật qua các turn (giống "character paths" của quartermaester, nhưng là hành trình của người chơi trong ván này). Đường vẽ SVG nét mảnh, gradient nhạt.
- **Thanh xem lại hành trình (History replay slider):** học từ quartermaester nhưng CHỈ để **xem lại quá khứ** — kéo ngược để xem trạng thái bản đồ ở các mốc đã qua trong ván chơi (ai kiểm soát vùng nào lúc đó, quân ở đâu, mình đã đi những đâu). Đây là read-only replay lịch sử đã diễn ra, **không phải công cụ tua thời gian tới tương lai** (game không cho đẩy thời gian thủ công — mục 6.2); thả tay là về lại hiện tại chơi tiếp. Tạo cảm giác sử thi khi thấy bản đồ quyền lực đổi màu dần theo hành trình mình đã đi.
- **Fog-of-war** (tuỳ chọn, làm sau nếu còn thời gian): vùng chưa từng ghé thăm/chưa có tình báo bị làm mờ tối, sáng dần khi nhân vật đi qua hoặc điệp viên (mục 14.1) cấp tin. Tham khảo cách card "Đại Lãnh Chúa" làm fog bằng **SVG mask** (rect đen phủ toàn bản đồ, khoét lỗ ở ô đã khám phá) — cực hợp với yêu cầu dùng SVG.

### 9.4 Tương tác
- Zoom/pan chuẩn (chuột lăn + kéo trên PC, pinch + kéo trên mobile).
- Click 1 territory → mở panel chi tiết lãnh địa (mục 10) dạng bottom-sheet kính mờ trên mobile / side panel trên PC, không rời màn hình bản đồ.
- Click 1 địa danh → popup kính mờ: mô tả ngắn (từ lore đã nạp nếu khớp tên) + **nút "Xem trên bản đồ Westeros" (mở quartermaester.info/#@tên)** + nút "Tra cứu lore" (mở wiki awoiaf) — tận dụng nguồn ngoài đúng luật (mục 9.1).
- Chế độ xây (mục 10.4): bật lưới + con trỏ ô đất để đặt công trình/tuyến đường ngay trên bản đồ.
- Điều quân (mục 11.5): chọn đơn vị → chọn đích → xem đường + số turn.
- Control góc bản đồ (panel kính nhỏ): toggle từng layer (Nhà/quân đội/đường đi/fog), thanh xem lại hành trình (replay quá khứ — read-only), nút "Về vị trí hiện tại" (center vào nhân vật chính).

### 9.5 Chủ quyền động & tô màu theo chiếm lĩnh (Territory Control & Coloring)

Đây là cơ chế bạn nhấn mạnh: **chiếm vùng nào → vùng đó đổi màu; các vùng khác nhuộm màu theo quan hệ.** Mục 9.3 đã nêu "territory layer tô màu theo Nhà kiểm soát"; mục này đặc tả đầy đủ cơ chế đổi màu động + chế độ màu-theo-quan-hệ, đồng bộ hai chiều với MVU state.

#### 9.5.1 Nguồn chân lý & đồng bộ hai chiều

**Bản đồ KHÔNG tự giữ ai kiểm soát vùng nào — nó ĐỌC từ state.** Chủ quyền mỗi vùng nằm trong `stat_data` (khối Lãnh Địa mục 10 + một bản đồ chủ quyền vùng), bản đồ chỉ render lại. Khi chiếm/mất vùng (qua vây thành 12.2, đổi phe, hôn nhân-kế vị 13.4), engine cập nhật state → bản đồ **tự đổi màu theo** (reactive). Không có chuyện bản đồ và state lệch nhau.

```ts
// trong StatDataSchema — bản đồ chủ quyền các vùng (nối mục 10)
"Chủ Quyền Lãnh Thổ": z.record(
  safeString().describe("regionId, vd 'the-north'"),
  z.object({
    "Nhà Kiểm Soát": safeString(),                 // houseId đang nắm; "" = vô chủ/tranh chấp
    "Tình Trạng": z.enum(["Ổn Định","Đang Tranh Chấp","Bị Vây","Mới Chiếm","Nổi Loạn"]).prefault("Ổn Định"),
    "Là Của Người Chơi": z.boolean().prefault(false), // vùng thuộc phe người chơi
    "_Đổi Chủ Turn": z.coerce.number().int().prefault(0), // readonly — turn gần nhất đổi chủ (cho animation + replay 9.3)
  })
).prefault({}),
```

**Luồng khi chiếm một vùng:**
```
Vây thành thắng (12.2) / NPC đổi phe / thừa kế →
  engine patch "Chủ Quyền Lãnh Thổ.<vùng>.Nhà Kiểm Soát" = houseMới
  + set Tình Trạng "Mới Chiếm", _Đổi Chủ Turn = turn hiện tại
  + nếu là phe người chơi: Là Của Người Chơi = true
        ↓ (state đổi → bản đồ reactive)
  polygon vùng đó CHUYỂN MÀU sang màu Nhà mới, với ANIMATION (9.5.3)
  + toast "Ngươi đã chiếm được <Vùng>!" + (tuỳ) âm thanh
  + delta lãnh thổ hiện trên bản đồ (nối battle_report 7.10)
```

#### 9.5.2 Hai chế độ tô màu (toggle trên bản đồ)

Người chơi bật/tắt giữa hai cách nhìn — đây chính là "đổi màu khi chiếm" **và** "màu theo quan hệ" bạn muốn:

**Chế độ 1 — Bản Đồ Chính Trị (theo Nhà kiểm soát).** Mỗi vùng tô **màu bản sắc của Nhà đang kiểm soát** (lấy từ bảng màu Nhà, 9.5.4). Đây là cái đổi khi ngươi chiếm đất: vùng vừa chiếm chuyển từ màu Nhà cũ sang màu Nhà ngươi. Vùng vô chủ/tranh chấp tô xám trung tính hoặc sọc hai màu (đang giành nhau). Nhìn tổng thể thấy ngay bản đồ quyền lực Bảy Phủ và phần lãnh thổ của mình lan ra sao.

**Chế độ 2 — Bản Đồ Quan Hệ (theo Thái Độ với người chơi).** Mỗi vùng nhuộm theo **Thái Độ của Nhà kiểm soát vùng đó ĐỐI VỚI người chơi** (đọc `Thái Độ Các Nhà` mục 5.1) — một "political heatmap" nhìn phát biết bạn bè/kẻ thù ở đâu:

| Thái Độ (5.1) | Màu heatmap | Ý nghĩa |
|---|---|---|
| Của người chơi | Vàng kim / màu Nhà mình nổi bật | Lãnh thổ ta |
| Tín Nhiệm | Xanh lá đậm | Đồng minh thân, có thể mượn đường/xin viện |
| Ủng Hộ | Xanh lá nhạt | Thân thiện |
| Cảnh Giác | Xám xanh trung tính | Trung lập, dè chừng |
| Dao Động | Vàng nhạt | Đang lung lay, có thể lôi kéo hoặc mất |
| Bất Mãn | Cam | Khó chịu với ta |
| Địch Ý | Đỏ nhạt | Thù nghịch |
| Thù Địch | Đỏ đậm | Kẻ thù, nguy hiểm khi bén mảng |

Chế độ này khiến ngoại giao (mục 13) **trực quan**: sau một cuộc hôn nhân liên minh, cả một vùng chuyển từ cam sang xanh; sau khi ngươi xử tử con tin của một Nhà, vùng họ đỏ rực. Bạn thấy hậu quả chính trị của mình lan trên bản đồ.

> Toggle này là **hai lăng kính nhìn cùng một dữ liệu** — cùng đọc từ state (ai kiểm soát vùng + Thái Độ của họ), chỉ khác cách tô. Có thể thêm chế độ 3 "Địa Hình" (tô theo loại địa hình cho combat, nối 7.6) nếu hữu ích, nhưng 2 chế độ trên là cốt lõi bạn cần.

#### 9.5.3 Chuyển màu có hồn (animation)

Đổi màu không đột ngột — dùng animation để "chiếm đất" thành khoảnh khắc:
- **Transition mượt:** polygon `fill` chuyển màu qua `transition` CSS/SVG ~600–800ms (ease), màu cũ tan dần sang màu mới.
- **Hiệu ứng "lan chiếm":** khi mới chiếm, một gợn sáng (pulse/ripple) lan từ tâm vùng ra viền, hoặc viền vùng sáng lên rồi dịu — báo hiệu vùng vừa đổi chủ (dùng `_Đổi Chủ Turn` để biết vùng nào vừa đổi).
- **Nhấp nháy tình trạng:** vùng "Bị Vây" viền nhấp nháy đỏ chậm; "Nổi Loạn" phủ vân sọc động; "Đang Tranh Chấp" hai màu Nhà xen kẽ chuyển động nhẹ. Tất cả bằng SVG (ràng buộc mỹ thuật điểm 2), tông trầm ít bão hoà (điểm 4).
- **Đồng bộ replay (9.3):** khi kéo thanh xem lại hành trình, các lần đổi màu tái hiện theo `_Đổi Chủ Turn` — thấy lãnh thổ mình lan dần qua các mốc đã đi, tạo cảm giác sử thi.

#### 9.5.4 Bảng màu Nhà (House color palette)

Mỗi Nhà một màu bản sắc (dùng cho cả bản đồ + theme UI mục 6), lấy **màu huy hiệu canon** nhưng **giảm bão hoà** cho hợp tông trầm của app (ràng buộc mỹ thuật điểm 4):

```ts
// content/westeros/houseColors.ts — màu đã giảm bão hoà, không chói
const HOUSE_COLORS: Record<string, { base: string; light: string; label: string }> = {
  stark:      { base: "#5b6670", light: "#8a97a3", label: "Xám Sói" },        // xám-lam lạnh
  lannister:  { base: "#9c2b2b", light: "#c85a5a", label: "Đỏ Son + Vàng" },  // đỏ thẫm
  targaryen:  { base: "#1a1a1a", light: "#8b1e1e", label: "Đen + Đỏ Lửa" },   // đen-đỏ rồng
  baratheon:  { base: "#b8912e", light: "#e0be5c", label: "Vàng Hươu Đen" },  // vàng-đen
  tyrell:     { base: "#3f7a3f", light: "#6fae6f", label: "Xanh Hồng Vàng" }, // xanh lá
  martell:    { base: "#c56a1c", light: "#e5964a", label: "Cam Nắng Dorne" }, // cam
  greyjoy:    { base: "#3a4d55", light: "#61818d", label: "Xám Biển Kraken" },// xám-lam đậm
  arryn:      { base: "#4a6fa5", light: "#7c9fd4", label: "Lam Trời Ưng" },   // xanh dương
  tully:      { base: "#5a7a8c", light: "#89aec1", label: "Lam Bạc Cá Hồi" }, // xanh-bạc
  bolton:     { base: "#7a5a5a", light: "#a88585", label: "Hồng Máu Da" },    // (chư hầu, hồng nhạt tàn khốc)
  frey:       { base: "#7a7a5a", light: "#a8a885", label: "Xám Xanh Tháp" },
  // ... thêm Nhà nhỏ tuỳ Era
  "vô-chủ":   { base: "#4a4a4a", light: "#707070", label: "Vô Chủ / Tranh Chấp" },
};
```
Chế độ Quan Hệ (9.5.2) dùng bảng màu heatmap riêng (xanh→đỏ) đè lên, không dùng màu Nhà.

---

### 9.6 Bản đồ đúng tiểu thuyết + để bạn tùy biến ("đúng với truyện và với tôi")

Bạn nhấn mạnh bản đồ phải **đúng canon ASOIAF** và **theo ý bạn**. Hai việc tách bạch: (a) dữ liệu địa lý chuẩn tiểu thuyết làm nền, (b) cơ chế để bạn thay ảnh/màu/vùng theo ý.

#### 9.6.1 Địa lý chuẩn Westeros — 9 vùng + trọng trấn (seed data)

Seed sẵn **chín vùng chính của Westeros** đúng canon, mỗi vùng gắn Nhà cai trị mặc định + trọng trấn (castle chính), làm nền để app chạy đúng truyện ngay. Lưu `content/westeros/regions.ts`:

| Vùng (regionId) | Tên Việt | Nhà cai trị (mặc định, 298 AC) | Trọng trấn | Địa hình chủ đạo (nối 7.6) |
|---|---|---|---|---|
| the-north | Phương Bắc | Stark | Winterfell | Đồng Bằng lạnh, Rừng, Tuyết |
| the-vale | Thung Lũng Arryn | Arryn | The Eyrie | Vùng Núi, Hẻm Núi |
| the-riverlands | Vùng Sông | Tully | Riverrun | Đồng Bằng, Sông ngòi |
| the-westerlands | Vùng Tây | Lannister | Casterly Rock | Đồi Núi, mỏ quặng |
| the-crownlands | Đất Vương Thất | Targaryen→Baratheon | King's Landing | Đồng Bằng ven biển |
| the-reach | Reach | Tyrell | Highgarden | Đồng Bằng phì nhiêu (vựa lúa) |
| the-stormlands | Vùng Bão | Baratheon | Storm's End | Rừng, ven biển bão tố |
| dorne | Dorne | Martell | Sunspear | Sa Mạc, núi khô |
| the-iron-islands | Quần Đảo Sắt | Greyjoy | Pyke | Đảo đá, biển |

Ngoài Westeros, seed thêm mốc **Essos** (Braavos, Pentos, Volantis, Vaes Dothrak, Slaver's Bay, Valyria đổ nát...) cho các tuyến Dany/Essos, tùy Era.

**Gate theo Era (đúng từng thời kỳ):** danh sách Nhà cai trị mỗi vùng **khác nhau theo Era** — đây là điểm "đúng tiểu thuyết":
- **Chinh Phạt Aegon:** chưa có "Đất Vương Thất"/King's Landing (Aegon mới đổ bộ, đang xây); mỗi vùng là một vương quốc độc lập với Vua riêng (Vua Phương Bắc Stark, Vua Đá Lannister, Vua Bão Durrandon, Gardener ở Reach thay vì Tyrell...). Targaryen chưa kiểm soát vùng nào trên bộ.
- **Loạn Robert:** Crownlands còn của Targaryen (Aerys II); cuối cuộc chiến chuyển sang Baratheon.
- **Chiến Tranh Ngũ Vương:** bảng mặc định ở trên, nhưng chủ quyền **biến động mạnh** trong lúc chơi (Nhà Bolton chiếm Phương Bắc, Nhà Greyjoy đánh chiếm...).
Mỗi `EraData` (8.2) khai báo `regionControl: Record<regionId, houseId>` riêng, engine nạp lúc initvar. Nhà cai trị mặc định KHÔNG hard-code — đọc từ Era.

#### 9.6.2 Kiến trúc "cắm ảnh + chỉnh vùng của bạn là chạy"

Để **theo ý bạn** mà không đụng code engine (nối 9.1 "cắm ảnh vào là chạy"):

1. **Ảnh nền bạn tự cung cấp:** đặt ảnh bản đồ Westeros bạn chọn vào `content/westeros/assets/map.(webp|png)`, khai kích thước gốc trong `mapConfig.ts`. Mọi toạ độ tính theo px ảnh này. Đổi ảnh khác chỉ cần thay file + cập nhật config, không sửa code. (Nhắc lại ràng buộc 9.1: dùng ảnh bạn có quyền dùng, không lấy tile quartermaester/Google Maps.)

2. **Vẽ vùng bằng công cụ, không gõ toạ độ tay:** toạ độ polygon 9 vùng nhập qua một **map editor nội bộ** (dev tool) — bật chế độ vẽ, click quanh viền vùng trên ảnh, xuất ra `polygonPx[]` dán vào `regions.ts`. Đỡ phải đoán toạ độ. Placeholder SVG chạy trước khi có ảnh thật (9.1).

3. **Bạn chỉnh được mọi thứ qua data file, tách khỏi engine:**
   - `regions.ts` — thêm/sửa/xoá vùng, đổi viền, đổi vùng thuộc Era nào.
   - `houseColors.ts` — đổi màu mỗi Nhà theo gu của bạn.
   - `markers.ts` — thêm lâu đài/thành phố/địa danh riêng, đặt vị trí trên ảnh, gắn deep-link wiki.
   - `eras/<era>/regionControl.ts` — ai cai trị vùng nào ở mỗi thời kỳ.
   Engine chỉ đọc các file này; sửa chúng = đổi bản đồ, **không** chạm logic. Đúng tinh thần "đúng với tôi" — bạn kiểm soát toàn bộ nội dung địa lý.

4. **Vùng do người chơi tự tạo (sandbox):** ở Era "Tự Do/Sandbox" (8.2), người chơi/AI có thể tạo vùng-lãnh-thổ mới không có trong canon (một lãnh địa tự đặt tên) — lưu vào `Chủ Quyền Lãnh Thổ` như record động, hiện marker/vùng tạm trên bản đồ. Cho tự do worldbuild ngoài khuôn khổ chính sử.

#### 9.6.3 Nối bản đồ với phần còn lại

- **Chiếm đất từ chiến tranh:** vây thành thắng (12.2) → đổi `Nhà Kiểm Soát` vùng → bản đồ đổi màu (9.5.1). Vòng khép: đánh trên bản đồ → thắng → bản đồ đổi màu → lãnh thổ mới mở kinh tế/quân (10/11/15).
- **Ngoại giao đổi màu:** hôn nhân/liên minh (13.4) đổi `Thái Độ Các Nhà` → chế độ Quan Hệ (9.5.2) đổi màu vùng tương ứng.
- **Vị trí & di chuyển:** marker nhân vật + đường hành quân (9.3) đọc `Thế Giới.Vị Trí` + đơn vị quân (11.4).
- **Tình báo & fog (9.3):** vùng chưa có tình báo (14.1) hiện màu chủ quyền mờ/dấu hỏi ở chế độ Chính Trị — do thám tốt mới thấy rõ ai kiểm soát + Thái Độ thật (nối sương mù tình báo 7.5).

---

## 10. Lãnh địa & Công trình (Territory & Construction)

### 10.1 Mô hình dữ liệu
Mở rộng `StatDataSchema` (mục 5) bằng field `z.record()` mới, đúng pattern đã thiết lập:
```ts
const BuildingSchema = z.object({
  "Loại": z.enum(["Lâu Đài", "Nông Trại", "Chợ", "Doanh Trại", "Tường Thành", "Bến Cảng", "Sept/Rừng Thần", "Học Viện Nhỏ"]),
  "Cấp Độ": z.coerce.number().int().min(1).prefault(1),
  "Đang Xây": z.boolean().prefault(false),
  "Turn Còn Lại": z.coerce.number().int().min(0).prefault(0),
});

const TerritorySchema = z.object({
  // KHÔNG lưu "Nhà Kiểm Soát" ở đây — ai nắm vùng là NGUỒN CHÂN LÝ DUY NHẤT ở
  // "Chủ Quyền Lãnh Thổ" (9.5.1). TerritorySchema chỉ giữ CHI TIẾT NỘI BỘ của vùng.
  // Khi cần biết chủ, đọc stat_data."Chủ Quyền Lãnh Thổ"[territoryId]."Nhà Kiểm Soát".
  "Dân Số": z.coerce.number().min(0).prefault(1000),
  "Trung Thành": clampedStat(0, 100, 60),
  "Tài Nguyên": z.object({
    "Vàng": z.coerce.number().min(0).prefault(0),
    "Lương Thực": z.coerce.number().min(0).prefault(0),
    "Gỗ": z.coerce.number().min(0).prefault(0),
    "Đá": z.coerce.number().min(0).prefault(0),
  }).prefault({}),
  "Công Trình": z.record(safeString().describe("Tên công trình"), BuildingSchema).prefault({}),
});
// trong StatDataSchema: "Lãnh Địa": z.record(safeString().describe("Tên lãnh địa, khớp MapRegion.id"), TerritorySchema).prefault({})
```
> **Phân vai (tránh trùng lặp — sửa từ rà soát):** hai khối bổ sung nhau, KHÔNG chồng chéo. `Chủ Quyền Lãnh Thổ` (9.5.1) = **ai nắm vùng nào** — phủ MỌI vùng (kể cả của địch/vô chủ), phục vụ bản đồ + chiến tranh, là nguồn chân lý duy nhất về quyền sở hữu. `Lãnh Địa` (10.1) = **chi tiết nội bộ** (công trình, tài nguyên, dân số, lòng trung) chỉ cho các vùng người chơi thực sự quản lý. Khi chiếm vùng: engine đổi `Chủ Quyền Lãnh Thổ.<vùng>.Nhà Kiểm Soát` (bản đồ đổi màu, 9.5.1) VÀ tạo/chuyển entry `Lãnh Địa.<vùng>` nếu vùng đó về tay người chơi (mở quản trị nội bộ). Mất vùng: xoá/đóng băng entry `Lãnh Địa` tương ứng. Không bao giờ lưu "chủ vùng" ở hai nơi.

### 10.2 Danh mục công trình khởi điểm
| Công trình | Hiệu ứng chính | Ghi chú |
|---|---|---|
| Lâu Đài | +phòng thủ, +giới hạn quân đồn trú | bắt buộc có ở thủ phủ |
| Nông Trại | +Lương Thực/turn | |
| Chợ | +Vàng/turn | |
| Doanh Trại | mở khả năng tuyển quân (mục 11), +tốc độ tuyển | |
| Tường Thành | +phòng thủ khi bị vây (mục 12) | |
| Bến Cảng | +hạm đội, +giao thương | chỉ lãnh địa ven biển |
| Sept/Rừng Thần | +Trung Thành theo tôn giáo | tuỳ tôn giáo vùng (Thất Diện Thần/Cựu Thần) |
| Học Viện Nhỏ | +hiệu quả quản lý (giảm turn xây, +tình báo) | hiếm, chỉ lãnh địa lớn |

Danh mục này là khung tối thiểu — mở rộng thêm loại công trình mới chỉ cần thêm enum value + entry trong bảng hiệu ứng, không cần đổi cấu trúc schema.

### 10.3 Cơ chế xây dựng (pseudocode)
```
startConstruction(territoryId, buildingType):
  territory = state.stat_data.Lãnh Địa[territoryId]
  cost = buildingCostTable[buildingType][nextLevel]
  if territory.Tài Nguyên không đủ cost: return error
  trừ tài nguyên ngay
  territory.Công Trình[buildingName] = { Loại: buildingType, Đang Xây: true, Turn Còn Lại: buildTimeTable[buildingType] }

onTurnAdvance():  // gọi mỗi khi diễn biến AI kể làm 1 ngày/turn trôi qua (mục 6.2) — KHÔNG phải mỗi tin nhắn; điểm nối chung với mục 11-12, 15, 17
  for each territory in state.stat_data.Lãnh Địa:
    for each building in territory.Công Trình:
      if building.Đang Xây:
        building.Turn Còn Lại -= 1
        if building.Turn Còn Lại <= 0: building.Đang Xây = false
    thu = sum(income theo công trình đã xây xong)
    chi = sum(chi phí duy trì quân đồn trú tại lãnh địa này)
    territory.Tài Nguyên.Vàng += thu.Vàng - chi.Vàng
    territory.Tài Nguyên.Lương Thực += thu.Lương Thực - chi.Lương Thực
```
- UI: panel lãnh địa (mở từ bản đồ mục 9.4) có tab **Tổng Quan** / **Xây Dựng** (danh sách công trình khả dụng, nút xây, hàng đợi đang xây kèm progress bar) / **Đồn Trú** (liên kết mục 11).
- AI vẫn có thể **tường thuật** diễn biến xây dựng (thợ xây, sự kiện trong lúc thi công...) nhưng **không tự quyết định số turn/chi phí** — engine giữ số theo nguyên tắc xuyên suốt ở mục 5/7.

### 10.4 UI Lãnh Địa (Territory Panel) — chi tiết

Tham khảo trực tiếp cấu trúc panel lãnh địa của card **"Đại Lãnh Chúa"** (đã có hệ thống hoàn chỉnh: hồ sơ lãnh chúa, thanh trạng thái lãnh địa nhiều lớp, bản đồ build với con trỏ toạ độ, quản lý công trình/tài nguyên/quân sự). Học **cách tổ chức thông tin và luồng thao tác** của nó, nhưng **thay toàn bộ phần nhìn** bằng ngôn ngữ thiết kế mới (glassmorphism, SVG, màu ít bão hoà, không emoji — 4 ràng buộc đầu prompt). Card gốc dùng emoji + màu gắt; bản của ta phải sang trọng, điện ảnh hơn hẳn.

Mở từ: bấm icon Lãnh Địa (SVG) ở left rail/bottom nav (mục 6.1), hoặc click vùng trên bản đồ (mục 9.4), hoặc shortcut RealmPanel. Nếu có nhiều lãnh địa → dropdown/tab chọn lãnh địa ở đầu panel.

**Khung thị giác chung:** panel là 1 tấm kính mờ (glass card) nổi trên lớp nền gradient trầm; tiêu đề và chỉ số bố cục như poster — nhiều khoảng thở, phân cấp rõ. Mọi icon chỉ số (dân số, lòng dân, vàng, lương thực, gỗ, đá, quặng, trang bị...) là **SVG line-art mảnh tự vẽ**, đồng bộ 1 bộ.

**Header lãnh địa:** tên lãnh địa (typography lớn, trang trọng) + huy hiệu Nhà kiểm soát (SVG cách điệu), phù hiệu loại địa hình. 3 chỉ số cốt lõi luôn hiện dạng "viên ngọc" kính mờ: Dân Số, Lòng Dân (thanh bar gradient dịu), Vàng tồn kho.

**Tab Tổng Quan (Trạng thái lãnh địa):** lấy trọn bộ chỉ số kiểu card Đại Lãnh Chúa, nhóm gọn thành các khối kính:
- *Khối Lãnh thổ:* Diện tích, Đặc trưng địa hình (ảnh hưởng chiến đấu mục 7.6), Toạ độ trên bản đồ.
- *Khối Dân sinh:* Lòng Dân (%) + thanh bar, Sự kiện cộng đồng đang diễn ra (nối sự kiện mục 17.1).
- *Khối Kinh tế:* Vàng trong kho + **±/turn** (xanh dịu nếu dương, đỏ trầm nếu âm), Đánh giá kinh tế (hạng), và 4 tài nguyên sản xuất: Lương Thực, Gỗ, Đá, Quặng Sắt — mỗi cái số dư + xu hướng/turn. Thêm Tài sản quý hiếm nếu có.
- *Khối Quân sự:* Trang bị (chất lượng), Xếp hạng chiến lực quân đội đồn trú, Sức chứa quân (hiện tại/tối đa).
- Cảnh báo nổi bật (banner kính đỏ trầm) nếu: sắp hết Lương Thực (còn X turn tới nạn đói), Lòng Dân thấp (nguy cơ nổi loạn mục 15.4), đang bị vây (mục 12.2).

**Tab Xây Dựng:** đây là nơi card Đại Lãnh Chúa làm mạnh nhất — **xây trực tiếp trên bản đồ với con trỏ toạ độ**. Áp dụng tương tự:
- Vào "chế độ xây" → bản đồ (mục 9) hiện lưới + con trỏ chọn ô đất; panel bên hiện: tên công trình (nhập), loại (chọn), cấp/tier, chi phí tài nguyên (**tô đỏ tài nguyên không đủ**), thời gian xây (số turn), báo cáo địa hình ô đang chọn (địa hình ảnh hưởng loại công trình xây được).
- Lưới thẻ công trình khả dụng (thẻ kính): icon SVG, tên, chi phí, thời gian, hiệu ứng tóm tắt ("+5 Lương Thực/turn"). Thẻ khoá (chưa đủ điều kiện, vd Bến Cảng ở lãnh địa không giáp biển) hiện mờ + lý do khi hover.
- Nút **Nâng cấp** công trình đã có (cấp hiện tại → cấp kế + chi phí + thời gian).
- **Hàng đợi xây dựng:** danh sách đang xây, mỗi cái progress bar theo turn + thông tin nhân công + nút huỷ (hoàn 1 phần tài nguyên). Xếp hàng nhiều công trình được.
- Ngoài công trình, hỗ trợ **xây tuyến đường** giữa các điểm (card gốc có `build-path-*`): nối lãnh địa/cải thiện di chuyển quân (mục 11.4) và tuyến thương mại (mục 15.2).
- Xác nhận → trừ tài nguyên ngay + toast trầm "Khởi công [tên], hoàn tất sau N turn".

**Tab Đồn Trú (quân sự tại lãnh địa này):**
- Danh sách đơn vị đang đóng (liên kết mục 11): số lượng, loại quân, tình trạng (Sĩ Khí/Hậu Cần...).
- Nút **Tuyển Quân** (chỉ bật nếu có Doanh Trại) → modal chọn loại quân + số lượng, hiện chi phí + thời gian huấn luyện.
- Nút **Điều Quân** → chuyển sang bản đồ (mục 9/11.5) chọn đích.

**Tab Dân Tình (roleplay hook):**
- Tường thuật ngắn tình hình dân chúng (AI sinh theo Lòng Dân + sự kiện gần đây), 1-2 **thỉnh nguyện đang chờ** (tranh chấp đất, xin giảm thuế, tố cáo tham nhũng) — mỗi cái là lựa chọn nhỏ áp patch vào Lòng Dân/Vàng, biến quản lý khô khan thành tình huống nhập vai. Nơi gắn sự kiện lãnh địa (mục 17.1) vào UI.

**Hồ sơ Lãnh Chúa (Lord Profile):** card gốc có modal hồ sơ lãnh chúa riêng (ngoại hình, danh tính, cấp/EXP, HP, trang phục, lore cá nhân, kỹ năng) — tích hợp thành 1 modal kính mờ mở từ header, hoặc gộp vào Status Panel nhân vật (mục 6) để tránh trùng lặp. Chọn cách gộp nếu thông tin đã có ở mục 6, tránh 2 nơi hiển thị cùng dữ liệu.

**Mobile:** panel full-screen, tab thành thanh ngang cuộn được; thao tác xây/tuyển qua bottom-sheet kính mờ; chế độ xây trên bản đồ dùng chạm để đặt con trỏ ô đất.

---

## 11. Quân đội — Tuyển quân & Di chuyển

### 11.1 Mở rộng schema đơn vị quân (từ mục 7.4)
```ts
// bổ sung vào MilitaryUnitSchema đã có ở mục 7.4:
"Loại Quân": TroopTypeSchema.prefault("Bộ Binh"),   // danh mục đầy đủ (thường + đặc biệt + siêu nhiên) ở mục 11.2b, gated theo Era
"Thành Phần": z.record(safeString().describe("Loại quân"), z.coerce.number().min(0).max(1))
              .prefault({}),                          // tỷ lệ binh chủng hỗn hợp, vd {"Bộ Binh":0.6,"Kỵ Binh":0.4} — dùng cho ma trận 7.9.2b; rỗng = thuần "Loại Quân"
"Lãnh Địa Đồn Trú": safeString(),               // territoryId, liên kết mục 10
"Đang Di Chuyển Đến": safeString().optional(),  // territoryId đích, rỗng nếu đứng yên
"Turn Di Chuyển Còn Lại": z.coerce.number().int().min(0).prefault(0),
```
> `TroopTypeSchema` định nghĩa ở mục 11.2b (danh mục đầy đủ, thay cho enum 4 loại ở bản nháp đầu). Một đơn vị có thể là binh chủng thuần (`Thành Phần` rỗng, dùng `Loại Quân`) hoặc **hỗn hợp** (điền `Thành Phần` theo %); engine phán định (7.9.2b) đọc `Thành Phần` để tính `ưuKhuyếtBinhChủng`.

### 11.2 Tương khắc giữa các loại quân
Kỵ Binh khắc Cung Thủ → Cung Thủ khắc Bộ Binh → Bộ Binh khắc Kỵ Binh (pattern kéo/búa/bao, dễ cân bằng và dễ AI tường thuật đúng); Công Thành không tham gia tương khắc — chỉ hiệu quả cao khi phá Tường Thành lúc vây thành (mục 12.2), yếu khi giao chiến ngoài đồng trống. Hệ số tương khắc (vd ±20% sát thương) áp vào công thức combat mục 7.2 khi 2 loại quân đối đầu.

### 11.2b Danh mục binh chủng — Thường & Đặc biệt (đa Thời Kỳ ASOIAF)

Mục 11.1 mới liệt kê 4 loại cơ bản. Vì app trải **nhiều Thời Kỳ** (Chinh Phạt Aegon → Vũ Điệu Rồng → Loạn Robert → Chiến Tranh Ngũ Vương → Trường Dạ), danh mục binh chủng cần rộng hơn và **gated theo Era + theo Nhà/vùng** (không phải mọi binh chủng đều tồn tại ở mọi thời). Mở rộng enum:

```ts
// engine/content/troopTypes.ts — thay cho enum 4 loại ở 11.1
const TroopTypeSchema = z.enum([
  // ── BINH CHỦNG THƯỜNG (mọi Era) ──
  "Bộ Binh",          // lính bộ tiêu chuẩn, kiếm/rìu/khiên
  "Trường Thương",    // phalanx giáo dài, khắc kỵ (Tyrell/Reach mạnh khoản này)
  "Kỵ Binh",          // kỵ binh nặng, hiệp sĩ có giáp (Reach/Westerlands/Crownlands)
  "Kỵ Binh Nhẹ",      // trinh sát, đột kích, truy đuổi
  "Cung Thủ",         // cung dài/nỏ, hoả lực tầm xa (Dorne giỏi)
  "Công Thành",       // máy bắn đá, tháp công thành, phá tường (mục 12.2)

  // ── BINH CHỦNG ĐẶC BIỆT THEO VÙNG/NHÀ (gated) ──
  "Kỵ Sĩ Dothraki",   // kỵ cung thảo nguyên — Essos, cực mạnh Đồng Bằng, vô dụng công thành/vượt biển
  "Unsullied",        // bộ binh nô lệ thái giám — kỷ luật tuyệt đối, miễn nhiễm sợ hãi, đội hình giáo bất hoại
  "Người Sắt (Ironborn)", // Greyjoy — cướp biển, mạnh đổ bộ/áp mạn (7.8), yếu chiến trường lớn trên bộ
  "Bọn Man Tộc (Free Folk)", // dân Ngoài Tường — chiến binh du kích, đông nhưng vô tổ chức, giỏi tuyết/rừng
  "Dân Sơn Cước (Vale Mountain Clans)", // cướp núi Arryn — phục kích Hẻm Núi
  "Lính Đánh Thuê",   // Golden Company, Second Sons... — chất lượng cao nhưng "Trung Thành" theo Vàng (dễ đổi phe)
  "Nồi Đất (Braavosi)", // Water Dancer / lính Braavos — kiếm sĩ tinh xảo 1v1

  // ── BINH CHỦNG SIÊU NHIÊN (chỉ Era bật — nối 7.15) ──
  "Rồng",             // Targaryen — hệ số phi đối xứng, đốt tường thành (Chinh Phạt/Vũ Điệu Rồng)
  "Voi Chiến",        // Golden Company (hậu Vũ Điệu) — ngựa sợ voi, phá đội hình
  "Người Chết (Wight)", // đội quân White Walker — material-gate, tự bổ sung bằng tử sĩ (Trường Dạ)
  "Others (White Walker)", // chỉ obsidian/Valyrian diệt được
]);
```

**Bảng tra binh chủng đặc biệt** (lưu `content/westeros/specialTroops.ts`) — mỗi dòng: Era khả dụng, Nhà/vùng sở hữu, sở trường, khắc tinh, rule Lớp 4:

| Binh chủng | Era / khả dụng | Ai sở hữu | Sở trường | Nhược điểm | Rule đặc biệt (Lớp 4) |
|---|---|---|---|---|---|
| Kỵ Sĩ Dothraki | Mọi Era có Essos | Khal Dothraki, Daenerys (giữa AGOT) | Đồng Bằng cực mạnh (kỵ cung), cơ động | Vô dụng công thành, sợ vượt biển ("nước độc"), kỷ luật kém | +0.15 trên Đồng Bằng; −0.2 khi Vây Thành; không thể lên thuyền nếu chưa "thuần" |
| Unsullied | AGOT trở đi (Dany mua ở Astapor) | Daenerys | Đội hình giáo bất hoại, **miễn nhiễm sợ hãi** (sĩ khí không sụp) | Số lượng ít, không kỵ binh, chậm | Sĩ khí luôn coi như "Ổn Định" tối thiểu; +0.1 khi thủ đội hình |
| Người Sắt | Mọi Era | Greyjoy | Đổ bộ/cướp biển (+7.8 hải chiến), áp mạn thuyền | Yếu trận bộ quy mô lớn, ít kỵ binh | +0.2 khi đổ bộ tấn công lãnh địa ven biển; −0.1 trận bộ trong đất liền |
| Bọn Man Tộc | Mọi Era (Ngoài Tường Thành) | Free Folk, Mance Rayder | Du kích, giỏi Tuyết/Rừng, đông | Vô tổ chức (huấn luyện thấp), thiếu giáp/vũ khí tốt | +0.15 địa hình Tuyết/Rừng; huấn luyện trần tối đa "Mới Lập Đội" trừ khi có thủ lĩnh giỏi |
| Dân Sơn Cước Vale | Mọi Era | Các bộ tộc núi Arryn | Phục kích Hẻm Núi/Vùng Núi | Không đánh trận chính diện, dễ tan | +0.25 phục kích ở Hẻm Núi (kiểu Bloody Gate); vô dụng Đồng Bằng |
| Lính Đánh Thuê | Mọi Era | Ai trả Vàng (Golden Company, Second Sons, Brave Companions) | Chất lượng cao, thiện chiến, linh hoạt | **Trung Thành theo Vàng** — hết tiền/thua thế dễ đổi phe | Mỗi turn không trả lương → roll đổi phe (nối 7.7 Phản Trắc); +0.1 chất lượng nền |
| Water Dancer Braavos | Mọi Era | Braavos, kiếm sĩ được thuê | Đấu tay đôi (7.1/7.14) xuất sắc | Không phải quân đội lớn — chủ yếu cá nhân/vệ sĩ | +0.15 trong Giao Tranh (7.13) & duel; không cấu thành đại quân |
| Voi Chiến | **Hậu Vũ Điệu Rồng trở đi** (Golden Company mang về) | Golden Company | **Ngựa sợ voi** — phá kỵ binh & đội hình | Chậm, tốn hậu cần, hoảng nếu trúng hoả công | +0.12 khi địch chủ yếu Kỵ Binh; −0.15 nếu địch dùng hoả công/Cung hoả tiễn |
| Rồng | **Chinh Phạt Aegon, Vũ Điệu Rồng** (tuyệt chủng sau); tái xuất cuối AGOT (Dany) | Targaryen | Hệ số phi đối xứng, **đốt cổng thành** (bỏ qua tường) | Hiếm, cần bond kỵ sĩ, có thể bị scorpion/rồng khác hạ | Xem 7.15 — nhân hệ số lớn vào chiến lực; rồng-đối-rồng seed roll |
| Người Chết / Others | **Trường Dạ / Beyond the Wall** (Era bật) | Night King | Quân số vô hạn (tự bổ sung tử sĩ), không sĩ khí | **Material-gate**: chỉ lửa (wight) / obsidian-Valyrian (Walker) diệt | Xem 7.15 — chiến lực thường vô nghĩa nếu thiếu vật liệu đúng |

**Gating theo Era (quan trọng — vì làm nhiều thời kỳ):** mỗi `EraData` (mục 8.2) khai báo `availableTroops: TroopTypeSchema[]`. Engine + AI chỉ cho phép tuyển/gặp binh chủng thuộc Era đó:
- **Chinh Phạt Aegon (~2 BC–1 AC):** có Rồng (Balerion/Vhagar/Meraxes), chưa có Voi Chiến, chưa có Golden Company; 7 vương quốc còn riêng rẽ mỗi vùng quân riêng.
- **Vũ Điệu Rồng (129–131 AC):** nhiều Rồng nhất (nội chiến Targaryen), chưa Voi.
- **Loạn Robert (282–283 AC):** KHÔNG còn Rồng (đã tuyệt chủng), quân thường + đặc biệt vùng miền; Golden Company + Voi đã tồn tại ở Essos.
- **Chiến Tranh Ngũ Vương (298–300 AC):** quân thường + Người Sắt + Man Tộc + Dothraki (Dany ở Essos) + Unsullied (cuối AGOT); Rồng vừa tái sinh (3 con non của Dany, chưa chiến đấu được).
- **Trường Dạ / Beyond the Wall:** bật Người Chết/Others + material-gate.

Enum `Nhà` ở mục 5.1 cũng nên **gate theo Era** tương tự (Chinh Phạt Aegon chưa có khái niệm "Warden"/"7 Vương Quốc thống nhất dưới 1 Vua"; một số Nhà chưa tồn tại hoặc chưa nắm quyền). Khai báo `availableHouses` trong `EraData` như mục 8.5 đã nêu — engine lọc danh sách theo Era đang chơi, không hard-code một danh sách phẳng.


### 11.3 Tuyển quân
- Chỉ tuyển được tại lãnh địa có Doanh Trại (mục 10.2); số lượng tối đa/turn giới hạn theo Dân Số lãnh địa + cấp Doanh Trại.
- Chi phí: Vàng + Lương Thực theo loại quân; có thời gian huấn luyện vài turn trước khi sẵn sàng chiến đấu (không xuất hiện tức thì).

### 11.4 Di chuyển trên bản đồ
```
moveArmy(unitId, targetTerritoryId):
  distance = calcMapDistance(currentTerritoryId, targetTerritoryId) // theo toạ độ px mục 9.2, quy đổi ra số turn
  unit."Đang Di Chuyển Đến" = targetTerritoryId
  unit."Turn Di Chuyển Còn Lại" = distance

onTurnAdvance(): // nối tiếp mục 10.3
  for each unit đang di chuyển:
    unit.Turn Di Chuyển Còn Lại -= 1
    if <= 0: unit.Lãnh Địa Đồn Trú = unit.Đang Di Chuyển Đến; clear "Đang Di Chuyển Đến"
    cập nhật vị trí marker quân trên bản đồ (mục 9.3) theo % tiến trình di chuyển
```

### 11.5 UI Quân Sự ([icon:quân-sự]) & điều quân trên bản đồ
Mở từ icon [icon:quân-sự] (left rail/bottom nav) hoặc bản đồ.

**Bảng Quân Đội (danh sách lực lượng):**
- Thẻ mỗi đơn vị: tên, loại quân (icon), số lượng (thanh so với sức chứa), tướng chỉ huy (avatar + tên), vị trí hiện tại / đang hành quân đến đâu (kèm % + turn còn lại), 4 chỉ số tình trạng (Sĩ Khí/Hậu Cần/Trang Bị/Huấn Luyện) dạng badge màu.
- Nhóm theo mặt trận/vùng để dễ nhìn khi có nhiều quân.
- Nút gộp/tách đơn vị, đổi tướng chỉ huy (chọn từ Tướng Lĩnh mục 7.7).

**Điều quân (trực tiếp trên bản đồ — mục 9):**
- Bấm 1 đơn vị → bản đồ highlight các đích đến hợp lệ; kéo/bấm tới territory đích → vẽ **đường hành quân** (line có mũi tên) + hiện preview: số turn tới nơi, cảnh báo nếu đi qua lãnh thổ địch.
- Marker quân di chuyển dọc đường theo % mỗi turn (mục 9.3); chạm quân địch giữa đường → trigger giao chiến (mục 7).
- **Panel so sánh lực lượng** khi 2 quân sắp đụng: hiện Effective Power ước tính 2 phe (mục 7.5), địa hình nơi giao chiến + hệ số của nó, cho người chơi chọn **"Tự chỉ huy"** (vào combat chiến thuật turn-based 7.1) hay **"Giao cho tướng"** (auto-resolve 7.5). Đây là quyết định chiến thuật thú vị: trận nhỏ giao cho tướng cho nhanh, trận sống còn thì tự cầm quân.

### 11.6 UI Chiến trường (khi tự chỉ huy 1 trận)
- Bố cục 2 phe đối diện: thanh HP tổng mỗi bên, hàng đơn vị mỗi phe (icon + số lượng còn lại).
- **Combat log dạng feed** cuộn được — mỗi dòng 1 hành động, có thể bấm expand xem chi tiết roll (d20, hệ số áp dụng) cho người thích minh bạch số, gọn gàng cho người chỉ muốn xem kết quả.
- Action Deck chiến đấu: Tấn công / Phòng thủ / Kỹ năng tướng / Rút lui / (dùng địa hình nếu có). Mỗi lựa chọn cũng chèn được câu mô tả để AI tường thuật màu mè.
- Kết thúc → màn hình tổng kết (thẻ `<battle_report>` mục 5.6): thắng/thua, thương vong 2 phe, tướng bị bắt/tử, chiến lợi phẩm, thay đổi War Score — rồi trở lại chat với đoạn AI kể hậu quả.

---

## 12. Chiến tranh chiến lược (mở rộng mục 7)

Mục 7 xử lý **1 trận đánh cụ thể** (1v1/skirmish/đại chiến quy mô). Mục này là **lớp chiến lược bao ngoài** — quyết định khi nào 1 trận đánh xảy ra và hệ quả lãnh thổ sau đó.

### 12.1 Tuyên chiến & War Score
```ts
"Quan Hệ Ngoại Giao": z.record(safeString().describe("Tên Nhà đối phương"), z.object({
  "Trạng Thái": z.enum(["Hoà Bình", "Chiến Tranh", "Đình Chiến"]).prefault("Hoà Bình"),
  "War Score": z.coerce.number().min(-100).max(100).prefault(0), // dương = đang thắng thế
})).prefault({})
```
> **Phân vai với `Thái Độ Các Nhà` (tránh nhầm — hai khối KHÁC nhau):** `Thái Độ Các Nhà` (5.1) = **tình cảm/lập trường** một Nhà dành cho người chơi (Tín Nhiệm→Thù Địch, đổi theo hành động ngoại giao, quyết màu bản đồ 9.5.2). `Quan Hệ Ngoại Giao` (đây) = **tình trạng pháp lý chiến sự** (đang hoà/chiến/đình chiến + War Score). Một Nhà có thể "Thù Địch" (ghét) mà vẫn "Hoà Bình" (chưa tuyên chiến), hoặc "Cảnh Giác" mà đang "Chiến Tranh". Hai trục độc lập, bổ sung nhau. Tuyên chiến đổi `Quan Hệ Ngoại Giao.Trạng Thái`; các hành vi trong/sau chiến (tàn bạo, tha tù binh) đổi `Thái Độ Các Nhà`.

Mỗi trận thắng/thua (mục 7) hoặc lãnh địa đổi chủ (mục 10/12.2) cộng/trừ War Score. Đạt ngưỡng (vd |War Score| ≥ 70) → AI được nhắc gợi ý đàm phán hoà trong lời tường thuật, người chơi vẫn toàn quyền quyết định tiếp tục hay dừng.

### 12.2 Vây thành (Siege)
```
startSiege(attackingUnitId, targetTerritoryId):
  // vùng địch bị vây có thể KHÔNG có entry trong "Lãnh Địa" (chỉ vùng người chơi quản lý mới có, xem 10.1);
  // nên trạng thái vây lưu trong "Chủ Quyền Lãnh Thổ" (phủ MỌI vùng) — đổi Tình Trạng = "Bị Vây"
  ownership = state.stat_data."Chủ Quyền Lãnh Thổ"[targetTerritoryId]
  ownership."Tình Trạng" = "Bị Vây"
  ownership._siegeState = { attacker: attackingUnitId, turnsElapsed: 0, foodLeft: ước lượng lương thủ }

onTurnAdvance(): // nối tiếp 10.3 & 11.4
  for each vùng có Tình Trạng == "Bị Vây":
    ownership._siegeState.turnsElapsed += 1
    ownership._siegeState.foodLeft -= siegeFoodDrain   // nếu vùng là của người chơi (có entry Lãnh Địa), trừ thẳng Lãnh Địa.Tài Nguyên.Lương Thực + Trung Thành
    if có viện binh đối phương đến cùng lãnh địa: resolveRelief() // chạy combat mục 7 (dùng Battle Resolver 7.9), thắng thì phá vây, đặt lại Tình Trạng
    if foodLeft <= 0 or turnsElapsed >= maxSiegeTurns:
      resolveSiegeFall() // đổi "Chủ Quyền Lãnh Thổ.<vùng>.Nhà Kiểm Soát" = phe vây (9.5.1 → bản đồ đổi màu),
                         // set Tình Trạng "Mới Chiếm"; nếu về tay người chơi → tạo entry "Lãnh Địa.<vùng>" (mở quản trị);
                         // có thể cho người chơi chọn "đánh trận cuối" (combat mục 7) thay vì auto-resolve
```
UI: khi 1 lãnh địa đang bị vây, hiện badge cảnh báo trên bản đồ (mục 9) + trong panel lãnh địa (mục 10), đếm ngược turn còn lại trước khi thất thủ nếu không có viện binh; diễn biến tường thuật qua thẻ `<siege_update>` (mục 5.6).

### 12.3 Liên minh & phản bội
Tái dùng `"Thái Độ Các Nhà"` đã có ở mục 5.1 — Thái Độ càng cao (Tín Nhiệm/Ủng Hộ) càng dễ xin viện binh/liên minh khi tuyên chiến; Thái Độ thấp (Địch Ý/Thù Địch) có rủi ro bị đâm sau lưng khi đang giao chiến với phe thứ 3. Đây là chỗ hợp lý để **để AI tự sáng tạo trong khung dữ liệu có sẵn** thay vì mọi thứ đều cần công thức cứng — engine chỉ giữ field, không cần tính riêng xác suất phản bội.

---

## 13. Cung đình (Royal Court)

### 13.1 Các chức vụ Tiểu Hội Đồng
```ts
const CourtPositionSchema = z.object({
  "Người Giữ Chức": safeString().prefault("Khuyết"),
  "Năng Lực": clampedStat(0, 100, 30), // map theo lĩnh vực chức vụ (0-100); nếu người giữ chức là NPC đã có trong "Mối Quan Hệ" (mục 5.1b), lấy từ khối "Năng Lực" của NPC đó (Võ Lực/Thống Soái/Trí Mưu/Ngoại Giao tuỳ chức) — vd Đại Chưởng Ngân Khố dùng Trí Mưu, Đô Đốc dùng Thống Soái
});

// trong StatDataSchema:
"Tiểu Hội Đồng": z.object({
  "Bàn Tay Nhà Vua": CourtPositionSchema,
  "Đại Chưởng Ngân Khố": CourtPositionSchema,   // Master of Coin
  "Đại Chưởng Ấn": CourtPositionSchema,         // Master of Laws
  "Đô Đốc Hạm Đội": CourtPositionSchema,        // Master of Ships
  "Đại Điệp Viên": CourtPositionSchema,         // Master of Whisperers
  "Học Sĩ Trưởng": CourtPositionSchema,         // Grand Maester
  "Tổng Chỉ Huy Ngự Lâm Quân": CourtPositionSchema,
}).prefault({})
```
Năng Lực người giữ chức ảnh hưởng trực tiếp hiệu quả lĩnh vực tương ứng (vd Đại Chưởng Ngân Khố Năng Lực cao → +% thu Vàng toàn lãnh thổ ở công thức mục 10.3) — engine tính, AI tường thuật.

### 13.2 Bổ nhiệm/miễn nhiệm
- Nếu nhân vật chính có quyền (vua/lãnh chúa cai trị): bổ nhiệm trực tiếp từ danh sách NPC đã biết (`Mối Quan Hệ` mục 5.1) hoặc NPC mới AI giới thiệu.
- Nếu nhân vật chính ở vị trí thấp hơn (hiệp sĩ, con thứ...): không có quyền bổ nhiệm trực tiếp — chỉ có thể "vận động" (lobby) qua hội thoại, phân giải bằng `resolveCheck` (5bis) dựa Độ Hảo Cảm với người có quyền quyết + chỉ số **Uy Tín** (kèm kỹ năng Thuyết Phục/Nghi Thức, hoặc kỹ năng Mưu Lược nếu đi đường mưu mẹo) của nhân vật chính (5.1f).
- **Quan trọng cho UI:** nút bổ nhiệm trực tiếp chỉ hiện nếu state cho biết nhân vật chính có thẩm quyền; ngược lại chỉ hiện gợi ý hội thoại/vận động — tránh cho phép hành động mà lore hiện tại không cho phép.

### 13.3 Phiên họp triều & sự kiện
- Tái dùng thẻ ngữ nghĩa `<council_session>` (mục 5.6) — mỗi phiên họp Tiểu Hội Đồng AI tường thuật trong thẻ này, kèm 1-2 lựa chọn quyết định cho người chơi (nút bấm nhanh, tương tự `<event_popup>`).
- Sự kiện triều chính định kỳ: họp thường kỳ mỗi N ngày theo lịch Westeros (mục 8.7), hoặc trigger đột xuất theo state (vd War Score đối phương quá cao → triệu tập họp khẩn).

### 13.4 Hôn nhân & kế vị
Mở rộng từ field `"Người Thừa Kế"` / `"Đã Kết Hôn Với"` trong `NpcSchema` (mục 5.1) thành hệ thống đầy đủ (liên kết chặt với chính trị mục 14):
```ts
"Gia Tộc Học": z.object({
  "Người Thừa Kế Hiện Tại": safeString().optional(),   // NPC id
  "Thứ Tự Kế Vị": z.array(safeString()).prefault([]),   // danh sách NPC id theo thứ tự ưu tiên
  "Luật Kế Vị": z.enum(["Trưởng Nam", "Trưởng Tử Bất Kể Giới (Dorne)", "Bầu Chọn (Sắt)", "Chỉ Định"]).prefault("Trưởng Nam"),
  "Hôn Ước Đang Thương Lượng": z.record(safeString().describe("NPC id"), z.object({
    "Đối Tượng": safeString(),
    "Nhà Đối Tác": safeString(),
    "Của Hồi Môn": z.coerce.number().prefault(0),
    "Lợi Ích Chính Trị": safeString(),                   // AI mô tả: liên minh, yêu sách đất, hoà giải...
  })).prefault({}),
}).prefault({})
```
- **Hôn nhân chính trị:** gả/cưới NPC → tự động nâng `"Thái Độ Các Nhà"` (mục 5.1) với Nhà đối tác + mở khả năng xin viện binh (mục 12.3). Của hồi môn = Vàng chuyển giao. AI đề xuất hôn ước có lợi dựa trên bàn cờ chính trị hiện tại.
- **Kế vị & khủng hoảng thừa kế:** khi 1 lãnh chúa NPC chết mà `"Thứ Tự Kế Vị"` rỗng hoặc có tranh chấp → engine trigger sự kiện khủng hoảng kế vị (nhiều NPC cùng yêu sách → có thể dẫn tới nội chiến, tái dùng hệ thống chiến tranh mục 12). Luật kế vị khác nhau theo Nhà (Dorne cho phép con gái trưởng, Iron Islands bầu chọn kiểu kingsmoot).

### 13.5 UI Triều Đình ([icon:triều-đình])
Mở từ icon [icon:triều-đình]. Ẩn hoàn toàn nếu nhân vật chưa dính líu triều chính nào.

**Sơ đồ Tiểu Hội Đồng (Small Council view):**
- Bố cục dạng **bàn hội đồng**: 7 ghế quanh bàn, mỗi ghế 1 chức vụ + avatar người giữ chức (hoặc "Khuyết" nếu trống), badge Năng Lực. Ghế trống nhấp nháy nhẹ nếu người chơi có quyền bổ nhiệm.
- Bấm 1 ghế → thẻ chi tiết: người đang giữ, năng lực, độ trung thành với mình, **hiệu ứng chức vụ đang mang lại** (vd "Đại Chưởng Ngân Khố: +12% thu thuế"), nút **Bổ nhiệm/Miễn nhiệm** (chỉ bật nếu có thẩm quyền — mục 13.2) hoặc nút **Vận động** (nếu không đủ quyền, mở hướng hội thoại lobby).
- Modal bổ nhiệm: danh sách NPC ứng viên (từ Mối Quan Hệ mục 5.1) kèm năng lực dự kiến + độ trung thành + cảnh báo rủi ro ("NPC này có đặc tính Phản Trắc"). Chọn xong → toast + AI tường thuật phản ứng triều đình.

**Bảng quyền lực & phe cánh:**
- Sơ đồ quan hệ đơn giản: ai đang phò mình, ai chống, ai trung lập (màu badge), cập nhật theo Thái Độ. Giúp người chơi đọc bàn cờ trước khi bổ nhiệm/âm mưu.

**Phiên họp triều (khi trigger):** render qua thẻ `<council_session>` ngay trong luồng chat (mục 5.6) — hiện danh sách người dự, vấn đề đang bàn, và **2-3 nút quyết định** (mỗi nút kèm hé lộ hệ quả: "Tăng thuế chiến tranh — +Vàng, −Trung Thành"). Bấm → áp patch + AI kể diễn biến + phản ứng các thành viên.

**Bảng Gia Tộc & Kế Vị:**
- Cây gia phả nhỏ: nhân vật chính + phối ngẫu + con cái + thứ tự kế vị (đánh số). Người thừa kế hiện tại highlight.
- Ô **Hôn Ước Đang Thương Lượng:** thẻ mỗi đề nghị hôn nhân (đối tượng, Nhà đối tác, của hồi môn, lợi ích chính trị) + nút Chấp nhận/Từ chối. AI chủ động đề xuất hôn ước lợi khi hợp thời (chèn `<raven_scroll>` báo có nhà đến cầu hôn).

---

## 14. Chính trị & Mưu đồ (Intrigue)

Hệ thống ngầm chạy song song với quân sự — cho phép đạt mục tiêu mà không cần đánh trận. Đây là mảng **AI tường thuật nhiều, engine giữ số ít nhưng đủ để có hệ quả cơ học thật**.

### 14.1 Mạng lưới gián điệp & tình báo
```ts
"Tình Báo": z.object({
  "Điệp Viên": z.record(safeString().describe("Tên/bí danh điệp viên"), z.object({
    "Cài Ở": safeString(),                              // Nhà/lãnh địa/triều đình mục tiêu
    "Độ Sâu Thâm Nhập": clampedStat(0, 100, 10),        // càng cao càng nhiều tin + rủi ro lộ càng thấp
    "Bị Nghi Ngờ": clampedStat(0, 100, 0),              // đạt 100 => bị bắt/xử tử
    "Nhiệm Vụ": z.enum(["Thu Thập Tin", "Phá Hoại", "Tung Tin Đồn", "Ám Sát (chuẩn bị)", "Nằm Vùng"]).prefault("Thu Thập Tin"),
  })).prefault({}),
  "Tin Tình Báo Đã Biết": z.record(safeString().describe("Chủ đề"), safeString().describe("Nội dung tin")).prefault({}),
  "Bị Cài Điệp Viên": clampedStat(0, 100, 0),           // mức độ triều đình mình bị địch thâm nhập
}).prefault({})
```
```
onTurnAdvance(): // nối tiếp các loop trước
  for each điệp viên:
    if Nhiệm Vụ == "Thu Thập Tin":
      if seededRandom() < f(Độ Sâu Thâm Nhập):
        thêm 1 "Tin Tình Báo Đã Biết" (AI sinh nội dung phù hợp bối cảnh mục tiêu)
    Bị Nghi Ngờ += baseSuspicion - Độ Sâu Thâm Nhập*k + (Phá Hoại/Ám Sát ? +bonus rủi ro : 0)
    if Bị Nghi Ngờ >= 100: resolveSpyCaught()  // AI tường thuật bị bắt; ảnh hưởng quan hệ 2 Nhà, có thể lộ danh tính người phái
```
- **Đại Điệp Viên** (chức Tiểu Hội Đồng mục 13.1) Năng Lực cao → giảm `"Bị Cài Điệp Viên"` mỗi turn + tăng hiệu quả điệp viên của mình. "Little birds" của Varys chính là cơ chế này.
- Tin tình báo mở khoá lựa chọn hội thoại/hành động mới (biết trước kế hoạch địch → phục kích quân đang di chuyển mục 11.4; biết bí mật NPC → tống tiền ở mục 14.3).

### 14.2 Âm mưu & phe cánh triều đình (Plots)
```ts
"Âm Mưu": z.record(safeString().describe("Tên âm mưu"), z.object({
  "Loại": z.enum(["Đảo Chính", "Ám Sát", "Phế Truất", "Vu Khống", "Ly Gián", "Đầu Độc"]),
  "Mục Tiêu": safeString(),                             // NPC/Nhà bị nhắm
  "Tiến Độ": clampedStat(0, 100, 0),                    // đủ 100 mới kích hoạt được
  "Đồng Mưu": z.array(safeString()).prefault([]),        // NPC tham gia; càng nhiều càng nhanh nhưng càng dễ lộ
  "Độ Bại Lộ": clampedStat(0, 100, 0),                  // đạt ngưỡng => mục tiêu biết trước, phản đòn
})).prefault({})
```
```
advancePlot(plotName, resourcesInvested):
  plot."Tiến Độ" += f(Trí Tuệ + kỹ năng Mưu Lược nhân vật chính (5.1f), số Đồng Mưu, resourcesInvested)
  plot."Độ Bại Lộ" += g(số Đồng Mưu, đối phương "Đại Điệp Viên" Năng Lực)
  if plot."Độ Bại Lộ" >= threshold: mục tiêu phản đòn (AI tường thuật, có thể lật ngược thành âm mưu chống lại mình)
  if plot."Tiến Độ" >= 100: có thể "kích hoạt" => resolvePlotOutcome() qua resolveCheck (5bis, chỉ số Trí Tuệ + Mưu Lược vs phòng bị mục tiêu) quyết thành/bại
```
- **Trí Tuệ + kỹ năng Mưu Lược** (mục 5.1f) của nhân vật chính là hệ số chính (thay "chỉ số Âm Mưu" 4-trục cũ đã gỡ khỏi 5.1f). Nhiều đồng mưu = nhanh nhưng lộ nhanh (bài học Ned Stark). Đồng mưu có thể **phản bội** nếu Độ Hảo Cảm thấp hoặc bị địch mua chuộc.
- Phe cánh: nhóm NPC cùng lợi ích tạo thành faction trong triều; theo dõi bằng `"Thái Độ Các Nhà"` mở rộng cho cá nhân — ai đang phò mình, ai chống, ai trung lập.

### 14.3 Ám sát, đầu độc, tống tiền (hành động lẻ)
- **Ám sát:** cần điệp viên đã "chuẩn bị" (mục 14.1) hoặc thuê Faceless Men (rất đắt, gần như chắc thành nhưng để lại dấu vết tiền bạc truy được). Dùng **`resolveCheck` của hệ xác suất thống nhất (mục 5bis.2)** — opposed check: (Nhanh Nhẹn + kỹ năng sát thủ + thiên phú/trang bị liên quan) của sát thủ **đối đầu** phòng vệ mục tiêu (Ngự Lâm Quân, nếm thức ăn, độ cảnh giác), DC theo mức phòng bị. **Đại Thất Bại** (5bis.4) = sát thủ bị bắt/lộ danh tính → hậu quả ngoại giao nặng; **Thành Công Nửa Vời** = giết được nhưng để lại manh mối truy ra ngươi. Engine roll, AI kể.
- **Đầu độc:** cơ chế riêng — cần tiếp cận nguồn thức ăn/rượu của mục tiêu, khó bị quy trách trực tiếp (thấp "Độ Bại Lộ") nhưng "The Strangler"/"Tears of Lys" là vật phẩm hiếm phải tìm.
- **Tống tiền:** dùng "Tin Tình Báo Đã Biết" (bí mật NPC) → ép NPC làm theo ý mình (đổi phiếu bầu, phản bội chủ, cấp tin) thay vì giết. Rủi ro: NPC bị dồn quá có thể liều lĩnh phản kháng.

### 14.4 Con tin & tù binh
```ts
"Con Tin": z.record(safeString().describe("Tên con tin"), z.object({
  "Thuộc Nhà": safeString(),
  "Giá Trị": z.enum(["Người Thừa Kế", "Thành Viên Cấp Cao", "Tướng Lĩnh", "Thường Dân"]).prefault("Thành Viên Cấp Cao"),
  "Đối Xử": z.enum(["Khách Quý", "Giam Lỏng", "Ngục Tối"]).prefault("Giam Lỏng"),   // ảnh hưởng quan hệ với Nhà đối phương
})).prefault({})
```
- Nguồn con tin: tướng bị bắt sau đại chiến (mục 7.7), điều khoản hoà ước, trao đổi "nuôi dạy" kiểu Theon ở Winterfell.
- Dùng con tin: đòi tiền chuộc (Vàng), ép nhượng bộ, lá chắn chính trị. Hành quyết con tin giá trị cao → tụt danh tiếng + đẩy Nhà đối phương vào "Thù Địch" vĩnh viễn (bài học Karstark).

### 14.5 UI Mưu Đồ ([icon:mưu-đồ]) — "phòng tối"
Mở từ icon [icon:mưu-đồ]. Ẩn cho tới khi người chơi có điệp viên/âm mưu đầu tiên (empty state gợi ý cách bắt đầu: "Bóng tối là nơi kẻ yếu lật đổ kẻ mạnh. Hãy tuyển một tai mắt..."). Theme tối hơn phần còn lại (nền thẫm, chữ như thì thầm) để tạo không khí.

**Tab Tình Báo (điệp viên):**
- Bản đồ thu nhỏ Westeros với **ghim điệp viên** ở nơi cài; mỗi ghim màu theo mức "Bị Nghi Ngờ" (xanh→vàng→đỏ). Trực quan hoá mạng lưới.
- Danh sách điệp viên: bí danh, cài ở đâu, nhiệm vụ hiện tại, 2 thanh (Độ Thâm Nhập / Bị Nghi Ngờ), nút đổi nhiệm vụ. **Cảnh báo đỏ** khi 1 điệp viên sắp lộ (Bị Nghi Ngờ > 80) — người chơi phải chọn rút về hay liều tiếp.
- Nút **Tuyển điệp viên mới** (tốn Vàng, chọn mục tiêu cài).
- Ô **Tin Tình Báo Đã Biết**: danh sách bí mật thu thập được, mỗi cái là 1 "quân bài" bấm để dùng (mở lựa chọn tống tiền/phục kích/vạch trần ở đúng ngữ cảnh).

**Tab Âm Mưu:**
- Thẻ mỗi âm mưu đang tiến hành: loại (ám sát/đảo chính/vu khống...), mục tiêu, **2 thanh đối nghịch Tiến Độ vs Độ Bại Lộ** (đua nhau — trực quan cực kỳ căng thẳng: sắp xong nhưng sắp lộ?), danh sách đồng mưu (kèm cảnh báo nếu ai đó độ trung thành thấp có thể phản).
- Nút **Đẩy nhanh** (đầu tư thêm Vàng/công sức, tăng Tiến Độ nhưng cũng tăng Bại Lộ) và **Kích hoạt** (bật khi Tiến Độ đạt 100 — nút đỏ, xác nhận kỹ vì không hoàn tác được).
- Nút **Âm mưu mới** → wizard: chọn loại, mục tiêu, chiêu mộ đồng mưu từ NPC quen.

**Tab Con Tin & Tù Binh:**
- Thẻ mỗi con tin: tên, thuộc Nhà, giá trị, cách đối xử (dropdown Khách Quý/Giam Lỏng/Ngục Tối — đổi ảnh hưởng quan hệ Nhà đối phương), nút Đòi Tiền Chuộc / Trao Đổi / (Hành Quyết — cảnh báo nặng về hậu quả danh tiếng).

**Nút hành động lẻ** (ám sát/đầu độc) không đặt lộ liễu — chỉ xuất hiện qua "quân bài" tin tình báo hoặc Action Deck khi ngữ cảnh cho phép (đang ở gần mục tiêu, có công cụ), giữ cảm giác mưu đồ phải "đúng thời cơ" chứ không phải bấm nút bất kỳ lúc nào.

---

## 15. Kinh tế & Thương mại nâng cao (mở rộng mục 10)

Mục 10 lo **1 lãnh địa đơn lẻ** (thu/chi/xây). Mục này là **nền kinh tế liên vùng** — dòng chảy hàng hoá, thuế, khủng hoảng.

### 15.1 Tài nguyên & nhu cầu vùng miền
Mỗi `MapRegion` (mục 9) có tài nguyên dư/thiếu đặc trưng, tạo động lực thương mại:
```ts
"Kinh Tế Vùng": z.record(safeString().describe("Region id"), z.object({
  "Sản Vật Chủ Lực": z.array(safeString()).prefault([]),   // vd The Reach: Lương Thực dư; The North: Gỗ/Lông thú
  "Thiếu Hụt": z.array(safeString()).prefault([]),          // vd Dorne: thiếu Gỗ; The North: thiếu Rượu/Lương mùa đông
  "Giá Cả": z.record(safeString().describe("Tên hàng"), z.coerce.number()).prefault({}), // giá động theo cung cầu
})).prefault({})
```
- Giá động: vùng dư sản vật → giá thấp; vùng thiếu → giá cao. Chênh lệch giá = cơ hội lợi nhuận cho thương nhân/người chơi (mua rẻ vùng này, bán đắt vùng kia).

### 15.2 Tuyến thương mại (Trade Routes)
```ts
"Tuyến Thương Mại": z.record(safeString().describe("Tên tuyến"), z.object({
  "Từ": safeString(), "Đến": safeString(),               // territory id
  "Hàng Hoá": z.array(safeString()).prefault([]),
  "Lợi Nhuận/Turn": z.coerce.number().prefault(0),       // engine tính từ chênh lệch giá & khoảng cách
  "Đường": z.enum(["Bộ", "Biển", "Sông"]).prefault("Bộ"),
  "An Toàn": clampedStat(0, 100, 80),                    // cướp/hải tặc/phong toả làm giảm
})).prefault({})
```
```
onTurnAdvance():
  for each tuyến:
    if tuyến."Đường"=="Biển" và cảng bị phong toả (mục 7.8): tuyến."Lợi Nhuận/Turn" = 0
    if An Toàn < threshold: risk cướp => mất 1 phần hàng (seededRandom)
    Vàng += tuyến."Lợi Nhuận/Turn" * (An Toàn/100)
```
- Phá tuyến thương mại địch (cướp bằng quân mục 11, hải tặc Greyjoy, phong toả cảng mục 7.8) = vũ khí kinh tế làm suy yếu địch không cần đánh chính diện.

### 15.3 Thuế & ngân khố
```ts
"Chính Sách Thuế": z.object({
  "Mức Thuế": z.enum(["Miễn Thuế", "Nhẹ", "Vừa", "Nặng", "Vắt Kiệt"]).prefault("Vừa"),
}).prefault({})
```
Bảng đánh đổi thuế (engine áp mỗi turn):
| Mức Thuế | Vàng/turn | Δ Trung Thành/turn | Ghi chú |
|---|---|---|---|
| Miễn Thuế | 0 | +3 | mua lòng dân, thời chiến hoặc sau nạn đói |
| Nhẹ | +50% base | +1 | |
| Vừa | +100% base | 0 | cân bằng |
| Nặng | +160% base | -2 | |
| Vắt Kiệt | +220% base | -5 | nguy cơ nổi loạn (mục 15.4) nếu Trung Thành < 20 |

- **Đại Chưởng Ngân Khố** (mục 13.1) Năng Lực cao → +% thu thuế mà không tăng phạt Trung Thành. Nợ nần: có thể vay Iron Bank of Braavos (Vàng ngay, lãi mỗi turn) — quỵt nợ Iron Bank → họ tài trợ kẻ thù của mình (đúng canon "The Iron Bank will have its due").
- **Vàng đi vào đâu (một ngân khố thống nhất — làm rõ để tránh lệch):** mọi khoản Vàng thu/chi (thuế, thương mại, lương quân, xây dựng, tiền chuộc con tin...) cộng/trừ vào **`Thông Tin Nhân Vật.Vàng`** — đây là ngân khố duy nhất của người chơi, KHÔNG có "ví cá nhân" tách khỏi "ngân khố lãnh thổ". `Tài Nguyên.Vàng` trong từng `Lãnh Địa` (10.1) chỉ là **sản lượng vùng chưa thu về** (engine gom vào ngân khố mỗi turn qua loop 10.3), không phải một kho tiêu được riêng. Nhất quán một đường tiền giúp UI + AI không nhầm "vàng nào".

### 15.4 Khủng hoảng: nạn đói, dịch bệnh, nổi loạn
```ts
// dùng chung field trên Territory (mục 10.1), thêm:
"Khủng Hoảng": z.array(z.object({
  "Loại": z.enum(["Nạn Đói", "Dịch Bệnh", "Nổi Loạn", "Mùa Đông Khắc Nghiệt", "Cướp Bóc"]),
  "Mức Độ": z.enum(["Chớm", "Nghiêm Trọng", "Thảm Hoạ"]),
  "Turn Kéo Dài": z.coerce.number().int().prefault(0),
})).prefault([])
```
```
onTurnAdvance():
  for each territory:
    if Tài Nguyên.Lương Thực <= 0: trigger "Nạn Đói"  // dân chết dần, Dân Số giảm, Trung Thành tụt mạnh
    if Mùa=="Đông" và không đủ Lương Thực dự trữ: risk "Mùa Đông Khắc Nghiệt" (đặc trưng ASOIAF — mùa đông kéo dài nhiều năm)
    if Trung Thành < 15: risk "Nổi Loạn" => 1 phần Dân Số thành quân phản loạn, phải dẹp bằng quân (mục 11) hoặc nhượng bộ
    if "Dịch Bệnh": lây sang territory/quân đội lân cận, giảm Số Lượng đơn vị đóng gần
```
- Mùa đông (mục 8.7) là **cơ chế kinh tế trung tâm** của ASOIAF: mùa đông dài → tiêu thụ Lương Thực dự trữ tích trong mùa hè; Nhà không tích đủ (đặc biệt phương Nam quen mùa hè dài) → nạn đói hàng loạt. "Winter is coming" không chỉ là khẩu hiệu mà là áp lực quản lý kho lương thật trong game.

### 15.5 UI Kinh Tế ([icon:kinh-tế]) — bảng điều hành
Có thể là 1 màn riêng (icon [icon:kinh-tế] nếu người chơi quản lý nhiều lãnh địa) hoặc gộp vào Territory Panel khi chỉ có 1 lãnh địa. Mục tiêu: biến "bảng số" thành thứ đọc được trong 3 giây.

**Bảng tổng quan ngân khố:**
- Dòng lớn nhất: **tổng Vàng + xu hướng ±/turn** (mũi tên lên/xuống, xanh/đỏ). Nếu đang lỗ, hiện "cạn kho sau ~N turn" — tạo áp lực quyết định.
- Biểu đồ đường nhỏ (sparkline) Vàng/Lương Thực qua ~10 turn gần nhất để thấy xu hướng, không chỉ số hiện tại.
- Nếu có nợ Iron Bank: thanh nợ + lãi/turn + cảnh báo đỏ nếu sắp không trả nổi ("Iron Bank sẽ đòi món nợ của họ").

**Bảng Tài Nguyên theo lãnh địa (nếu nhiều lãnh địa):**
- Mỗi hàng 1 lãnh địa: 4 cột tài nguyên (số dư + ±/turn), cột trạng thái (bình thường/cảnh báo/khủng hoảng). Sắp xếp/lọc được (vd lọc lãnh địa đang lỗ Lương Thực). Bấm hàng → mở Territory Panel (mục 10.4).

**Điều khiển Thuế:**
- Slider 5 mức (Miễn → Vắt Kiệt), **kéo tới đâu hiện ngay preview** Vàng/turn mới + Δ Trung Thành/turn + cảnh báo nếu vào vùng nguy hiểm nổi loạn. Feedback tức thì làm việc chỉnh thuế thành quyết định có cân nhắc.

**Bảng Thương Mại:**
- Danh sách tuyến thương mại: từ→đến, hàng hoá (icon), lợi nhuận/turn, thanh **An Toàn** (đỏ nếu đang bị cướp/phong toả). Tuyến bị cắt (cảng phong toả mục 7.8) hiện gạch ngang + lý do.
- Nút **Mở tuyến mới**: chọn 2 điểm trên bản đồ, app tính lợi nhuận dự kiến từ chênh giá vùng (mục 15.1) → xác nhận.
- Gợi ý cơ hội: app tự đánh dấu vài cặp vùng có chênh giá lớn ("Gỗ ở phương Bắc rẻ, bán sang Dorne lời gấp 3") để người chơi thấy cơ hội mà không phải tự dò.

**Cảnh báo khủng hoảng** (mục 15.4): banner đỏ đầu bảng khi có nạn đói/dịch/nổi loạn đang diễn ra, kèm nút nhảy thẳng tới lãnh địa liên quan + gợi ý cách xử lý (mở kho cứu đói? giảm thuế? điều quân dẹp loạn?).

---

## 16. Nhập vai & AI động (Roleplay Depth)

Nhóm cơ chế làm thế giới "sống": NPC nhớ, tính cách thay đổi, sự việc tự xảy ra — thay vì thế giới tĩnh chỉ phản ứng khi người chơi hành động.

### 16.1 Trí nhớ NPC (NPC Memory)
Field `"Ký Ức"` + `"Lời Hứa Chưa Giữ"` **đã định nghĩa đầy đủ trong `NpcSchema` mục 5.1b** (bản chuẩn — enum Cảm Xúc 8 giá trị gồm cả Yêu Mến/Ghen Tị, có field `Năm` cho aging). Mục này chỉ mô tả **cơ chế vận hành** của trí nhớ đó, không lặp lại schema:
```ts
// (tham chiếu 5.1b — KHÔNG khai lại; cấu trúc: Ký Ức[]{Turn, Năm?, Sự Việc, Cảm Xúc, Trọng Số}, Lời Hứa Chưa Giữ[])
```
- Khi build prompt (mục 3.3): với NPC đang xuất hiện trong cảnh, inject 3-5 ký ức trọng số cao nhất của NPC đó vào context → AI hành xử nhất quán với lịch sử (NPC bạn từng cứu sẽ nhớ ơn; NPC bạn từng lừa sẽ cảnh giác). Đây là **RAG có chủ đích trên MVU state**, khác với RAG lorebook (mục 4). Là hiện thân cụ thể của tầng T2 trong hệ trí nhớ dài hạn (16bis.1).
- Ký ức trọng số thấp phai dần theo turn (engine giảm dần) để tránh phình vô hạn; sự kiện lớn (phản bội, cứu mạng) trọng số cao gần như vĩnh viễn.

### 16.2 Tính cách động (Dynamic Personality)
Khối `"Tính Cách"` (4 trục) + `"Cung Bậc Phát Triển"` **đã có trong `NpcSchema` mục 5.1b** — mục này mô tả cơ chế, không khai lại:
```ts
// (tham chiếu 5.1b: Tính Cách{Trục Thiện-Ác, Trục Can Đảm-Hèn Nhát, Trục Trung Thành-Phản Trắc, Trục Nóng Nảy-Điềm Tĩnh}, mỗi trục -100..100; + Cung Bậc Phát Triển)
```
- 4 trục tính cách định hình cách AI nhập vai NPC. **Thay đổi theo trải nghiệm:** NPC bị phản bội nhiều lần → trục Trung Thành tụt; NPC liên tục thắng trận → trục Can Đảm tăng. Engine điều chỉnh nhẹ mỗi khi có sự kiện liên quan, tạo character arc dài hạn (kiểu Theon → Reek → Theon, hay sự tha hoá của nhiều nhân vật).
- Inject vào prompt để AI giữ giọng NPC nhất quán + phản ánh được sự tiến hoá.

### 16.3 NPC tự chủ (Off-screen Simulation nhẹ)
- NPC quan trọng (lãnh chúa, đối thủ chính) có **mục tiêu riêng** (field `"Mục Tiêu Cá Nhân"` trong NpcSchema 5.1b) và **tự hành động khi vắng mặt người chơi**: mỗi vài turn, engine cho AI mô phỏng ngắn 1-2 NPC chủ chốt "họ làm gì để đạt mục tiêu" → sinh ra tin tức/biến động thế giới (Nhà X vừa gả con gái cho Nhà Y, lãnh chúa Z vừa chiếm 1 lâu đài).
- Giữ nhẹ (chỉ vài NPC then chốt, không mô phỏng cả lục địa — xem non-goals) để không tốn token, nhưng đủ tạo cảm giác thế giới vận động độc lập.

### 16.4 Danh tiếng đa chiều (Reputation)
```ts
"Danh Tiếng": z.object({
  "Vinh Dự": clampedStat(-100, 100, 0),      // giữ lời/phản bội, đánh công bằng/gian trá
  "Nhân Từ": clampedStat(-100, 100, 0),      // khoan dung/tàn bạo với tù binh, dân thường
  "Uy Dũng": clampedStat(-100, 100, 0),      // thắng trận, đấu tay đôi, chiến công
  "Xảo Quyệt": clampedStat(-100, 100, 0),    // mưu mẹo thành công (âm mưu mục 14)
}).prefault({})
```
- Danh tiếng ảnh hưởng phản ứng mặc định của NPC lạ + mở/khoá lựa chọn (Uy Dũng cao → NPC nể sợ; Nhân Từ cao → dân ủng hộ, tù binh dễ quy hàng; Xảo Quyệt cao → đồng minh cảnh giác). Các Nhà đánh giá bạn khác nhau tuỳ giá trị họ coi trọng (Stark trọng Vinh Dự, Lannister trọng Xảo Quyệt/Uy Dũng).

**Bậc-hoá Danh Vọng (Renown tier) — nhãn tổng hợp + tước hiệu dân gian.** Ngoài 4 trục số trên, engine dẫn xuất một **Danh Vọng tổng** (tổng hợp có trọng số 4 trục + chiến công + quy mô lãnh thổ) rồi ánh xạ sang **thang bậc có tên gợi hình kiểu Westeros** — cho AI một nhãn dễ kể và cho người chơi cảm giác thăng/giáng danh vọng rõ rệt (giống cách các nhân vật ASOIAF được gắn tước hiệu/biệt danh). Engine tự suy nhãn (đừng để AI tự đặt bậc), toast khi đổi bậc:

| Loại | Bậc | Tên gợi hình | Mô tả (AI dùng để kể) |
|---|---|---|---|
| Vinh | 5 | **Huyền Thoại Sống** | Tên tuổi khắc vào sử xanh Bảy Phủ, ngâm trong ca dao — như Nhà Vua hay Aegon Chinh Phạt |
| Vinh | 4 | **Danh Chấn Thất Quốc** | Cả lục địa biết tiếng, lãnh chúa lớn phải nể — kiểu Kỵ Sĩ Hoa Barristan |
| Vinh | 3 | **Lừng Danh Một Cõi** | Nổi tiếng khắp một vùng (phương Bắc/Reach...), hào tộc kính trọng |
| Vinh | 2 | **Có Tiếng Tốt** | Được xóm giềng, chư hầu gần khen ngợi, danh dự vững |
| Vinh | 1 | **Kẻ Đáng Kính** | Tiếng thơm cơ bản trong giới thân cận |
| — | 0 | **Vô Danh Tiểu Tốt** | Chưa ai biết đến — điểm khởi đầu của phần lớn nhân vật tự tạo |
| Nhục | 1 | **Bị Gièm Pha** | Bị nói xấu trong thanh nghị, đứng rìa các mối giao tế |
| Nhục | 2 | **Ô Danh Gia Tộc** | Hành vi bất chính khiến cả Nhà mang tiếng |
| Nhục | 3 | **Kẻ Phản Bội (Oathbreaker)** | Bội thề, giết chủ/khách — mất hết danh dự, như "Sát Vương" bị đời phỉ nhổ |
| Nhục | 4 | **Quái Vật Bị Nguyền** | Ác danh vang khắp lục địa, ngàn người chỉ trích — kiểu "Núi Non" Gregor, "Ramsay Bolton" |
| Nhục | 5 | **Lưu Xú Muôn Đời** | Cái tên trở thành lời nguyền rủa trong sử sách, như "Vua Điên" Aerys |

- Bậc Vinh/Nhục **không loại trừ nhau tuyệt đối**: một nhân vật có thể vừa được nể sợ (Uy Dũng cao) vừa mang ô danh (Vinh Dự âm) — như Jaime Lannister vừa là kiếm sĩ lừng danh vừa là "Kẻ Sát Vương". Engine chọn nhãn nổi trội để hiển thị, nhưng AI biết cả hai mặt.
- Tước hiệu dân gian có thể **cá nhân hoá theo hành động** (nối trí nhớ 16bis): nếu người chơi nổi tiếng vì một chiến công/tội ác cụ thể, AI có thể gán biệt danh riêng (kiểu "Kẻ Đốt Thành", "Người Giữ Lời") thay vì chỉ nhãn generic — lưu vào `Biệt Danh` (5.1b).

---

## 16bis. Hệ thống Trí Nhớ Dài Hạn — chống AI quên khi chơi lâu (Long-Term Memory & Continuity)

> **Vấn đề cốt lõi:** context window có hạn. Chơi vài chục–vài trăm lượt thì hội thoại cũ **không thể** nhét hết vào prompt. Nếu chỉ cắt tin nhắn cũ (mục 3.3), AI sẽ **quên**: quên NPC đã gặp, quên lời hứa, quên âm mưu đang chạy, quên mình từng thắng/thua ai, quên vì sao hai Nhà thù nhau. Tệ hơn quên là **nhớ nhầm** — AI bịa ra chi tiết mâu thuẫn với quá khứ. Mục này là kiến trúc để **AI luôn nhất quán bất kể chơi bao lâu**, dựa trên một nguyên tắc: **state (MVU) là nguồn chân lý, không phải lịch sử chat**. Chat có thể trôi mất; state thì không.

### 16bis.1 Bốn tầng trí nhớ (Memory Tiers)

Trí nhớ của game chia 4 tầng, mỗi tầng có tuổi thọ & cách vào prompt khác nhau. Đây là khung tư duy để mọi thứ AI "cần nhớ" có chỗ trú ngụ **ngoài** cửa sổ chat:

| Tầng | Chứa gì | Sống ở đâu | Vào prompt thế nào |
|---|---|---|---|
| **T1 — Chân Lý State** | Toàn bộ `stat_data`: NPC + hảo cảm, quan hệ Nhà, quân đội, lãnh địa, âm mưu, kinh tế, vị trí, ngày/mùa | MVU store (mục 5), luôn đầy đủ | Chèn **nguyên vẹn** mỗi turn (state nhỏ gọn, không như chat) — luôn có, không bao giờ trôi |
| **T2 — Ký Ức Bền** | Sự kiện quan trọng đã xảy ra: NPC memory trọng số cao (5.1b/16.1), lời hứa chưa giữ, chiến công/thất bại lớn, phản bội, cột mốc cốt truyện | MVU state (các field chuyên) + Dexie | Chèn **có chọn lọc theo liên quan** (NPC đang trong cảnh, chủ đề đang bàn) |
| **T3 — Tóm Tắt Hồi Cố** | Bản tóm tắt lũy tiến các chương truyện đã qua (rolling summary) — "chuyện gì đã xảy ra tới giờ" | Dexie (`chapterSummaries`) | Chèn **1–2 bản tóm tắt gần/liên quan nhất** vào đầu context |
| **T4 — Chat Thô Gần Đây** | N lượt hội thoại nguyên văn gần nhất | Dexie chat log | Chèn **nhiều nhất có thể** trong ngân sách còn lại, cắt từ cũ nhất (mục 3.3) |

**Luồng khi context đầy:** T4 (chat thô) là tầng **hi sinh đầu tiên** — lượt cũ bị cắt khỏi prompt NHƯNG trước khi cắt, nội dung của chúng đã được **cô đọng lên T3** (tóm tắt) và các dữ kiện quan trọng đã **kết tinh xuống T1/T2** (state + ký ức bền). Nhờ vậy cắt chat thô **không mất thông tin** — chỉ mất câu chữ nguyên văn, còn ý nghĩa đã lưu ở tầng bền hơn. Đây là điểm mấu chốt: **thông tin di chuyển xuống tầng bền TRƯỚC khi câu chữ bị xoá khỏi context.**

### 16bis.2 Tóm tắt lũy tiến (Rolling Summarization) — cơ chế cụ thể

Engine tự cô đọng hội thoại cũ thành tóm tắt, chạy **async, không chặn UI** (Web Worker / lượt nền):

```
onAfterTurn():   // sau mỗi lượt, kiểm tra ngân sách
  if (ướcLượngToken(chatThôChưaTómTắt) > NGƯỠNG_TÓM_TẮT):   // vd 40% context budget
    đoạnCũ = lấy các lượt cũ nhất chưa tóm tắt (để lại N lượt gần nhất nguyên văn)
    triệu hồi AI (call phụ, prompt riêng) với chỉ thị:
      "Tóm tắt đoạn truyện sau thành 5-10 gạch đầu dòng, GIỮ: ai xuất hiện, quyết định
       quan trọng, thay đổi quan hệ, lời hứa/đe doạ, vật phẩm/thông tin then chốt thu được,
       diễn biến cốt truyện. BỎ: mô tả rườm rà, đối thoại xã giao. KHÔNG bịa chi tiết
       không có trong đoạn. Viết ở thì quá khứ, ngôi thứ ba."
    lưu summary vào Dexie chapterSummaries { turnRange, nămTrongTruyện, nội dung, NPCLiênQuan[] }
    đánh dấu đoạnCũ = "đã tóm tắt" (vẫn giữ raw trong Dexie để người chơi đọc lại lịch sử,
                                     chỉ là không nhét raw vào prompt nữa)
```

- **Tóm tắt chồng tóm tắt (hierarchical):** khi số bản tóm tắt cấp 1 nhiều lên, engine gộp chúng thành tóm tắt cấp 2 ("Quyển I: ..."), giữ context luôn gọn dù chơi trăm giờ. Giống mục lục truyện dài.
- **Trích xuất dữ kiện có cấu trúc:** call tóm tắt đồng thời yêu cầu AI trả **khối `mvu_update`** cho bất kỳ dữ kiện bền nào chưa nằm trong state (NPC mới xuất hiện chưa có trong `NPC Chính`, quan hệ vừa đổi, lời hứa vừa hứa) → engine áp vào T1/T2. Đây là cách "kết tinh" ý nghĩa xuống tầng bền trước khi bỏ chat thô.
- **Người chơi kiểm soát được:** Settings có thể chỉnh ngưỡng tóm tắt, và có nút "Xem/Sửa Tóm Tắt" — người chơi đọc được engine đã tóm gì, sửa nếu AI tóm sai (tôn trọng "đúng trước, đẹp sau" — cho người chơi vá trí nhớ khi cần).

### 16bis.3 State là nguồn chân lý — quy tắc vàng chống bịa

- **AI luôn tin state hơn trí nhớ của chính nó.** Prompt hệ thống nêu rõ: "Thông tin trong khối trạng thái là sự thật hiện tại của thế giới. Nếu trí nhớ của ngươi (đoạn hội thoại) mâu thuẫn với trạng thái, **lấy trạng thái làm chuẩn**." Điều này chặn việc AI kể "NPC X vẫn là bạn ngươi" trong khi Hảo Cảm đã tụt xuống Thù Địch vì một sự kiện AI không còn nhớ.
- **State được render dễ đọc cho AI**, không phải JSON thô khó tiêu: engine format `stat_data` thành một khối tự nhiên có nhãn tiếng Việt ("Tyrion Lannister — Quan hệ: Thân Thiết (52), đang giữ chức Quân Sư, từng được ngươi cứu ở Blackwater"). NPC trong cảnh render đầy đủ; NPC vắng mặt render gọn (tên + quan hệ). Nhờ 5.1d, giai đoạn hảo cảm (nhãn chữ) đi kèm số — AI đọc "Thù Địch" rõ hơn đọc "-45".
- **Không có trong state = chưa xảy ra / chưa biết.** Nếu người chơi hỏi về một NPC/sự kiện không có trong state lẫn tóm tắt, AI **không bịa** — hoặc thừa nhận không rõ, hoặc coi như nhân vật mới. Thà thiếu còn hơn mâu thuẫn.

### 16bis.4 Sổ Tay Trí Nhớ (Codex) — người chơi cũng không phải nhớ hộ

Người chơi chơi ngắt quãng nhiều ngày cũng quên. App cung cấp **Codex** (mở từ Nhật Ký, mục 17.4) — giao diện tra cứu mọi thứ đã tích luỹ, **đọc thẳng từ state + tóm tắt, không tốn context**:
- **Nhân Vật:** mọi NPC đã gặp — ảnh chân dung (5.1c), quan hệ hiện tại + giai đoạn, tuổi, chức vụ, tóm tắt lịch sử tương tác (từ Ký Ức), lời hứa chưa giữ. Lọc/tìm theo tên, Nhà, quan hệ.
- **Biên Niên Sử:** dòng thời gian các sự kiện lớn (từ tóm tắt T3 + cột mốc), cuộn theo Năm trong truyện.
- **Thế Lực:** các Nhà đã biết, Thái Độ với mình, quan hệ giữa họ, ai đang chiến tranh/liên minh với ai.
- **Âm Mưu & Việc Dở Dang:** điệp viên đang cài (14), âm mưu đang chạy, con tin đang giữ, quest đang mở (17.2) — "những sợi chỉ chưa buộc" để người chơi quay lại sau nhiều ngày vẫn biết mình đang làm gì.
- **Bí Mật Đã Biết:** thông tin then chốt thu thập được (dùng cho tống tiền 14.3, ra quyết định) — cái người chơi "biết" mà NPC tưởng còn giấu.

Codex là **cửa sổ đọc state**, cập nhật realtime, không phải bản chép tay riêng (nên không bao giờ lệch với sự thật game). Đây vừa là tiện ích người chơi, vừa là cách trực quan hoá 4 tầng trí nhớ ở 16bis.1.

### 16bis.5 Ngân sách context có ưu tiên (Prioritized Context Budget)

Mở rộng bước cắt context ở mục 3.3 — thay vì chỉ "cắt chat cũ nhất", cấp phát ngân sách theo **thứ tự ưu tiên cứng** (thứ tự này quyết định cái gì sống sót khi context chật):

```
Ngân sách token (cao → thấp, cấp từ trên xuống, hết budget thì tầng dưới bị cắt):
  1. [BẮT BUỘC] Chỉ thị hệ thống + luật MVU/thẻ + "state là chân lý" (16bis.3)
  2. [BẮT BUỘC] Khối State render (T1) — NPC trong cảnh đầy đủ, phần còn lại gọn
  3. [CAO]      Ký ức bền liên quan (T2): NPC trong cảnh + chủ đề đang bàn, lời hứa liên quan
  4. [CAO]      Lore active bắt buộc (constant) + EJS đã render (mục 4/5.5b)
  5. [TRUNG]    Tóm tắt hồi cố (T3): 1-2 bản gần/liên quan nhất
  6. [TRUNG]    Lore active khớp yếu hơn (cắt trước theo mục 4 nếu chật)
  7. [THẤP]     Chat thô gần đây (T4): nhồi tối đa phần còn lại, cắt từ cũ nhất
```
- Tầng 1–2 **không bao giờ bị cắt** — nếu chúng thôi đã vượt budget (state quá lớn ở late-game), engine render state theo mức chi tiết giảm dần (NPC không liên quan → chỉ tên + quan hệ; bỏ mô tả dài) thay vì cắt bừa. Cảnh báo dev nếu vẫn tràn.
- Việc **ký ức bền (T2) và tóm tắt (T3) được ưu tiên CAO HƠN chat thô (T4)** chính là cái đảm bảo AI không quên chuyện quan trọng: thà bỏ vài câu đối thoại nguyên văn của 20 lượt trước còn hơn bỏ "ngươi đã thề bảo vệ đứa bé này" hay "Nhà Frey đã phản bội ngươi ở Song Thành".

### 16bis.6 Neo nhất quán khi hồi cố (Continuity Anchors)

Chi tiết nhỏ giữ mạch truyện liền lạc qua thời gian dài:
- **Tên riêng & sự thật cố định (canon facts):** một tập dữ kiện bất biến của ván chơi (tên nhân vật chính, Nhà, các NPC cốt lõi, địa danh gốc, lời thề/mục tiêu lớn) được ghim vào một lore entry `constant` **không bao giờ bị cắt** — chống việc AI đổi tên NPC hay quên nhân vật chính là ai sau 100 lượt.
- **Nhắc lại có kiểm soát khi NPC tái xuất:** khi một NPC vắng lâu quay lại cảnh, engine chủ động chèn "hồ sơ tái ngộ" (từ Codex/state): lần cuối gặp khi nào, quan hệ ra sao, chuyện gì còn dang dở giữa hai người → AI kể tiếp đúng mạch thay vì như gặp lần đầu.
- **Kiểm tra mâu thuẫn nhẹ (optional, async):** sau khi AI trả lời, một call nền có thể đối chiếu các khẳng định về NPC/quan hệ trong lời kể với state; lệch rõ (AI nói "kẻ thù" nhưng state ghi "đồng minh") → engine ghi cảnh báo dev + có thể tự chèn đính chính ở lượt sau. Giữ nhẹ để không tốn token, bật/tắt trong Settings.

### 16bis.7 Nối vào các mục khác

- **buildPrompt (3.3):** chèn thêm bước cấp phát ngân sách ưu tiên 16bis.5 và render state 16bis.3 vào giữa các block; T3 (tóm tắt) là một loại block mới trong `prompt_order`.
- **onTurnAdvance / onAfterTurn (6.2):** gọi rolling summarization 16bis.2 khi vượt ngưỡng; cập nhật Ký Ức bền, phai ký ức trọng số thấp (16.1).
- **NPC memory (5.1b/16.1):** là hiện thân cụ thể của T2 cho từng NPC — mục này đặt nó vào bức tranh tổng thể.
- **Save/load (mục 20):** Dexie lưu cả 4 tầng (state, ký ức, tóm tắt, chat thô) → tải lại ván sau nhiều ngày khôi phục **toàn bộ trí nhớ**, không mất mạch. Export/import mang theo tóm tắt + ký ức, không chỉ chat.
- **Settings (mục 21):** ngưỡng tóm tắt, độ dài chat thô giữ nguyên văn, bật/tắt kiểm tra mâu thuẫn, nút xem/sửa tóm tắt & Codex.

---

## 17. Sự kiện động & Quest

### 17.1 Engine sự kiện ngẫu nhiên (Random Events)
```ts
interface GameEvent {
  id: string;
  title: string;
  weight: number;                    // trọng số cơ bản để random
  conditions: EventCondition[];      // chỉ đủ điều kiện mới vào pool (vd Mùa==Đông, Trung Thành<30, đang có chiến tranh)
  narrativeTag?: string;             // render qua thẻ nào (mục 5.6), vd <event_popup>
  choices: EventChoice[];            // 2-4 lựa chọn, mỗi cái có hệ quả patch MVU state
}
interface EventChoice {
  label: string;
  outcomePatch: MvuPatchOp[];        // áp thẳng vào state khi chọn (hoặc khi check thành công)
  check?: { checkId: string; dc: number; failPatch?: MvuPatchOp[] };  // dùng resolveCheck (5bis): checkId tra checkMap (5bis.2b), dc theo thang 5bis.3; failPatch áp khi thất bại
  narrativeHint: string;             // gợi ý AI tường thuật kết quả (theo bậc kết quả 5bis.4)
}
```
```
onTurnAdvance():
  pool = allEvents.filter(e => e.conditions all met)   // lọc điều kiện; trọng số có thể động theo state (5bis.7)
  rng = makeRng(eventSeed(rootSeed, turnCount, "event"))   // lõi RNG 5bis.1, stream "event"
  if rng() < eventChancePerTurn:
    chosen = weightedPick(pool.map(e => ({ value: e, weight: e.weight, condition: e.cond })), rng)  // 5bis.7
    trigger chosen -> hiện qua narrativeTag, chờ người chơi chọn -> áp outcomePatch (nếu có `check`, chạy resolveCheck 5bis trước: thành công áp outcomePatch, thất bại áp failPatch)
```
- Ví dụ sự kiện: "Một hiệp sĩ lang thang xin gia nhập" (cơ hội +tướng), "Nạn đói ở lãnh địa lân cận, dân tị nạn kéo đến" (nhận dân +Dân Số nhưng +tiêu Lương Thực), "Học sĩ phát hiện âm mưu đầu độc" (liên kết mục 14.3), "Chim ưng đưa tin liên minh tan vỡ".
- Điều kiện + trọng số giúp sự kiện **hợp bối cảnh** (mùa đông ra sự kiện mùa đông, đang chiến tranh ra sự kiện chiến tranh) thay vì random vô nghĩa. Pool sự kiện trong `content/westeros/events/`, dễ thêm.

### 17.2 Hệ thống Quest
```ts
"Nhiệm Vụ": z.record(safeString().describe("Quest id"), z.object({
  "Tiêu Đề": safeString(),
  "Loại": z.enum(["Cốt Truyện Chính", "Phụ", "Gia Tộc", "Chính Trị", "Quân Sự"]),
  "Trạng Thái": z.enum(["Chưa Nhận", "Đang Làm", "Hoàn Thành", "Thất Bại"]).prefault("Chưa Nhận"),
  "Mục Tiêu": z.array(z.object({
    "Mô Tả": safeString(),
    "Xong": z.boolean().prefault(false),
  })).prefault([]),
  "Phần Thưởng": safeString(),                 // AI/engine áp khi hoàn thành
  "Hạn Chót Turn": z.coerce.number().int().optional(),  // quest có hạn, quá hạn => Thất Bại
})).prefault({})
```
- Quest sinh từ: sự kiện (17.1), NPC giao (dựa quan hệ), diễn tiến cốt truyện Era (mục 8.2), hoặc mục tiêu chiến lược người chơi tự đặt.
- **Quest chuỗi & phân nhánh:** hoàn thành/thất bại 1 quest mở quest tiếp theo khác nhau (kiểu chọn phe trong Chiến Tranh Ngũ Vương dẫn tới các nhánh khác nhau). Engine theo dõi trạng thái, AI tường thuật; hạn chót tạo áp lực thời gian.

### 17.3 Cột mốc lịch sử (Timeline Beats)
- Mỗi Era (mục 8.2) có chuỗi **cột mốc lịch sử canon** gắn năm cụ thể (vd Chiến Tranh Ngũ Vương: "Ned Stark bị xử tử", "Trận Blackwater", "Đám cưới Đỏ"). Khi game-time chạm năm đó, engine trigger cột mốc.
- Chế độ "Theo Sát Nguyên Tác" (mục 8.3): cột mốc xảy ra gần đúng canon trừ khi người chơi chủ động can thiệp (cứu được Ned nếu đủ mạnh/mưu). Chế độ "Diễn Giải Tự Do": cột mốc chỉ là gợi ý mềm, thế giới trôi theo hành động người chơi. Đây là điểm giao giữa "thế giới có sẵn" và "người chơi viết lại lịch sử".

### 17.4 UI Sự kiện, Nhật ký & Dòng thời gian ([icon:nhật-ký])

**Sự kiện ngẫu nhiên khi trigger** (mục 17.1): hiện qua thẻ ngữ nghĩa ngay trong luồng chat (thường `<event_popup>` — banner nổi bật, hoặc `<raven_scroll>` nếu là tin từ xa). Cấu trúc thẻ:
- Tiêu đề + mô tả tình huống (AI tường thuật sống động), minh hoạ nhẹ nếu có.
- **2-4 nút lựa chọn**, mỗi nút hé lộ hướng hệ quả nhưng không lộ hết ("Cho dân tị nạn vào thành — nhân từ nhưng tốn lương"). Nếu lựa chọn có **kiểm định** (`resolveCheck`, 5bis), hiện rõ loại việc + **% thành công đã tính** kèm breakdown ("Thuyết phục đám đông — ~62% · nền 50, Uy Tín +12, Hảo Cảm +8, độ khó −18") để người chơi cân nhắc rủi ро trước khi chọn.
- Chọn xong → animation xúc xắc nếu có skill check (tạo hồi hộp) → áp patch → AI kể kết quả. Sự kiện đã xử lý lưu vào Nhật ký để xem lại.

**Journal ([icon:nhật-ký]) — 3 khu:**
- **Nhiệm Vụ:** 3 tab (Đang Làm / Hoàn Thành / Thất Bại). Mỗi quest: tiêu đề, loại (badge màu theo Cốt Truyện/Phụ/Chính Trị/Quân Sự...), **checklist mục tiêu con** (tick dần, thanh tiến độ), phần thưởng, và **đồng hồ đếm ngược** nếu có hạn chót (đỏ khi sắp hết). Quest nổi bật nhất ghim lên QuestTracker ở status panel (mục 6). Bấm quest → chi tiết + nút "chỉ đường" (nếu mục tiêu gắn địa điểm → mở bản đồ).
- **Biên Niên Sử (nhật ký tự động):** dòng thời gian các sự kiện lớn đã xảy ra trong ván chơi của người chơi (thắng trận, chiếm đất, hôn nhân, phản bội, NPC chết...) — engine tự ghi mỗi khi có sự kiện đáng kể, tạo thành "câu chuyện của riêng ngươi" để đọc lại. Đây là thứ khiến mỗi ván chơi thành một thiên truyện độc nhất.
- **Dòng Thời Gian Canon (mục 17.3):** trục thời gian các cột mốc lịch sử của Era đang chơi — cột mốc đã qua (đánh dấu đã xảy ra / đã bị người chơi thay đổi), cột mốc sắp tới (mờ, kèm năm dự kiến). Cho người chơi thấy mình đang đứng ở đâu trong dòng chảy lịch sử và điều gì sắp đến — biết trước "Đám cưới Đỏ" sắp xảy ra tạo sức nặng kịch tính, và cảm giác thoả mãn khi ngăn được nó.

**Mobile:** Journal là màn full-screen với tab ngang; sự kiện popup chiếm giữa màn hình, nút lựa chọn to dễ chạm.

---

## 18. Âm nhạc & Âm thanh (Audio)

Người dùng muốn có nhạc. Âm nhạc nâng tầm nhập vai rất mạnh — làm đúng thì tạo không khí điện ảnh khớp với thẩm mỹ cao cấp của app. Tham khảo audio player đã có trong card "Đế Quốc La Mã Thần Thánh" (có player với tracklist, điều chỉnh âm lượng, hiệu ứng phát sáng theo nhịp bass) — nhưng nâng thành hệ thống nhạc động theo ngữ cảnh.

### 18.1 Nhạc nền động theo ngữ cảnh (Adaptive BGM)
- **Nhạc đổi theo tình huống hiện tại của game** thay vì 1 track lặp đơn điệu. Engine đọc state/ngữ cảnh và chọn playlist phù hợp:
  | Ngữ cảnh (từ state) | Không khí nhạc |
  |---|---|
  | Ở lãnh địa yên bình, quản lý/xây dựng | Yên ả, trầm ấm, dây/harp nhẹ |
  | Trong triều đình, chính trị | Trang nghiêm, quý tộc, hồi hộp ngầm |
  | Đang mưu đồ/tình báo (mục 14) | Tối, căng, tiếng thì thầm/nhịp chậm |
  | Chuẩn bị/trong chiến tranh (mục 7,12) | Trống trận, hùng tráng, dồn dập |
  | Sự kiện bi kịch (NPC chết, phản bội, nạn đói) | Buồn, bi tráng |
  | Mùa đông khắc nghiệt / phương Bắc | Lạnh lẽo, cô tịch, gió |
  | Khoảnh khắc chiến thắng/đăng quang | Vinh quang, cao trào |
- **Chuyển mượt (crossfade):** khi ngữ cảnh đổi, fade out track cũ + fade in track mới trong 2-4s, không cắt đột ngột. Tránh đổi nhạc quá nhạy (giật liên tục mỗi turn) — dùng ngưỡng/debounce, chỉ đổi khi không khí thực sự chuyển.
- **Theo Nhà/vùng miền (tuỳ chọn hay):** có thể thêm sắc thái nhạc theo Nhà đang phục vụ hoặc vùng đang ở (phương Bắc khác Dorne), đồng bộ với theme pack mục 6.

### 18.2 Nguồn nhạc & kỹ thuật
- **Cấu trúc playlist:** mỗi "không khí" (mood) map tới 1 danh sách track:
```ts
interface MusicTrack { id: string; title: string; src: string; mood: MoodTag; }
type MoodTag = "peace" | "court" | "intrigue" | "war" | "tragedy" | "winter" | "victory";
// engine: chọn track theo mood hiện tại, phát ngẫu nhiên trong nhóm, crossfade khi đổi mood
```
- **Nguồn:** dùng nhạc người dùng tự cung cấp (đặt vào `content/audio/` hoặc cấu hình URL), hoặc nhạc có giấy phép phù hợp (royalty-free/CC — **kiểm tra giấy phép**, không nhúng nhạc bản quyền của loạt phim/game khác). Thiết kế để **cắm nhạc vào là chạy**: chỉ cần khai báo track + mood trong config, không sửa engine. Trong lúc chưa có nhạc thật, hệ thống vẫn build/test được (im lặng hoặc track placeholder).
- **Kỹ thuật:** Web Audio API hoặc thẻ `<audio>` với quản lý crossfade; preload/lazy-load hợp lý để không tốn băng thông; tự dừng/tiếp khi tab ẩn/hiện.

### 18.3 Âm thanh hiệu ứng (SFX) — tuỳ chọn, tinh tế
- SFX nhẹ cho hành động chính: gửi tin nhắn (tiếng bút lông/giấy khẽ), mở modal quan trọng (tiếng ấn triện/chim ưng), thắng/thua trận, nhận vàng, cảnh báo khủng hoảng. **Giữ tối giản và sang** — vài âm tinh tế, âm lượng thấp, không lố; hợp tông trầm của app. SFX quá nhiều/lố sẽ phá cảm giác cao cấp y như emoji.

### 18.4 UI điều khiển nhạc
- **Player nhỏ gọn kính mờ** (góc màn hình hoặc trong Settings): nút phát/dừng, tên track đang phát, thanh âm lượng, nút tắt toàn bộ âm thanh. Có thể thu thành 1 icon SVG nốt nhạc nhỏ, bấm mới mở rộng.
- **Trong Settings > Appearance/Audio:** bật/tắt riêng Nhạc nền và SFX, chỉnh âm lượng từng loại, tuỳ chọn "nhạc theo ngữ cảnh" hay "1 playlist cố định".
- Tôn trọng chính sách autoplay của trình duyệt: chỉ phát nhạc sau tương tác đầu tiên của người dùng (vd sau khi bấm "Bắt Đầu" ở menu), không tự động phát ngay khi tải trang.

---

## 19. Chức năng chat & phụ trợ

### 19.1 Reroll (tạo lại phản hồi) — chi tiết

Người chơi phải được phép **reroll**: yêu cầu AI tạo lại phản hồi cho lượt vừa rồi khi không ưng ý (văn phong, hướng diễn biến, kết quả...). Đây là tính năng cốt lõi của trải nghiệm nhập vai.

- **Cơ chế cơ bản:** mỗi tin nhắn của AI có nút **Reroll**; bấm → gọi lại AI với **cùng ngữ cảnh (prompt) như lần sinh ra tin nhắn đó**, ra một phiên bản mới. Giữ **lịch sử các bản** (swipe qua lại giữa các lần reroll, dạng "1/3 ‹ ›") để người chơi so sánh và chọn bản ưng nhất, không mất bản cũ.
- **Chọn bản nào thì bản đó thành chính thức:** phiên bản đang chọn (active) là cái được dùng làm ngữ cảnh cho các lượt sau. Đổi lựa chọn giữa các bản reroll thì mạch truyện tiếp theo tính từ bản đang chọn.
- **XỬ LÝ QUAN TRỌNG — reroll phải hoàn tác thay đổi state của lượt đó (gắn với luồng 2 lượt mục 6.2):** vì mỗi phản hồi AI kèm khối `mvu_update` làm đổi bảng trạng thái (HP, vàng, quan hệ...), khi reroll phải:
  1. **Rollback** các thay đổi state mà bản phản hồi cũ đã áp (khôi phục snapshot state trước lượt đó).
  2. Sinh phản hồi mới → áp `mvu_update` mới của nó.
  → Nếu không rollback, reroll sẽ cộng dồn thay đổi nhiều lần (vd HP bị trừ 2-3 lần cho cùng 1 trận). **Bắt buộc lưu snapshot state trước mỗi lượt** để rollback được. Mỗi bản reroll gắn với snapshot state tương ứng của nó; đổi bản active thì state cũng khôi phục theo đúng bản đó.
  3. Nếu lượt đó có **kích hoạt hệ thống chuyên** (chiến đấu/sự kiện — mục 6.2): reroll cũng hoàn tác kết quả hệ thống đó. Tuỳ chọn thiết kế: cho phép reroll **giữ nguyên kết quả cơ chế** (đã tính bằng seed, công bằng) mà chỉ đổi lời văn tường thuật, HOẶC reroll cả kết quả (tính lại trận). Nên cho người chơi lựa chọn "reroll lời kể" vs "đánh lại từ đầu" ở tình huống này, vì có người chỉ muốn đổi văn phong chứ không muốn đổi thắng thành thua.
- **Reroll khác seed:** nếu đang đặt `seed` cố định (mục 2.2), reroll nên tự đổi seed (hoặc bỏ seed) cho lần tạo lại, nếu không API trả lại y hệt. Cho tuỳ chọn giữ nguyên các tham số khác.
- **Kết hợp với retry:** nếu bản reroll lại gặp lỗi API, áp dụng auto-retry (mục 2.3) như mọi lời gọi khác.
- **Edit + reroll:** người chơi cũng sửa được tin nhắn của mình rồi reroll để AI phản hồi lại theo nội dung đã sửa (cùng cơ chế rollback state).

### 19.2 Các chức năng chat khác
- Streaming, edit message, branching (tạo nhánh mới từ 1 điểm, cây hội thoại xem được dạng list các branch), continue (tiếp tục câu chưa xong), delete message (xoá kèm rollback state của (các) lượt bị xoá — cùng cơ chế snapshot ở 19.1).
- Save/load nhiều slot (đặt tên, thumbnail tự động = tóm tắt AI của đoạn gần nhất), auto-save, export/import JSON.
- Quest/Journal: mỗi quest có trạng thái (chưa nhận/đang làm/hoàn thành/thất bại), gắn với MVU state qua patch khi hoàn thành.
- Faction standing tracker, time/calendar + sự kiện định kỳ (vd khi diễn biến trôi tới mùa đông thì trigger 1 lorebook entry đặc biệt).
- NPC memory: RAG nhẹ (TF-IDF trước, có thể nâng cấp embedding sau) trên lorebook + tóm tắt tự động các đoạn hội thoại cũ (AI tóm tắt định kỳ, lưu summary thay vì raw để tiết kiệm context).
- Token counter realtime khi gõ (dùng tokenizer ở mục 1).
- TTS tùy chọn qua Web Speech API.
- Toggle NSFW (preset jailbreak) — có cảnh báo rõ ràng + xác nhận khi bật lần đầu.

---

## 20. Lưu trữ dữ liệu (Dexie / IndexedDB schema)

```ts
class GameDB extends Dexie {
  chats!: Table<ChatSession>;
  messages!: Table<ChatMessage>;
  lorebooks!: Table<LorebookFile>;
  presets!: Table<PresetFile>;
  characters!: Table<CharacterCard>;
  saveSlots!: Table<SaveSlot>;
  chapterSummaries!: Table<ChapterSummary>;   // T3 trí nhớ — tóm tắt lũy tiến (mục 16bis.2)
  npcPortraits!: Table<NpcPortrait>;           // ảnh chân dung NPC dạng Blob (mục 5.1c)

  constructor() {
    super("asoiaf_rpg_db");
    this.version(2).stores({    // bump version + migrate (thêm 2 bảng mới)
      chats: "id, characterId, createdAt, updatedAt",
      messages: "id, chatId, turnIndex, role, summarized",   // thêm cờ đã-tóm-tắt (16bis.2)
      lorebooks: "id, name",
      presets: "id, name",
      characters: "id, name, house",
      saveSlots: "id, chatId, slotName, createdAt",
      chapterSummaries: "id, chatId, turnRangeStart, tier, yearInStory",  // tier 1/2 (tóm tắt cấp 1, gộp cấp 2)
      npcPortraits: "id, npcId, chatId",         // Blob ảnh + thumbnail
    });
  }
}
```
- `SaveSlot` lưu snapshot đầy đủ: `mvuState` (bao gồm **toàn bộ** state của mọi hệ thống — Lãnh Địa, Biên Chế Quân Sự, Tướng Lĩnh, Hạm Đội, Tiểu Hội Đồng, Tình Báo, Âm Mưu, Con Tin, Kinh Tế Vùng, Tuyến Thương Mại, Danh Tiếng, Nhiệm Vụ... vì tất cả đều nằm trong cùng `StatDataSchema` mở rộng ở mục 5/7/10-17), `messages[]` (hoặc reference), **`chapterSummaries[]` + `npcPortraits[]` (4 tầng trí nhớ mục 16bis — để tải lại ván sau nhiều ngày khôi phục TOÀN BỘ trí nhớ, không chỉ chat thô)**, `metadata` (era đang chơi, turn count, thời điểm lưu, thumbnail text) — dùng trực tiếp để hiển thị danh sách "Tiếp Tục" ở Main Menu (mục 8.1).
- **Mỗi `ChatMessage` của AI lưu kèm:** danh sách các bản reroll (`variants[]` — nội dung + `mvu_update` của từng bản) + chỉ số bản đang chọn (`activeVariant`), và **snapshot `mvuState` trước lượt đó** (`stateBefore`) để rollback khi reroll/xoá (mục 19.1, 5.3). Nhờ vậy reroll/undo hoạt động cả sau khi load lại save.
- **Lưu ý migration:** vì schema MVU sẽ phình dần qua các milestone, đặt `schemaVersion` trong mỗi save + viết hàm migrate nhẹ (bơm field mới bằng `.prefault` khi load save cũ) để save từ milestone trước không vỡ khi mở ở bản mới.
- Dữ liệu Era (mục 8.2) là seed content tĩnh đóng gói trong code, **không cần lưu DB** — chỉ state runtime (lãnh địa, quân đội, quan hệ...) mới cần persist.
- Export JSON = serialize toàn bộ 1 `SaveSlot` + `CharacterCard` liên quan → 1 file `.json` duy nhất, import lại parse ngược, validate bằng Zod trước khi ghi vào DB (không tin file import mù quáng).

---

## 21. Onboarding & Settings UX

- Lần đầu mở app: đi thẳng vào Main Menu (mục 8.1) — không cần wizard onboarding riêng, vì New Game đã tự nhiên dẫn dắt người chơi qua toàn bộ setup cần thiết (API config chỉ bắt buộc nhập khi thực sự cần gọi AI, có thể nhắc nhẹ nếu chưa cấu hình lúc bấm Bắt Đầu Mới).
- Settings chia tab rõ: **Connection** (API/model, **số lần auto-retry 3–10 và timeout — mục 2.3**, tuỳ chọn reroll như đổi seed/reroll lời kể vs đánh lại — mục 19.1), **Prompt** (preset/macro), **Lore** (nạp/chỉ định nguồn lore người dùng cung cấp — mục 4.3, không phải editor), **Gameplay** (**Độ Khó Chiến Đấu: Nhàn Hạ/Cân Bằng/Chân Thực — mục 7.9.6**; **Hướng Kịch Bản: Người Chơi Là Trung Tâm/Bối Cảnh + Chế Độ Tường Thuật: Theo Sát/Tự Do — mục 8.3**; các cài này lưu trong `Cài Đặt Ván` (5.1), đổi được giữa chừng; toggle NSFW; auto-save interval — *không* cho đổi Thời Kỳ giữa chừng 1 save vì phá vỡ tính nhất quán lore, muốn đổi phải tạo save mới), **Trí Nhớ** (**ngưỡng kích hoạt tóm tắt lũy tiến, độ dài chat thô giữ nguyên văn, nút Xem/Sửa Tóm Tắt + mở Codex, bật/tắt kiểm tra mâu thuẫn nhẹ — mục 16bis.2/16bis.6**), **Appearance** (theme pack theo Nhà, ngôn ngữ — mọi theme đều tuân ràng buộc mỹ thuật, chỉ đổi tông accent giảm bão hoà giữa các Nhà), **Audio** (bật/tắt + âm lượng riêng Nhạc nền và SFX, chế độ nhạc theo ngữ cảnh vs playlist cố định — mục 18.4), **Data** (export/import/xoá toàn bộ dữ liệu, **export kèm 4 tầng trí nhớ + ảnh NPC — mục 20**).
- Nút "Reset về mặc định" ở từng tab riêng, không có nút reset toàn cục để tránh xoá nhầm.

---

## 22. Hiệu năng & Accessibility

- Virtualize danh sách tin nhắn dài (`react-window` hoặc tương đương) để chat hàng trăm turn không lag.
- Ảnh bản đồ (mục 9) nên tối ưu kích thước/định dạng (webp, hoặc chia tile nếu ảnh quá lớn) — tránh load 1 ảnh khổng lồ trên mobile; Leaflet hỗ trợ tile layer sẵn nếu cần chia nhỏ sau này.
- Debounce việc lưu Dexie khi gõ settings (không ghi DB mỗi keystroke).
- Web Worker cho: token counting của prompt dài, RAG/TF-IDF search, tính toán turn advance (xây dựng/di chuyển quân/vây thành mục 10-12 nếu state lớn) — tránh block UI thread khi streaming đang chạy.
- Accessibility tối thiểu: contrast đủ ở dark theme, focus visible rõ ràng, modal/drawer có `aria-*` cơ bản, hỗ trợ điều hướng bằng bàn phím cho các action chính (gửi tin nhắn = Enter, xuống dòng = Shift+Enter).

---

## 23. Bảo mật & quyền riêng tư

- API key **không bao giờ** log ra console dạng plaintext, luôn mask khi hiển thị.
- Toàn bộ dữ liệu (key, chat, save) chỉ lưu client-side (localStorage/IndexedDB) — không gửi đi đâu ngoài Base URL người dùng tự cấu hình.
- Sanitize mọi HTML render từ AI output (DOMPurify) trước khi đưa vào DOM, kể cả trong EJS template render.
- Cảnh báo rõ khi bật CORS proxy tùy chỉnh: dữ liệu sẽ đi qua proxy đó, người dùng tự chịu trách nhiệm chọn proxy tin cậy.

---

## 24. Kiến trúc thư mục & chất lượng code

```
src/
  api/            # gọi API, streaming (SSE parser), auto-retry 3-10 lần + backoff/jitter + rotate key (mục 2.3), provider adapters
  preset/         # import preset ST (3.1b): presetSchema (validate mềm), marker resolver (8 marker), macro→MVU bridge, buildFromPreset (prompt_order + injection_depth + prefill), round-trip export
  prompt/         # prompt builder + macro engine (registry) + prompt inspector
  lorebook/       # nạp lore người dùng cung cấp + trigger engine + recursion guard + token budget + EJS engine (getvar/getwi, mục 5.5b) — mục 4.3, KHÔNG có UI editor
  mvu/            # zod schema (character + territory + military + court + intrigue + economy + npc + quest) + patch engine + narrative tag parser
  probability/    # HỆ XÁC SUẤT THỐNG NHẤT (5bis): rng seedable + streams, resolveCheck (kiểm định chung d100), checkMap (bảng ánh xạ việc→chỉ số/kỹ năng 5bis.2b), thang DC + bậc kết quả, weightedPick (bảng trọng số động) — mọi hệ thống gọi chung, engine giữ số
  combat/         # dice/RNG seedable, chiến thuật 1v1 (7.1-7.3), giao tranh (7.13), battleResolver phán định chuẩn hoá + độ khó (7.9), troopMatchup ma trận binh chủng 4 lớp (7.9.2b), địa hình/thời tiết (7.6), tướng lĩnh (7.7), hải chiến (7.8), rồng/siêu nhiên (7.15) — engine giữ số, thuần & test được bằng seed; DÙNG CHUNG lõi RNG của probability/
  strategy/       # turn-advance loop tổng: xây dựng (10), quân (11), vây thành/war score (12), kinh tế (15), sự kiện (17)
  intrigue/       # gián điệp, âm mưu, ám sát, con tin (14)
  economy/        # tài nguyên vùng, tuyến thương mại, thuế, khủng hoảng (15)
  npc/            # NpcSchema chi tiết (5.1b), affinityStage giai đoạn hảo cảm (5.1d), tuổi tác động theo Năm (5.1e), chân dung/portrait store Dexie (5.1c), trí nhớ + tính cách động + off-screen + danh tiếng (16)
  memory/         # trí nhớ dài hạn chống quên (16bis): 4 tầng, rolling summarization (worker), state renderer cho AI, prioritized context budget, Codex data provider, continuity anchors
  events/         # engine sự kiện ngẫu nhiên + quest + timeline beats (17)
  map/            # Leaflet/react-leaflet integration, MapRegion/MapMarker config, layer components + history replay slider + fog SVG mask (9)
  court/          # logic bổ nhiệm, phiên họp triều, hôn nhân/kế vị (13)
  audio/          # adaptive BGM engine + crossfade + mood mapping (18.1-18.2), SFX (18.3), audio store
  state/          # zustand stores (theo domain) + Dexie persistence layer + DB schema + migration
  content/
    westeros/
      eras/       # dữ liệu từng Thời Kỳ (Nhà khả dụng, canon roster, starting hooks, timeline beats)
      houses/, locations/, calendar/
      talents.ts  # NGÂN HÀNG THIÊN PHÚ (5.1f-C/5.1g): ALL_TALENTS 7 nhóm + availableTalents(), effect chuỗi máy-đọc
      skills.ts   # NGÂN HÀNG KỸ NĂNG (5.1f-D/5.1g): SKILLS 6 nhóm + availableSkills() + STARTING_SKILLS_BY_ORIGIN
      talents/skills gate theo Era + xuất thân + thiên phú — thả sửa file này, engine đọc runtime
      houseColors.ts, startingCrises.ts, terrainAffinity.ts, narrativeTags.ts, checkMap.ts
      events/     # pool sự kiện ngẫu nhiên
      lore/       # lore người dùng cung cấp (nạp vào engine mục 4.3) — thả file vào đây
      assets/     # ảnh bản đồ (map.*) khi có
    audio/        # nhạc theo mood + SFX (khi có) — thả file vào đây
  ui/
    theme/        # CSS variables + design tokens (glass-bg, blur, accent-desaturated, gradient-base...) — mục mỹ thuật đầu prompt
    icons/        # thư viện icon SVG dùng chung (React component, nhận size/color/strokeWidth) — thay toàn bộ emoji
    sigils/       # huy hiệu các Nhà vẽ bằng SVG
    components/   # button, modal, drawer, slider... kính mờ dùng chung
    panels/       # status + sub-panel (6), territory (10.4), court (13.5), intrigue (14.5), economy (15.5), quest/journal (17.4), combat UI (11.6), audio player (18.4)
    layout/       # game screen 3-cột PC / 1-cột mobile (6.1), left rail / bottom nav, action deck (6.3), turn feedback toast/animation (6.4)
    menu/         # main menu, new game flow, character creation wizard
  i18n/
  workers/        # web worker: tokenizer, lore trigger/RAG search, turn-advance calculation
  types/
```
- Unit test (Vitest) cho: macro resolver, lorebook trigger (bao gồm case đệ quy giới hạn + token budget), EJS engine (getvar đọc đúng state, if-else chọn đúng nhánh, getwi nạp đúng entry con, entry lỗi cú pháp không sập prompt — mục 5.5b), auto-retry (retry đúng số lần cấu hình 3-10, backoff tăng dần, xoay key mỗi lần, không retry lỗi vĩnh viễn, dừng đúng khi hết lượt — mục 2.3), reroll rollback (state khôi phục đúng snapshot trước lượt, reroll không cộng dồn thay đổi, đổi bản active khôi phục đúng state bản đó — mục 19.1/5.3), MVU patch apply (5 loại op), Zod schema validate + tự phục hồi, combat formula (to-hit/damage/crit), field battle resolution (mục 7.5, seed cố định), terrain multiplier, general modifier + phản trắc, construction/turn-advance loop, army movement, siege resolution, spy/plot progression (mục 14, đúng ngưỡng bại lộ), trade route profit + phong toả, tax/loyalty tradeoff, crisis trigger (nạn đói/nổi loạn), NPC memory injection ordering, random event weighted pick (mục 17), quest state machine, adaptive music mood selection (mục 18, đổi đúng mood theo state + crossfade không giật), prompt-builder ordering + cắt context budget, token counter, export/import save round-trip + migration schema cũ.
- Lint + format: ESLint + Prettier, `strict`, `noImplicitAny`, `strictNullChecks` bật.
- Error boundary React ở cấp app + cấp từng panel lớn (status panel/combat panel/map panel lỗi không kéo sập toàn bộ chat).
- **Kiểm thử mỹ thuật:** thêm 1 lint/check đơn giản quét codebase phát hiện emoji lọt vào JSX/string UI (fail CI nếu có), đảm bảo ràng buộc "không emoji" được giữ suốt vòng đời dự án.

---

## 25. Thứ tự build (milestone) — kèm sub-task & acceptance criteria

**Milestone 1 — Khung app + cấu hình API + scan model + chat streaming + auto-retry**
- Sub-task: dựng Vite+React+TS skeleton → Zustand store cơ bản → form connection → provider adapter (ít nhất OpenAI-compat) → SSE streaming parser → **auto-retry 3-10 lần + backoff + rotate key + ô cấu hình số lần (mục 2.3)** → khung chat UI responsive.
- Acceptance: nhập Base URL + key, Scan Models chạy được, Test Connection báo đúng trạng thái, gửi tin nhắn và nhận streaming response hiển thị realtime, **gọi lỗi tạm thời (429/timeout) tự thử lại đúng số lần cấu hình với trạng thái "đang thử lại (n/N)" và nút huỷ, hết lượt thì báo lỗi rõ + nút thử lại thủ công**, UI dùng được cả mobile viewport lẫn desktop.

**Milestone 2 — Import preset + prompt builder + macros + prompt inspector**
- Sub-task: **parser + validate mềm file preset ST (presetSchema 3.1b.1, passthrough giữ field lạ)** → macro registry + 10+ macro cơ bản → **họ macro state ST nối MVU store: setvar/getvar/addvar/incvar/setglobalvar (3.1b.3)** → **8 marker resolver: worldInfoBefore/After, charDescription, charPersonality, personaDescription, scenario, dialogueExamples, chatHistory (3.1b.2)** → **buildFromPreset theo `prompt_order` + injection_position/depth/order + assistant_prefill (3.1b.4)** → context budget cutter → **round-trip export (3.1b.5)** → Prompt Inspector UI.
- Acceptance: **import 1 file preset ST thật phức tạp (vd ~180 prompts, marker + macro state dày đặc) → không crash, field lạ giữ nguyên; prompt builder ghép đúng thứ tự `prompt_order`, 8 marker được điền đúng nội dung động (world info vào worldInfoBefore/After, lịch sử vào chatHistory), macro setvar/getvar đọc-ghi đúng MVU store theo thứ tự block, block injection_position=1 chèn đúng độ sâu trong chat, prefill áp đúng; export lại mở được ở SillyTavern gốc (round-trip)**; Prompt Inspector hiện đúng payload cuối + token count + marker nào điền gì; macro test coverage đầy đủ.

**Milestone 3 — Lorebook engine (nạp lore + trigger + EJS động, KHÔNG xây UI quản lý)**
- Sub-task: parser lorebook JSON (định dạng ST world_info/character_book) → matcher keyword (AND/OR/NOT) → recursion engine có giới hạn vòng → **EJS engine với getvar/getwi/if-else + async (mục 5.5b)** → gộp nhiều nguồn lore → quản lý ngân sách token → debug panel ẩn cho dev (mục 4.3).
- Acceptance: nạp được lore mẫu (nhiều nguồn gộp đúng theo insertion_order), entry selective kích hoạt đúng theo keyword và inject đúng vị trí/thứ tự vào prompt, **EJS render đúng: entry điều kiện hóa theo biến state chọn đúng nhánh nội dung (test bộ điều khiển đa giai đoạn theo 1 chỉ số), `getwi` nạp đúng entry con, entry EJS lỗi cú pháp không làm sập prompt**, vượt ngân sách token thì cắt đúng ưu tiên, debug panel (chỉ dev) hiện đúng entry active + lý do, test đệ quy không vòng lặp vô hạn. Không cần bất kỳ màn hình chỉnh sửa lorebook nào cho người chơi.

**Milestone 4 — MVU-ZOD engine + Layout game screen + status panel + reroll + semantic tag renderer**
- Sub-task: định nghĩa schema mẫu (mục 5.1) → **hệ xác suất thống nhất: lõi RNG seedable + streams + `_Seed Gốc`, `resolveCheck` (kiểm định d100 chung) + `checkMap` (bảng ánh xạ việc→chỉ số/kỹ năng 5bis.2b), thang DC + 5 bậc kết quả, `weightedPick` (mục 5bis)** → patch parser 5 loại op → **extractor lọc an toàn (bỏ op ghi field `_`/nhãn bậc/kết quả engine — mục 5.4c)** → validate + auto-recover → **snapshot state per-turn (5.3)** → **nạp prompt hướng dẫn AI cập nhật bảng `[mvu_update]` (mục 5.4b, entry constant)** → **stateRenderer: format state thành khối tiếng Việt dễ đọc cho AI, chi tiết giảm dần theo liên quan (5.7.3)** → **hiệu ứng lan toả sau patch: affinityStage/tuổi/danh tiếng→Thái Độ (5.7.4)** → **layout 3 cột PC / 1 cột mobile (mục 6.1)** → status panel component (mục 6) → **vòng đời turn + Action Deck cơ bản (6.2-6.3)** → **reroll + swipe giữa các bản + rollback state (mục 19.1)** → phản hồi trực quan state đổi (6.4) → parser thẻ ngữ nghĩa (5.6, tối thiểu `<raven_scroll>` + `<event_popup>` + ẩn JSON patch).
- Acceptance: `initvar` khởi tạo đúng, AI trả patch → state cập nhật đúng qua cả 5 loại op, schema lỗi không crash app, layout responsive đúng trên cả PC/mobile, thời gian trôi theo diễn biến AI kể (AI báo N ngày trôi → `onTurnAdvance()` chạy đúng N lần; hội thoại ngắn không kể thời gian → không tick) đúng triết lý mục 6.2, **reroll tạo bản mới + swipe qua lại giữa các bản được, và rollback state đúng (reroll 1 lượt nhiều lần KHÔNG cộng dồn thay đổi state — vd HP chỉ trừ 1 lần)**, Action Deck hiện nút theo ngữ cảnh cơ bản (không có nút tua thời gian), số đổi có animation/toast, Status Panel realtime đúng, JSON patch bị ẩn, 1 thẻ ngữ nghĩa render đúng component riêng; **HỆ XÁC SUẤT: `resolveCheck` cho cùng kết quả với cùng seed (test tái lập), 5 bậc kết quả phân đúng theo roll vs target, roll ≤5 luôn ≥ Đại Thành Công & roll ≥96 luôn Đại Thất Bại (không bao giờ 0%/100%), modifier gom đúng từ chỉ số+kỹ năng+thiên phú+quan hệ+độ khó (breakdown minh bạch), streams tách biệt (reroll trận đánh KHÔNG đổi kết quả kiểm định xã hội cùng lượt), `weightedPick` tôn trọng điều kiện + trọng số động theo state; **`checkMap` tra đúng cặp (chỉ số, kỹ năng) cho mỗi việc (test: `persuade`→Uy Tín+Thuyết Phục, `sneak`→Nhanh Nhẹn+Ẩn Nấp), opposed check tính DC động từ chỉ số đối phương, kỹ năng chưa học (cấp 0) vẫn check được bằng chỉ số trần, việc lạ ngoài bảng có fallback không kẹt)**; **CẬP NHẬT BẢNG ĐÚNG: AI đọc được state qua khối render (5.7.3) và tuân prompt 5.4b — test: AI trả `<UpdateVariable>` khớp lời kể (kể nhận vàng → delta Vàng đúng), AI KHÔNG ghi được field `_` (extractor lọc, verify state không đổi khi AI cố ghi `_Seed`), AI KHÔNG tự đặt nhãn Giai Đoạn (engine dẫn xuất), thời gian trôi trong lời kể → AI báo delta Ngày → onTurnAdvance tick; state mâu thuẫn chat thì lời kể theo state (test: NPC Thù Địch không bị kể như bạn cũ)**; **vòng khép kín 5.7.6: hậu quả lượt N hiện trong state lượt N+1 và được render lại vào prompt (test: đổi Hảo Cảm lượt này → lượt sau AI thấy nhãn bậc mới trong khối state)**.

**Milestone 5 — Main Menu, Thời Kỳ & Tạo nhân vật**
- Sub-task: seed data Era (mục 8.2) + Houses/địa danh/lịch (8.7) + **ngân hàng thiên phú `talents.ts` + kỹ năng `skills.ts` (5.1g, gate Era/xuất thân/thiên phú)** → **schema nhân vật đầy đủ: 6 chỉ số cốt lõi + phái sinh + thiên phú + kỹ năng có cấp + trang bị theo slot (mục 5.1f)** → Main Menu UI (8.1) → luồng New Game (8.3) → **tuyến đóng vai nạp chỉ số canon đầy đủ (8.4b)** + **tuyến tự tạo/wizard 10 bước: xuất thân → point-buy 6 chỉ số → chọn thiên phú (+ khiếm khuyết đổi điểm) → phân bổ kỹ năng → trang bị khởi đầu → persona + ảnh → danh vọng + khủng hoảng → tâm phúc → hook → preview (8.5)** → **flow xác nhận nạp đủ chỉ số + engine tính phái sinh + parseEffect thiên phú (8.6/8.6b)**.
- Acceptance: Main Menu hiện đúng 3 lựa chọn; "Tiếp Tục" hiện đúng danh sách save nếu có, disable nếu chưa có; chọn Bắt Đầu Mới → chọn Era → tuyến đóng vai hiện đúng roster lọc theo era **và nạp đủ chỉ số/thiên phú/trang bị canon (test: Ned có Ice thép Valyria + kỹ năng Kiếm/Chỉ Huy cao; Tyrion Trí Tuệ cao + khiếm khuyết Lùn)**; tuyến tự tạo chạy đúng wizard 10 bước với Houses lọc theo era; **point-buy cộng đúng tổng điểm cố định, hạ chỉ số lấy thêm điểm hoạt động, bonus xuất thân cộng sau; Chỉ Số Phái Sinh (HP tối đa/Phòng Thủ...) tự tính đúng từ cốt lõi+trang bị và cập nhật realtime trong preview; thiên phú ma thuật (Warg/Máu Rồng...) chỉ hiện khi Era+Nhà+xuất thân hợp lệ; kỹ năng nhóm Ma Thuật chỉ mở khi đã chọn thiên phú tương ứng; đồ Thép Valyria/Vô Giá KHÔNG mua được lúc tạo (chỉ tuyến canon có); quỹ điểm co giãn theo Độ Khó; hiệu ứng thiên phú dạng chuỗi được engine parse cộng đúng vào chỉ số (5.1f-C1); gói tài sản theo xuất thân nạp đúng vào state (Lãnh Chúa mở lãnh địa+quân+kinh tế, Thường Dân gần trắng tay); Khủng Hoảng Khởi Đầu + Tâm Phúc (nếu chọn) được đưa vào tin nhắn mở đầu; Hướng Kịch Bản + Chế Độ Tường Thuật lưu vào Cài Đặt Ván và đưa vào system prompt; Danh Vọng khởi điểm + bậc-hoá đúng (16.4)**; gán được ảnh chân dung nhân vật (lưu Dexie); xác nhận xong AI tự động kể mở đầu mà không cần người chơi gõ tin nhắn đầu tiên **và mọi phán định sau đó (combat/xã hội) đọc đúng chỉ số vừa tạo**.

**Milestone 6 — Hệ thống chiến đấu chiến thuật (luồng 2 lượt do AI dẫn dắt)**
- Sub-task: dice/RNG seedable → công thức combat 1v1 (mục 7.2) + Thế Đứng/Thể Lực (7.14) → **`battleResolver` phán định chuẩn hoá 4 hệ số + 2D6 nhiễu loạn + thang 7 bậc + thương vong/sĩ khí (mục 7.9)** → công tắc `CombatScaleSchema` + `Trận Đang Diễn` điều phối 3 tầng (7.12) → tầng Giao Tranh (7.13) → 3 mức Độ Khó (7.9.6) → nhận diện thẻ `<combat_trigger>` từ AI để mở chiến đấu (mục 6.2/7) → prompt bút pháp tường thuật (7.11) → combat UI + log → áp kết quả vào MVU state → lượt kế chèn kết quả vào prompt để AI tường thuật hậu quả qua `<battle_report>` (định dạng 7.10).
- Acceptance: AI kể tới tình huống chiến đấu → hệ thống kích hoạt đúng (không phải người chơi bấm nút từ hư không); 1 trận 1v1 chạy trọn từ đầu đến thắng/thua, kết quả số verify được bằng seed cố định (test tái lập); **1 trận Đại Chiến qua `battleResolver` ra đúng bậc thắng bại theo công thức, cùng seed cho cùng kết quả (test), 2D6 nhiễu loạn lật được một trận cận kề nhưng không lật nổi chênh lệch lớn**; **đổi Độ Khó (Nhàn Hạ/Cân Bằng/Chân Thực) làm dịch kết quả đúng hướng bằng test seed cố định**; nút "Tự Chỉ Huy / Giao Cho Tướng" hiện đúng khi quy mô ≥ Giao Tranh; EXP/vật phẩm/thương tích/quân số/tướng cập nhật đúng vào state ngay sau trận (quân chết trừ vĩnh viễn); **AI KHÔNG tự đổ xúc xắc hay tự quyết thắng bại — engine giữ số, verify bằng việc kết quả không đổi khi reroll cùng seed**; **lượt chat kế tiếp AI tường thuật diễn biến khớp với kết quả đã chốt (thắng thì kể thắng, không mâu thuẫn số) theo bút pháp 3 nhịp (bày trận → tiếp chiến → tĩnh bút)** — đúng luồng 2 lượt mục 6.2.

**Milestone 7 — Bản đồ tương tác + Lãnh địa & Công trình**
- Sub-task: tích hợp Leaflet/CRS.Simple với ảnh placeholder → **seed 9 vùng Westeros canon + trọng trấn + gate theo Era (9.6.1)** → MapRegion/MapMarker config + map editor vẽ polygon (9.6.2) → **`Chủ Quyền Lãnh Thổ` trong state + đồng bộ 2 chiều (9.5.1)** → **territory layer 2 chế độ tô màu: Chính Trị (theo Nhà) + Quan Hệ (heatmap theo Thái Độ) với toggle (9.5.2)** → **animation đổi màu khi chiếm/mất vùng (9.5.3) + bảng màu Nhà giảm bão hoà (9.5.4)** → schema Lãnh Địa (mục 10.1) → **UI Lãnh Địa đầy đủ 4 tab (mục 10.4)** → turn-advance loop cho thu/chi → Action Deck ngữ cảnh lãnh địa (6.3).
- Acceptance: bản đồ hiện được (kể cả dùng placeholder), zoom/pan mượt trên cả mobile, click 1 vùng mở đúng panel lãnh địa; **9 vùng canon hiện đúng Nhà cai trị theo Era (test: Crownlands là Targaryen ở Loạn Robert, Baratheon ở Chiến Tranh Ngũ Vương; Chinh Phạt Aegon chưa có King's Landing); chiếm 1 vùng (qua vây thành/đổi phe) → polygon vùng đó ĐỔI MÀU sang màu Nhà mới với animation + toast, state `Chủ Quyền Lãnh Thổ` cập nhật đồng bộ; toggle sang chế độ Quan Hệ → các vùng nhuộm đúng màu theo Thái Độ của Nhà kiểm soát với người chơi (đồng minh xanh, thù địch đỏ), và đổi màu khi Thái Độ đổi (test: sau liên minh, vùng chuyển cam→xanh); đổi ảnh nền/màu Nhà/vùng qua data file KHÔNG cần sửa code engine**; xây 1 công trình chạy qua hàng đợi turn và cộng đúng hiệu ứng khi xong, tài nguyên lãnh địa cập nhật đúng mỗi turn.

**Milestone 8 — Quân đội & Chiến tranh chiến lược cơ bản**
- Sub-task: mở rộng schema quân (mục 11.1) → **danh mục binh chủng đầy đủ thường/đặc biệt/siêu nhiên gated theo Era (11.2b)** → tương khắc loại quân + **ma trận `ưuKhuyếtBinhChủng` 4 lớp (7.9.2b)** → tuyển quân tại Doanh Trại (11.3) → di chuyển trên bản đồ (11.4) → **UI Quân Sự + điều quân trên bản đồ (mục 11.5)** → War Score + tuyên chiến (12.1) → siege loop (12.2).
- Acceptance: tuyển được quân tại lãnh địa có Doanh Trại, **chỉ tuyển/gặp được binh chủng thuộc Era đang chơi (test: Rồng không xuất hiện ở Loạn Robert, Voi Chiến không có trước Vũ Điệu Rồng)**; **ma trận binh chủng cho hệ số đúng hướng bằng test seed (giáo dài chấp kỵ binh, kỵ binh đè cung thủ trên đồng bằng, quân ô hợp đông không auto thắng quân tinh nhuệ ít)**; binh chủng đặc biệt kích rule Lớp 4 đúng (Dothraki mạnh đồng bằng/vô dụng công thành, Unsullied không sụp sĩ khí, Lính Đánh Thuê roll đổi phe khi không trả lương); di chuyển quân cập nhật đúng vị trí marker theo turn, tuyên chiến + vây 1 lãnh địa chạy hết turn dẫn đến đổi chủ đúng logic (test với viện binh và không viện binh), War Score cập nhật đúng sau 1 trận.

**Milestone 9 — Chiến tranh chuyên sâu (đại chiến, địa hình, tướng lĩnh, hải chiến)**
- Sub-task: công thức đại chiến field battle (mục 7.5) → bảng địa hình (7.6) → schema + modifier tướng lĩnh, phản trắc, bắt/tử trận (7.7) → hải chiến + đổ bộ + phong toả (7.8) → **UI Chiến trường khi tự chỉ huy (mục 11.6)** + panel so sánh lực lượng.
- Acceptance: 1 đại chiến 2 đội quân auto-resolve ra kết quả tái lập được bằng seed; đổi địa hình làm đổi kết quả đúng hướng bảng hệ số; tướng có đặc tính "Phản Trắc" + Trung Thành thấp trigger được sự kiện làm phản (test); 1 trận hải chiến + đổ bộ vây thành ven biển chạy trọn; tướng bại trận bị bắt thành Con Tin đúng logic.

**Milestone 10 — Cung đình + Hôn nhân/Kế vị**
- Sub-task: schema Tiểu Hội Đồng (mục 13.1) → UI bổ nhiệm có điều kiện quyền hạn (13.2) → phiên họp triều qua thẻ `<council_session>` (13.3) → hệ thống hôn nhân/kế vị (13.4) + khủng hoảng thừa kế → **UI Triều Đình: sơ đồ Tiểu Hội Đồng + cây kế vị (mục 13.5)**.
- Acceptance: bổ nhiệm được 1 chức vụ Tiểu Hội Đồng khi nhân vật có quyền (và bị chặn đúng khi không có quyền), Năng Lực người giữ chức ảnh hưởng đúng công thức liên quan (vd thu Vàng — có test), 1 phiên họp triều chạy qua thẻ `<council_session>` hiện đúng UI kèm lựa chọn; hôn ước chính trị nâng đúng Thái Độ Nhà đối tác; cái chết 1 lãnh chúa không người thừa kế trigger được khủng hoảng kế vị.

**Milestone 11 — Chính trị & Mưu đồ**
- Sub-task: schema Tình Báo/điệp viên (mục 14.1) → âm mưu + phe cánh (14.2) → ám sát/đầu độc/tống tiền (14.3) → con tin/tù binh (14.4) → **UI Mưu Đồ "phòng tối" 3 tab (mục 14.5)** → nối các loop này vào turn-advance.
- Acceptance: cài 1 điệp viên → thu được tin tình báo qua các turn, Bị Nghi Ngờ tăng đúng và trigger bị bắt khi đạt ngưỡng; 1 âm mưu chạy tới Tiến Độ 100 và resolve được; Độ Bại Lộ vượt ngưỡng làm mục tiêu phản đòn (test); tống tiền dùng tin tình báo mở được lựa chọn ép NPC; con tin đòi được tiền chuộc / trao đổi.

**Milestone 12 — Kinh tế & Thương mại nâng cao**
- Sub-task: tài nguyên/nhu cầu vùng + giá động (mục 15.1) → tuyến thương mại + lợi nhuận/an toàn (15.2) → thuế + ngân khố + Iron Bank (15.3) → khủng hoảng nạn đói/dịch/nổi loạn/mùa đông (15.4) → **UI Kinh Tế: bảng ngân khố + slider thuế preview + bảng thương mại (mục 15.5)**.
- Acceptance: giá hàng chênh giữa vùng dư và vùng thiếu đúng hướng; 1 tuyến thương mại sinh lợi nhuận mỗi turn, bị cắt về 0 khi cảng bị phong toả (nối mục 7.8); đổi mức thuế đổi đúng Vàng/turn và Trung Thành/turn theo bảng; để Lương Thực về 0 trigger nạn đói làm giảm Dân Số + Trung Thành; mùa đông kéo dài tiêu hao kho lương đúng cơ chế.

**Milestone 13 — Nhập vai & AI động**
- Sub-task: **NpcSchema chi tiết đầy đủ (5.1b) — chân dung/ảnh (5.1c), tuổi tác động theo Năm (5.1e), giai đoạn hảo cảm 8 bậc + ngưỡng cửa (5.1d), Tin Cậy tách khỏi Hảo Cảm** → trí nhớ NPC + inject vào prompt (mục 16.1) → tính cách động 4 trục (16.2) → mô phỏng NPC off-screen nhẹ (16.3) → danh tiếng đa chiều (16.4) → **hệ thống trí nhớ dài hạn 4 tầng + tóm tắt lũy tiến + ngân sách context ưu tiên + Codex (mục 16bis)**.
- Acceptance: **gán được ảnh chân dung cho NPC (upload → lưu Dexie → hiện avatar kính mờ ở Relationships/chat, fallback SVG khi thiếu ảnh), export/import save round-trip không mất ảnh**; **Hảo Cảm vượt ngưỡng tự đổi Giai Đoạn Quan Hệ + toast + mở/khoá đúng hành động theo bậc (test: đạt Tri Kỷ mở lựa chọn sát cánh chiến đấu; rớt Thù Địch chặn đàm phán)**; **Tuổi NPC tự cập nhật khi Năm truyện đổi (test: nhảy 5 năm → trẻ con lên Thiếu Niên, Giai Đoạn Đời đúng ngưỡng); cùng canon character khác tuổi/ảnh giữa 2 Era từ Năm Sinh**; NPC từng có tương tác lớn được inject đúng ký ức trọng số cao và hành xử nhất quán qua nhiều turn; trục tính cách dịch chuyển đúng hướng sau sự kiện liên quan; NPC then chốt sinh được biến động thế giới khi vắng người chơi; danh tiếng đa chiều làm NPC các Nhà phản ứng khác nhau (test Stark trọng Vinh Dự vs Lannister trọng Xảo Quyệt); **CHỐNG QUÊN: chơi tràn context (giả lập lịch sử dài) → chat cũ bị cắt NHƯNG dữ kiện then chốt vẫn được giữ (test: NPC gặp 50 lượt trước, lời hứa đã hứa, âm mưu đang chạy vẫn được AI nhớ đúng nhờ state + tóm tắt); rolling summarization tự chạy khi vượt ngưỡng và không bịa chi tiết ngoài đoạn được tóm; khi state mâu thuẫn với chat, AI lấy state làm chuẩn (test: NPC đã tụt xuống Thù Địch thì AI không kể như bạn cũ); Codex tra cứu đúng NPC/quan hệ/việc dở dang đọc thẳng từ state; load lại save sau khi đóng app khôi phục đủ 4 tầng trí nhớ, mạch truyện tiếp đúng chỗ**.

**Milestone 14 — Sự kiện động & Quest**
- Sub-task: engine sự kiện ngẫu nhiên có điều kiện + trọng số (mục 17.1) → hệ thống quest + state machine + phân nhánh (17.2) → cột mốc lịch sử theo Era (17.3) → **UI Sự kiện + Journal 3 khu (Nhiệm Vụ / Biên Niên Sử / Dòng Thời Gian Canon) — mục 17.4**.
- Acceptance: sự kiện chỉ vào pool khi đủ điều kiện và render đúng qua thẻ ngữ nghĩa, lựa chọn áp đúng patch vào state (có skill check test được bằng seed); 1 chuỗi quest phân nhánh chạy đúng theo kết quả; game chạm năm cột mốc canon trigger đúng beat (test cả 2 chế độ Theo Sát Nguyên Tác vs Diễn Giải Tự Do).

**Milestone 15 — Save/load, PWA, onboarding polish, accessibility, test tổng**
- Sub-task: Dexie schema đầy đủ + migration (mục 20) → save/load slot UI (liên kết Main Menu 8.1) → export/import round-trip → Settings hoàn chỉnh (mục 21) → PWA manifest/service worker → virtualize chat list → accessibility pass → chạy toàn bộ test suite.
- Acceptance: save/load qua reload trang không mất dữ liệu của **mọi** hệ thống (lãnh địa/quân/tướng/hạm đội/tình báo/âm mưu/kinh tế/quan hệ/quest), save từ milestone cũ mở được ở bản mới nhờ migration, export/import round-trip test pass, PWA cài được và mở offline shell, toàn bộ unit test ở mục 24 pass, kiểm tra thật trên ít nhất 1 thiết bị mobile (không chỉ resize trình duyệt).

**Milestone 16 — Âm nhạc & Âm thanh + đánh bóng mỹ thuật cuối**
- Sub-task: hệ thống nhạc nền động theo ngữ cảnh + crossfade (mục 18.1-18.2) → player UI kính mờ + điều khiển trong Settings (18.4) → SFX tinh tế tuỳ chọn (18.3) → rà soát toàn bộ UI đảm bảo tuân thủ 4 ràng buộc mỹ thuật (không emoji, SVG hết, glassmorphism, màu ít bão hoà) trên mọi màn hình.
- Acceptance: nhạc đổi đúng theo ngữ cảnh (yên bình/chiến tranh/mưu đồ/bi kịch...) với crossfade mượt không giật mỗi turn, chỉ phát sau tương tác đầu tiên (tôn trọng autoplay policy), bật/tắt + chỉnh âm lượng Nhạc/SFX riêng hoạt động, và pass rà soát mỹ thuật: không còn bất kỳ emoji nào lọt ra UI, mọi icon là SVG, panel dùng glassmorphism nhất quán, bảng màu trầm ít bão hoà đồng bộ toàn app.

> **Lưu ý về thứ tự:** đây là 16 milestone theo thứ tự phụ thuộc hợp lý (mỗi cái dựa trên cái trước). Nếu muốn có bản chơi được sớm, có thể coi Milestone 1-8 là "core game" (chat + nhập vai + lãnh địa + chiến tranh cơ bản) và 9-16 là các lớp chiều sâu + trau chuốt bổ sung dần — nhưng đừng gộp/nhảy cóc khi engine nền (MVU mục 5, turn-advance loop) chưa vững, vì mọi hệ thống sau đều cắm vào đó. Riêng **4 ràng buộc mỹ thuật (không emoji / SVG / glassmorphism / màu ít bão hoà) phải áp dụng NGAY từ milestone đầu tiên có UI (Milestone 4)** — không đợi tới Milestone 16; Milestone 16 chỉ là rà soát/đánh bóng lần cuối, không phải lúc mới bắt đầu làm đẹp.

---

## 26. Non-goals (không làm)

- Không tự host model AI.
- Không cần đăng nhập/tài khoản người dùng.
- Không backend/database riêng — mọi thứ chạy client-side + IndexedDB.
- Không cần multiplayer/đồng bộ nhiều thiết bị (ngoài export/import JSON thủ công).
- Không cần độ chính xác tuyệt đối về lore ASOIAF trong seed data (Era/canon character/địa danh) — phần lore sâu do user tự nạp qua lorebook, seed chỉ để app chạy demo được ngay.
- Không cần bám sát 100% cách SillyTavern/TavernHelper implement nội bộ — các pattern tham khảo (regex script, iframe HTML...) chỉ để lấy ý tưởng thiết kế, không phải yêu cầu tương thích file-for-file, ngoại trừ: (a) import preset/lorebook ST (mục 3-4) vì đó là tính năng người dùng cần dùng thật, và (b) **EJS engine trong lorebook (mục 5.5b) là BẮT BUỘC** — không phải chỉ tham khảo — vì lore người dùng cung cấp sẽ dùng chính cơ chế này.
- Không cần bản đồ toạ độ địa lý thật/GPS — bản đồ là 1 ảnh fantasy tĩnh với hệ toạ độ px riêng của app.
- Không cần AI-vs-AI mô phỏng ngoại giao/kinh tế toàn bản đồ ở các Nhà không liên quan trực tiếp đến nhân vật chính — chỉ cần đủ dữ liệu để AI tường thuật hợp lý khi được hỏi tới (off-screen sim mục 16.3 giữ nhẹ, chỉ vài NPC then chốt).
- Các hệ thống chiều sâu (chính trị mục 14, kinh tế mục 15, AI động mục 16, sự kiện/quest mục 17) **không cần hoàn hảo/cân bằng tuyệt đối ở bản đầu** — mục tiêu là có cơ chế cốt lõi chạy đúng và tạo được chiều sâu chơi, tinh chỉnh số liệu (balance) là việc lặp về sau, không phải điều kiện chặn milestone.
- Không cần công thức hoá mọi thứ: ở những chỗ đã ghi rõ "để AI tường thuật tự do trong khung dữ liệu" (vd phản bội liên minh mục 12.3, character arc mục 16.2), đừng ép thêm công thức cứng làm mất tính linh hoạt của roleplay.

---

## 27. Bắt đầu

Bắt đầu bằng **Milestone 1**: in ra cây thư mục, các file chính, rồi code. Giải thích ngắn gọn từng bước, không cần giải thích dài dòng lý thuyết — ưu tiên code chạy được và test pass. Khi xong mỗi milestone, dừng lại chờ xác nhận trước khi sang milestone tiếp theo.
