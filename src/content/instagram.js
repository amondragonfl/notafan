// Runs on every instagram.com page. While a followers/following list is open
// (a dialog over the profile), shows a floating "Save" button. Clicking it
// records the accounts loaded in the list so far, skipping the "Suggested for
// you" section Instagram adds at the bottom of the list.

const LIST_PATH = /^\/([^/]+)\/(followers|following)\/?$/;
const PROFILE_PATH = /^\/([A-Za-z0-9._]+)\/?$/;
// Single-segment paths that are Instagram pages, not profiles.
const NOT_PROFILES = new Set(["explore", "reels", "direct", "accounts", "stories"]);
const SUGGESTIONS_HEADING = /^suggested for you$/i;

// Instagram can open the list without changing the URL, so remember which
// header link ("44 followers" / "44 following") was clicked to open it.
let clickedKind = null;
let dialogWasOpen = false;
let lastSaved = null; // { owner, kind, count } of the most recent save
let button = null;
let updateQueued = false;

function findDialog() {
  const dialogs = document.querySelectorAll('[role="dialog"]');
  return dialogs[dialogs.length - 1] ?? null;
}

function currentList() {
  const match = location.pathname.match(LIST_PATH);
  if (match) return { owner: match[1], kind: match[2] };

  const owner = location.pathname.match(PROFILE_PATH)?.[1];
  if (!owner || NOT_PROFILES.has(owner) || !clickedKind) return null;
  return { owner, kind: clickedKind };
}

function profileUsername(link) {
  if (link.hostname !== location.hostname) return null;
  const username = link.pathname.match(PROFILE_PATH)?.[1];
  return username && !NOT_PROFILES.has(username) ? username : null;
}

function findSuggestionsHeading(dialog) {
  const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (SUGGESTIONS_HEADING.test(walker.currentNode.data.trim())) {
      return walker.currentNode;
    }
  }
  return null;
}

// Usernames listed in the dialog, top to bottom, stopping at "Suggested for you".
function collectAccounts(dialog, owner) {
  const suggestions = findSuggestionsHeading(dialog);
  const usernames = new Set();
  for (const link of dialog.querySelectorAll("a[href]")) {
    const beforeSuggestions =
      !suggestions ||
      link.compareDocumentPosition(suggestions) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (!beforeSuggestions) break;

    const username = profileUsername(link);
    if (username && username !== owner) usernames.add(username);
  }
  return [...usernames];
}

async function save() {
  const dialog = findDialog();
  const list = currentList();
  if (!dialog || !list) return;

  // Read the list first, in case anything closes the dialog afterwards.
  const usernames = collectAccounts(dialog, list.owner);
  const response = await browser.runtime.sendMessage({ type: "save-list", ...list, usernames });
  if (!response?.ok) {
    console.error("[notafan] saving failed", response?.error);
    return;
  }
  lastSaved = { ...list, count: usernames.length };
  update();
}

function createButton() {
  const el = document.createElement("button");
  el.type = "button";
  el.title = "Scroll to the end of the list first so every account is loaded.";
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#0095f6",
    color: "#fff",
    font: "600 14px system-ui, sans-serif",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    cursor: "pointer",
  });
  // Keep the click from reaching Instagram, which could treat it as a click
  // outside the dialog and close it.
  for (const type of ["pointerdown", "mousedown", "click"]) {
    el.addEventListener(type, (event) => event.stopPropagation());
  }
  el.addEventListener("click", save);
  return el;
}

function renderButton(list, count) {
  button ??= createButton();
  if (!button.isConnected) document.body.append(button);

  const saved =
    lastSaved?.owner === list.owner &&
    lastSaved.kind === list.kind &&
    lastSaved.count === count;
  const label = saved ? `Saved ${count} ${list.kind} ✓` : `Save ${count} ${list.kind}`;
  // Only touch the DOM on change, or our own observer would keep re-firing.
  if (button.textContent !== label) button.textContent = label;
}

function hideButton() {
  if (button?.isConnected) button.remove();
}

function update() {
  updateQueued = false;

  const dialog = findDialog();
  if (!dialog) {
    // The list was closed: forget which one it was.
    if (dialogWasOpen) {
      clickedKind = null;
      lastSaved = null;
    }
    dialogWasOpen = false;
    hideButton();
    return;
  }
  dialogWasOpen = true;

  const list = currentList();
  const count = list ? collectAccounts(dialog, list.owner).length : 0;
  if (count === 0) {
    hideButton();
    return;
  }
  renderButton(list, count);
}

document.addEventListener(
  "click",
  (event) => {
    if (findDialog()) return; // lists are opened from the profile header
    const link = event.target.closest?.("a");
    if (!link) return;
    const text = link.textContent.toLowerCase();
    if (/\bfollowers\b/.test(text)) clickedKind = "followers";
    else if (/\bfollowing\b/.test(text)) clickedKind = "following";
    else clickedKind = null;
  },
  true,
);

// Instagram mutates the DOM constantly, so batch updates instead of running
// one per mutation.
new MutationObserver(() => {
  if (!updateQueued) {
    updateQueued = true;
    setTimeout(update, 250);
  }
}).observe(document.body, { childList: true, subtree: true });

update();
