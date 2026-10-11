// Central hub: the content script sends the accounts it read from Instagram,
// and this script owns everything written to storage so there is a single writer.
//
// Storage shape (each save replaces that list with a fresh snapshot):
//   lists: { [owner]: { followers: { savedAt, usernames: [...] }, following: { ... } } }

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "save-list") {
    return saveList(message);
  }
  if (message.type === "delete-account") {
    return deleteAccount(message);
  }
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
