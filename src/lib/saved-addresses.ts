export type SavedAddress = {
  id: string;
  label: string;
  address: string;
};

const KEY = "mrsanon:saved-addresses";
const DEFAULT_KEY = "mrsanon:saved-address-default";

export function loadAddresses(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((a) => a && typeof a.address === "string");
  } catch {
    return [];
  }
}

export function saveAddresses(list: SavedAddress[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function loadDefaultAddressId(): string | null {
  try {
    return localStorage.getItem(DEFAULT_KEY);
  } catch {
    return null;
  }
}

export function saveDefaultAddressId(id: string | null) {
  try {
    if (id) localStorage.setItem(DEFAULT_KEY, id);
    else localStorage.removeItem(DEFAULT_KEY);
  } catch {}
}

export function newAddressId() {
  return Math.random().toString(36).slice(2, 10);
}
