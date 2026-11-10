// Forge moved to https://uor-foundation.github.io/foundry/. This worker replaces Forge's own service
// worker at the same address, so a browser that still runs the old one picks this up on its next update
// check and retires it: it takes over at once, deletes Forge's caches, unregisters, and reloads the open
// Forge tabs from the network, where they find the page that says Forge moved. Other projects share this
// origin, so only Forge's caches (shell-*, previews, holo) and tabs under this worker's scope are touched.
// It has no fetch handler: nothing is served from here.
const forgeCache = (name) => name.startsWith("shell-") || name === "previews" || name === "holo";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (forgeCache(name)) await caches.delete(name);
    await self.clients.claim();
    const scope = self.registration.scope;
    const tabs = (await self.clients.matchAll({ type: "window" })).filter((c) => c.url.startsWith(scope));
    await self.registration.unregister();
    for (const tab of tabs) tab.navigate(tab.url).catch(() => {});
  })());
});
