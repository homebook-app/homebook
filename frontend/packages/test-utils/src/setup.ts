// Vitest setup file, referenced through `setupFiles` of every workspace that tests Vue code.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
