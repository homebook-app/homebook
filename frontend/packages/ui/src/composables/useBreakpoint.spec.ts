import { effectScope } from 'vue';

import { useBreakpointUp } from './useBreakpoint';

function mockMatchMedia(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: initial,
    addEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
    ),
  };
  const matchMedia = vi.fn(() => query as unknown as MediaQueryList);
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    matchMedia,
    listeners,
    change: (matches: boolean) => listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent)),
  };
}

describe('useBreakpointUp', () => {
  it('queries the breakpoint width', () => {
    const { matchMedia } = mockMatchMedia(true);

    const scope = effectScope();
    const matches = scope.run(() => useBreakpointUp('md'));

    expect(matchMedia).toHaveBeenCalledWith('(min-width: 960px)');
    expect(matches?.value).toBe(true);
    scope.stop();
  });

  it('follows the viewport and stops listening with its scope', () => {
    const media = mockMatchMedia(false);
    const scope = effectScope();
    const matches = scope.run(() => useBreakpointUp('md'));

    media.change(true);
    expect(matches?.value).toBe(true);

    scope.stop();
    expect(media.listeners.size).toBe(0);
  });
});
