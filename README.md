# notafan

A Firefox and Chrome extension that records your Instagram followers and following as you
scroll through those lists, so you can compare them.

It runs locally, so no data is ever stored on any external server; it is stored only on your machine.

## How to Install on Firefox 

1. Download the repository 
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `src/manifest.json`.
3. Go to instagram.com, open your profile, click **followers** or **following**,
   and scroll to the bottom of the list. A **Save N followers** button floats at
   the bottom of the screen; click it to store the list (accounts under
   "Suggested for you" are skipped). Save both lists to compare them.
4. Click the toolbar icon and pick an account to open its lists in a new tab:
   **Don't follow back**, **Followers** and **Following**, each linking to the
   Instagram profiles. **Delete** next to the account picker removes everything
   saved for that account.

Temporary add-ons are removed when Firefox closes.

## How to Install on Chrome

1. Download the repository
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick the `src` folder.
4. Use it on instagram.com the same way as described for Firefox above.

Chrome shows an "Unrecognized manifest key 'browser_specific_settings'" warning
on the extension's card; that setting is only for Firefox and can be ignored.

## Optional: web-ext

With Node.js installed, `npm install` gets Mozilla's
[web-ext](https://github.com/mozilla/web-ext) tool:

- `npm start` opens Firefox with the add-on loaded and reloads it whenever a file changes.
  It uses a fresh profile, so you have to log in to Instagram each time.
- `npm run lint` checks the add-on against the rules addons.mozilla.org applies.
- `npm run build` packages `src/` into a zip in `dist/`.

## Limitations
1. Instagram limits the amount of followers and following shown for other users' accounts, so this add-on only works to scrape your complete lists
2. If the amount of follwers or following lists is huge, it will take a while to record all data points 
