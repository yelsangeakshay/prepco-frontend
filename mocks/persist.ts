/**
 * Persist the mock world in sessionStorage, so a hard reload (or a role switch in a new
 * navigation) keeps bookings, scores, assignments and edits. Plain JSON only.
 */
const KEY = "prepco-mock-world-v1";

interface Snapshot {
  scenario: string | null;
  sections: Record<string, unknown>;
}

type Serializer = () => unknown;
const serializers = new Map<string, Serializer>();
let cached: Snapshot | null | undefined;

const hasStorage = () => {
  // Unit tests run in jsdom, which has sessionStorage; they must always start from a fresh world.
  if (typeof process !== "undefined" && process.env.VITEST) return false;
  try {
    return typeof sessionStorage !== "undefined";
  } catch {
    return false;
  }
};

function read(): Snapshot | null {
  if (cached !== undefined) return cached;
  cached = null;
  if (!hasStorage()) return cached;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) cached = JSON.parse(raw) as Snapshot;
  } catch {
    cached = null;
  }
  return cached;
}

/** Saved section for this scenario, or null. Only the browser worker ever writes snapshots. */
export function readSection<T>(name: string, scenario: string | null): T | null {
  const snap = read();
  if (!snap || snap.scenario !== scenario) return null;
  return (snap.sections[name] as T | undefined) ?? null;
}

export function registerSection(name: string, scenario: string | null, serialize: Serializer) {
  serializers.set(name, serialize);
  currentScenario = scenario;
}

let currentScenario: string | null = null;

/** Called after every mocked response in the browser. */
export function saveSnapshot() {
  if (!hasStorage()) return;
  // Merge: a page may only have touched some parts of the world; keep the saved rest.
  const prev = read();
  const sections: Record<string, unknown> =
    prev && prev.scenario === currentScenario ? { ...prev.sections } : {};
  for (const [name, fn] of serializers) sections[name] = fn();
  try {
    const snap: Snapshot = { scenario: currentScenario, sections };
    sessionStorage.setItem(KEY, JSON.stringify(snap));
    cached = snap;
  } catch {
    /* quota or blocked storage: the world just won't survive a reload */
  }
}

export function clearSnapshot() {
  cached = null;
  if (!hasStorage()) return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
