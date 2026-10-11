// Central hub: the content script sends the accounts it read from Instagram,
// and this script owns everything written to storage so there is a single writer.
//
// Storage shape (each save replaces that list with a fresh snapshot):
//   lists: { [owner]: { followers: { savedAt, usernames: [...] }, following: { ... } } }

// Chrome runs this file as a service worker, which can't load
// shared/browser.js alongside it, so the same alias is repeated here.
globalThis.browser ??= globalThis.chrome;

const handlers = {
  "save-list": saveList,
  "delete-account": deleteAccount,
};

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handler = handlers[message.type];
  if (!handler) return false;

  // Reply through sendResponse and return true instead of returning a
  // promise: Chrome doesn't wait for promises returned from this listener.
  handler(message).then(
    () => sendResponse({ ok: true }),
    (error) => sendResponse({ ok: false, error: String(error) }),
  );
  return true;
});

async function saveList({ owner, kind, usernames }) {
  const { lists = {} } = await browser.storage.local.get("lists");
  lists[owner] = { ...lists[owner], [kind]: { savedAt: Date.now(), usernames } };
  await browser.storage.local.set({ lists });
}

async function deleteAccount({ owner }) {
  const { lists = {} } = await browser.storage.local.get("lists");
  delete lists[owner];
  await browser.storage.local.set({ lists });
}
