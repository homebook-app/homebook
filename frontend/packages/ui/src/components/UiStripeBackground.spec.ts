import { mountWithPlugins } from '@homebook/test-utils';

import { stripeSchemes } from '../backgrounds/stripeGradient/colors';
import { createStripeGradient } from '../backgrounds/stripeGradient/gradient';
import UiStripeBackground from './UiStripeBackground.vue';

vi.mock('../backgrounds/stripeGradient/gradient', () => ({ createStripeGradient: vi.fn() }));

const resize = vi.fn();
const dispose = vi.fn();
let notifyResize: ResizeObserverCallback = () => undefined;
const disconnect = vi.fn();

beforeEach(() => {
  vi.mocked(createStripeGradient).mockReturnValue({ resize, dispose });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('UiStripeBackground', () => {
  it('starts the gradient on its canvas with the colors of the scheme', async () => {
    const { wrapper } = await mountWithPlugins(UiStripeBackground, { props: { scheme: 'alpha' } });

    expect(createStripeGradient).toHaveBeenCalledTimes(1);
    expect(createStripeGradient).toHaveBeenCalledWith(
      wrapper.find('canvas').element,
      expect.objectContaining({ colors: stripeSchemes.alpha, still: false }),
    );
    expect(wrapper.find('.ui-stripe-background-container').classes()).toContain('build-mode-alpha');
  });

  it('defaults to the release scheme', async () => {
    const { wrapper } = await mountWithPlugins(UiStripeBackground);

    expect(wrapper.find('.ui-stripe-background-container').classes()).toContain('build-mode-release');
  });

  it('renders a single frame for users who prefer reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    await mountWithPlugins(UiStripeBackground);

    expect(createStripeGradient).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ still: true }));
  });

  it('follows the size of its container', async () => {
    await mountWithPlugins(UiStripeBackground);

    notifyResize([{ contentRect: { width: 800, height: 600 } } as ResizeObserverEntry], {} as ResizeObserver);
    notifyResize([{ contentRect: { width: 0, height: 0 } } as ResizeObserverEntry], {} as ResizeObserver);

    expect(resize).toHaveBeenCalledTimes(1);
    expect(resize).toHaveBeenCalledWith(800, 600);
  });

  it('stops the gradient and the observer when it is unmounted', async () => {
    const { wrapper } = await mountWithPlugins(UiStripeBackground);
    wrapper.unmount();

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('stays quiet without WebGL', async () => {
    vi.mocked(createStripeGradient).mockReturnValue(null);
    const { wrapper } = await mountWithPlugins(UiStripeBackground);

    expect(wrapper.find('canvas').exists()).toBe(true);
    expect(() => wrapper.unmount()).not.toThrow();
    expect(dispose).not.toHaveBeenCalled();
  });
});
