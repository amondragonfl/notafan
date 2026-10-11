// Chrome exposes the extension API only as `chrome`; Firefox calls it
// `browser`. In Manifest V3 both return promises, so for everything this
// extension uses the two are interchangeable.
globalThis.browser ??= globalThis.chrome;
