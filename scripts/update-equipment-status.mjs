import { readFile, writeFile } from "node:fs/promises";

const INDEX_PATH = "bhnano-wechat-entry/index.html";
const OUTPUT_PATH = "bhnano-wechat-entry/equipment-status.json";
const ENDPOINT = "https://bhnano.buaa.edu.cn/EquipmentAsync/GetEquipmentCurStatusInfo";
const CONCURRENCY = 8;

const CN = {
  idle: "\u7a7a\u95f2",
  using: "\u6b63\u5728\u4f7f\u7528",
  inUse: "\u4f7f\u7528\u4e2d",
  unknown: "\u672a\u77e5",
  idleHint: "\u5f53\u524d\u5feb\u7167\u663e\u793a\u65e0\u4eba\u4f7f\u7528",
  busyHint: "\u5f53\u524d\u5feb\u7167\u663e\u793a\u6b63\u5728\u4f7f\u7528",
  offlineHint: "\u5f53\u524d\u5feb\u7167\u663e\u793a\u6682\u505c\u5f00\u653e\u6216\u7ef4\u62a4\u4e2d",
  fallbackHint: "\u5f53\u524d\u72b6\u6001\u8bf7\u4ee5\u539f\u7cfb\u7edf\u4e3a\u51c6",
  bootTime: "\u5f00\u673a\u65f6\u95f4"
};

function hasAny(value, terms) {
  const text = String(value || "");
  return terms.some((term) => text.includes(term));
}

function statusClass(code, name) {
  const label = String(name || "");
  if (Number(code) === 0 || label.includes(CN.idle)) return "idle";
  if (Number(code) === 1 || hasAny(label, ["\u4f7f\u7528", "\u5360\u7528", "\u8fd0\u884c", "\u5f00\u673a"])) return "busy";
  if (hasAny(label, ["\u505c\u7528", "\u7ef4\u4fee", "\u7ef4\u62a4", "\u6545\u969c", "\u4e0d\u53ef\u7528"])) return "offline";
  return "unknown";
}

function sanitizeHint(status, rawRemark) {
  const className = statusClass(status.EquipmentStatus, status.EquipmentStatusName);
  const remark = String(rawRemark || "");
  const started = remark.match(/[\u5f00][\u673a][\u65f6][\u95f4][:\uff1a]\s*([0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2})/);
  if (started) return `${CN.busyHint}\uff0c${CN.bootTime} ${started[1]}`;
  if (className === "idle") return CN.idleHint;
  if (className === "busy") return CN.busyHint;
  if (className === "offline") return CN.offlineHint;
  return CN.fallbackHint;
}

async function fetchStatus(item) {
  const url = `${ENDPOINT}?Id=${encodeURIComponent(item.id)}&date=${Date.now()}`;
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 bhnano-h5-status-snapshot" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    const className = statusClass(raw.EquipmentStatus, raw.EquipmentStatusName);
    return {
      id: item.id,
      statusCode: Number.isFinite(Number(raw.EquipmentStatus)) ? Number(raw.EquipmentStatus) : null,
      statusName: raw.EquipmentStatusName || (className === "idle" ? CN.idle : className === "busy" ? CN.using : CN.unknown),
      label: className === "busy" ? CN.inUse : raw.EquipmentStatusName || CN.unknown,
      className,
      hint: sanitizeHint(raw, raw.Remark),
      ok: true
    };
  } catch {
    return {
      id: item.id,
      statusCode: null,
      statusName: CN.unknown,
      label: CN.unknown,
      className: "unknown",
      hint: CN.fallbackHint,
      ok: false
    };
  }
}

async function runLimited(items, limit) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fetchStatus(items[index]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const html = await readFile(INDEX_PATH, "utf8");
const match = html.match(/const EQUIPMENT_DATA = (\[.*?\]);\s*const statusEl/s);
if (!match) throw new Error("EQUIPMENT_DATA not found");

const equipment = JSON.parse(match[1]);
const items = await runLimited(equipment, CONCURRENCY);
const summary = items.reduce((acc, item) => {
  acc[item.className] = (acc[item.className] || 0) + 1;
  return acc;
}, {});

const payload = {
  generatedAt: new Date().toISOString(),
  source: ENDPOINT,
  privacy: "Only public equipment state is stored. User ids, user names, cookies, and account data are omitted.",
  count: items.length,
  summary,
  items
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ count: items.length, summary }));
