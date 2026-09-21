import { mountWithPlugins } from '@homebook/test-utils';

import HbSavingGoalSearchResults from './HbSavingGoalSearchResults.vue';

const GOAL_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

describe('HbSavingGoalSearchResults', () => {
  it('opens the saving goal of a hit', async () => {
    const { wrapper, router } = await mountWithPlugins(HbSavingGoalSearchResults, {
      props: { items: [{ identifier: GOAL_ID, title: 'Holiday', description: '1,200 €' }] },
    });

    expect(wrapper.text()).toContain('Holiday');
    expect(wrapper.text()).toContain('1,200 €');
    await wrapper.find('button').trigger('click');

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(`/Finances/Savings/${GOAL_ID}`));
  });

  it('disables hits without a valid id', async () => {
    const { wrapper } = await mountWithPlugins(HbSavingGoalSearchResults, {
      props: { items: [{ identifier: 'broken', title: 'Broken' }] },
    });

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
