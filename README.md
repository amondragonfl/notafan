# notafan

A Firefox add-on that records your Instagram followers and following as you
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

## Optional: web-ext

With Node.js installed, `npm install` gets Mozilla's
[web-ext](https://github.com/mozilla/web-ext) tool:

- `npm start` opens Firefox with the add-on loaded and reloads it whenever a file changes.
  It uses a fresh profile, so you have to log in to Instagram each time.
- `npm run lint` checks the add-on against the rules addons.mozilla.org applies.
- `npm run build` packages `src/` into a zip in `dist/`.
