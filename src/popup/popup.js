const emptyMessage = document.getElementById("empty");
const summary = document.getElementById("lists");

function accountRow(owner, account) {
  const count = (list) => list?.usernames?.length ?? "–";
  const notBack = notFollowingBack(account);

  const name = document.createElement("strong");
  name.textContent = `@${owner}`;
  const details = document.createElement("span");
  details.textContent =
    `${count(account.followers)} followers · ${count(account.following)} following` +
    (notBack ? ` · ${notBack.length} don't follow back` : "");

  const button = document.createElement("button");
  button.type = "button";
  button.append(name, details);
  button.addEventListener("click", () => {
    browser.tabs.create({ url: listsPageUrl(owner) });
    window.close();
  });

  const item = document.createElement("li");
  item.append(button);
  return item;
}

loadAccounts().then((accounts) => {
  const owners = Object.keys(accounts).sort();
  emptyMessage.hidden = owners.length > 0;
  summary.replaceChildren(...owners.map((owner) => accountRow(owner, accounts[owner])));
});
