import { createPinia, setActivePinia } from 'pinia';

import { DEFAULT_SETUP_TIMING, setupTiming } from '@/setup/timing';
import { useSetupStore } from '@/stores/setup';

import { useSetupStep } from './useSetupStep';

describe('useSetupStep', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.assign(setupTiming, DEFAULT_SETUP_TIMING);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is busy while the task runs and returns its result', async () => {
    const step = useSetupStep('backendConnection');
    let resolve: (value: number) => void = () => undefined;

    const running = step.run(() => new Promise<number>((done) => (resolve = done)));
    expect(step.busy.value).toBe(true);
    resolve(42);

    await expect(running).resolves.toBe(42);
    expect(step.busy.value).toBe(false);
  });

  it('takes at least the minimum time, also when the task fails', async () => {
    vi.useFakeTimers();
    const step = useSetupStep('backendConnection');
    const settled = vi.fn();

    step.run(() => Promise.reject(new Error('down')), 2000).catch(settled);
    await vi.advanceTimersByTimeAsync(1999);
    expect(settled).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(settled).toHaveBeenCalledWith(new Error('down'));
    expect(step.busy.value).toBe(false);
  });

  it('marks the step on failure and clears it on the next try', async () => {
    const setup = useSetupStore();
    const step = useSetupStep('backendConnection');

    step.fail('setup.backendConnectionFailed.message');
    expect(step.error.value).toEqual({ key: 'setup.backendConnectionFailed.message' });
    expect(setup.stepStates.backendConnection).toBe('error');

    await step.run(async () => undefined);
    expect(step.error.value).toBeUndefined();
    expect(setup.stepStates.backendConnection).toBeUndefined();
  });

  it('completes the step once the countdown after a success ran out', () => {
    const setup = useSetupStore();
    const step = useSetupStep('backendConnection');

    step.succeed('setup.backendConnection.serverFound.text');
    expect(step.success.value).toEqual({ key: 'setup.backendConnection.serverFound.text', skipped: false });
    expect(setup.currentStep).toBe('backendConnection');

    step.finish();
    expect(setup.currentStep).toBe('licenseAgreement');
  });

  it('passes a skip on', () => {
    const setup = useSetupStore();
    setup.completeStep('backendConnection');
    const step = useSetupStep('licenseAgreement');

    step.succeed('setup.licenses.alreadyAccepted.text', undefined, { skipped: true });
    step.finish();

    expect(setup.stepStates.licenseAgreement).toBe('skipped');
  });

  it('does nothing when the countdown ends without a success', () => {
    const setup = useSetupStore();
    const step = useSetupStep('backendConnection');

    step.finish();

    expect(setup.currentStep).toBe('backendConnection');
  });

  it('completes right away without a countdown', () => {
    const setup = useSetupStore();
    const step = useSetupStep('backendConnection');

    step.complete();

    expect(setup.currentStep).toBe('licenseAgreement');
  });
});
