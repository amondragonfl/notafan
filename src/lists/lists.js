const accountControls = document.getElementById("account-controls");
const accountSelect = document.getElementById("account");
const deleteButton = document.getElementById("delete");
const emptyMessage = document.getElementById("empty");
const listsSection = document.getElementById("lists");
const tabButtons = document.querySelectorAll("[data-tab]");
const noteText = document.getElementById("note");
const filterInput = document.getElementById("filter");
const usersList = document.getElementById("users");
const noneMessage = document.getElementById("none");

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

let accounts = {};
let currentTab = "notFollowingBack";

// The usernames shown in one tab (null if the data isn't saved yet), plus a
// line explaining them.
function tabContent(owner, tab) {
  const account = accounts[owner];

  if (tab === "notFollowingBack") {
    const usernames = notFollowingBack(account);
    if (usernames) {
      return { usernames, note: `Accounts @${owner} follows that don't follow @${owner} back.` };
    }
    const missing = account.followers?.usernames ? "following" : "followers";
    return { usernames: null, note: `Save the ${missing} list for @${owner} to compare.` };
  }

  const list = account[tab];
  if (!list?.usernames) {
    return { usernames: null, note: `No ${tab} list saved for @${owner} yet.` };
  }
  return { usernames: list.usernames, note: `Saved ${dateFormat.format(list.savedAt)}.` };
}

function userRow(username) {
  const link = document.createElement("a");
  link.href = profileUrl(username);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `@${username}`;

  const item = document.createElement("li");
  item.append(link);
  return item;
}

function render() {
  const owners = Object.keys(accounts).sort();
  emptyMessage.hidden = owners.length > 0;
  listsSection.hidden = owners.length === 0;
  accountControls.hidden = owners.length === 0;
  if (owners.length === 0) return;

  // Keep the selected account; on first render, take it from the URL hash.
  const wanted = accountSelect.value || decodeURIComponent(location.hash.slice(1));
  accountSelect.replaceChildren(...owners.map((owner) => new Option(`@${owner}`, owner)));
  accountSelect.value = owners.includes(wanted) ? wanted : owners[0];
  const owner = accountSelect.value;
  history.replaceState(null, "", `#${encodeURIComponent(owner)}`);

  for (const button of tabButtons) {
    const { usernames } = tabContent(owner, button.dataset.tab);
    button.querySelector(".count").textContent = usernames ? usernames.length : "–";
    button.setAttribute("aria-pressed", String(button.dataset.tab === currentTab));
  }

  const { usernames, note } = tabContent(owner, currentTab);
  noteText.textContent = note;
  filterInput.hidden = !usernames?.length;

  const query = filterInput.value.trim().toLowerCase().replace(/^@/, "");
  const shown = (usernames ?? []).filter((username) => username.includes(query));
  usersList.replaceChildren(...shown.map(userRow));

  noneMessage.hidden = !usernames || shown.length > 0;
  noneMessage.textContent = usernames?.length
    ? "No usernames match your search."
    : "No accounts in this list.";
}

async function load() {
  accounts = await loadAccounts();
  render();
}

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    currentTab = button.dataset.tab;
    render();
  });
}

accountSelect.addEventListener("change", render);

deleteButton.addEventListener("click", () => {
  const owner = accountSelect.value;
  if (!confirm(`Delete the saved followers and following lists for @${owner}? This can't be undone.`)) {
    return;
  }
  // The storage change listener below re-renders once it's gone.
  browser.runtime.sendMessage({ type: "delete-account", owner });
});

filterInput.addEventListener("input", render);

// Refresh when a list is saved on Instagram while this page is open.
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.lists) load();
});

load();
