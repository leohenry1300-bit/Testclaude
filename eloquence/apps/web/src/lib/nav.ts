// Safe "back" helper. `window.history.length` counts every entry in the
// tab's whole session history, including pages visited before this SPA ever
// loaded — using it to decide whether nav(-1) is safe was the bug behind
// "back sends me to the wrong page": on a fresh tab (e.g. opened from a
// push notification, a bookmark, or after a reload) `history.length` is
// often already > 1 from the browser's own restore, so nav(-1) fired and
// left the app entirely instead of going to a page inside it.
//
// React Router's BrowserHistory stores `{ idx, key, usr }` as the native
// history state on every entry it pushes, with `idx` counting only the
// entries *this router instance* has pushed since the app loaded (starting
// at 0). That's the number we actually want.
export function canGoBackInApp(): boolean {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === "number" && idx > 0;
}
