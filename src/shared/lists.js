// Helpers shared by the popup and the lists page. Saved data looks like
//   lists: { [owner]: { followers: { savedAt, usernames }, following: { ... } } }

async function loadAccounts() {
  const { lists = {} } = await browser.storage.local.get("lists");
  // Skip accounts left over from older versions, which stored no usernames.
  return Object.fromEntries(
    Object.entries(lists).filter(
      ([, account]) => account.followers?.usernames || account.following?.usernames,
    ),
  );
}

// Accounts the owner follows that don't follow them back, or null until both
// lists have been saved.
function notFollowingBack(account) {
  const followers = account.followers?.usernames;
  const following = account.following?.usernames;
  if (!followers || !following) return null;

  const followerSet = new Set(followers);
  return following.filter((username) => !followerSet.has(username));
}

function profileUrl(username) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

function listsPageUrl(owner) {
  return browser.runtime.getURL(`lists/lists.html#${encodeURIComponent(owner)}`);
}
