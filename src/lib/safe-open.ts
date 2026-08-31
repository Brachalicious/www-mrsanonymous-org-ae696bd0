/**
 * Open an outside resource (crisis chat, hotline site) in a brand-new tab and
 * immediately turn this tab into a neutral Google search, so anyone who picks
 * up the device does not find MrsANONymous or the resource in this tab.
 */
export function openResourceAndLeave(url: string) {
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    /* ignore */
  }
  window.location.replace("https://www.google.com/search?q=weather");
}
