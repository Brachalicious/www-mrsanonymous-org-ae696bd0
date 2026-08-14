const PREFIX = "mrsanon:go:";

/** Store an outside URL in sessionStorage and return a short id, so the
 *  address bar never reveals which resource the user opened. */
export function stashGoUrl(url: string) {
  const id = Math.random().toString(36).slice(2, 10);
  try {
    window.sessionStorage.setItem(PREFIX + id, url);
  } catch {
    /* ignore */
  }
  return id;
}

export function readGoUrl(id: string | undefined) {
  if (!id) return null;
  try {
    return window.sessionStorage.getItem(PREFIX + id);
  } catch {
    return null;
  }
}
