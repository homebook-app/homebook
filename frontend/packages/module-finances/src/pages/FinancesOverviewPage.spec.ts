import { useMenuStore } from '@homebook/module-sdk';
import { mountWithPlugins } from '@homebook/test-utils';

import FinancesOverviewPage from './FinancesOverviewPage.vue';

describe('FinancesOverviewPage', () => {
  it('links the saving goals in the context menu', async () => {
    await mountWithPlugins(FinancesOverviewPage);

    expect(useMenuStore().items).toEqual([
      {
        title: 'finances.savings.title',
        url: '/Finances/Savings/Overview',
        icon: { set: 'windows11-outline', name: 'MoneyBox' },
      },
    ]);
  });
});
