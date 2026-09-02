/**
 * Open an outside resource (crisis chat, hotline site) in a brand-new tab and
 * immediately turn this tab into a neutral Google search, so anyone who picks
 * up the device does not find MrsANONymous or the resource in this tab.
 *
 * If the browser blocks the pop-up (window.open returns null without
 * throwing), we do NOT leave — we navigate this tab straight to the resource
 * instead, so the person always reaches help and is never dumped on Google
 * with nothing open.
 */
export function openResourceAndLeave(url: string) {
  let win: Window | null = null;
  try {
    win = window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    win = null;
  }
  if (win) {
    window.location.replace("https://www.google.com/search?q=weather");
  } else {
    // Pop-up blocked — open the resource in this tab instead of leaving the
    // user stranded.
    window.location.assign(url);
  }
}
