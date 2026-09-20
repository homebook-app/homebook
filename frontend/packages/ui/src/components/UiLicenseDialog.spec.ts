import { mountWithPlugins } from '@homebook/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import AccordionPanel from 'primevue/accordionpanel';
import Button from 'primevue/button';

import UiLicenseDialog, { type UiLicense } from './UiLicenseDialog.vue';

const licenses: UiLicense[] = [
  { name: 'System__Text__Json', htmlContent: '<pre>MIT</pre>' },
  { name: 'Vue', htmlContent: '<pre>MIT</pre>' },
];

function mountDialog(props: Record<string, unknown> = {}) {
  return mountWithPlugins(UiLicenseDialog, {
    props: { visible: true, licenses, ...props },
    attachTo: document.body,
  });
}

/** The labelled buttons of the footer. The close icon of the dialog itself carries no label. */
function labels(wrapper: VueWrapper): string[] {
  return wrapper
    .findAllComponents(Button)
    .map((button) => button.props('label'))
    .filter((label): label is string => typeof label === 'string');
}

async function click(wrapper: VueWrapper, label: string): Promise<void> {
  const button = wrapper.findAllComponents(Button).find((candidate) => candidate.props('label') === label);
  expect(button, label).toBeDefined();
  await button?.trigger('click');
}

describe('UiLicenseDialog', () => {
  it('turns the underscore pairs of a package name back into spaces', async () => {
    const { wrapper } = await mountDialog();

    const headers = wrapper.findAllComponents(AccordionPanel).map((panel) => panel.text());
    expect(headers[0]).toContain('System Text Json');
    expect(headers[1]).toContain('Vue');
  });

  it('renders one panel per license with its text', async () => {
    const { wrapper } = await mountDialog();

    expect(wrapper.findAllComponents(AccordionPanel)).toHaveLength(2);
    // The dialog teleports, so its markup is only reachable through the document
    expect(document.body.innerHTML).toContain('<pre>MIT</pre>');
  });

  it('closes and reports the cancellation', async () => {
    const { wrapper } = await mountDialog();

    await click(wrapper, 'ui.licenseDialog.close');

    expect(wrapper.emitted('canceled')).toHaveLength(1);
    expect(wrapper.emitted('update:visible')).toEqual([[false]]);
    expect(wrapper.emitted('accepted')).toBeUndefined();
  });

  it('closes and reports the acceptance', async () => {
    const { wrapper } = await mountDialog();

    await click(wrapper, 'ui.licenseDialog.acceptContinue');

    expect(wrapper.emitted('accepted')).toHaveLength(1);
    expect(wrapper.emitted('update:visible')).toEqual([[false]]);
    expect(wrapper.emitted('canceled')).toBeUndefined();
  });

  it('shows the accept button only when it is asked for', async () => {
    const without = await mountDialog({ showAcceptButton: false });
    expect(labels(without.wrapper)).toEqual(['ui.licenseDialog.close']);

    const { wrapper } = await mountDialog();
    expect(labels(wrapper)).toEqual(['ui.licenseDialog.close', 'ui.licenseDialog.acceptContinue']);
  });

  it('copes with no licenses at all', async () => {
    const { wrapper } = await mountDialog({ licenses: undefined });

    expect(wrapper.findAllComponents(AccordionPanel)).toHaveLength(0);
  });
});
