import { describeCatalogs } from '@homebook/test-utils';

import { financesModule } from './index';

describeCatalogs('finances', financesModule.messages);

describe('financesModule', () => {
  it('uses the backend module key', () => {
    expect(financesModule.key).toBe('homebook.finances');
  });

  it('keeps every route in its original spelling', () => {
    expect(financesModule.routes.map((route) => route.path)).toEqual([
      '/Finances',
      '/Finances/Savings/Overview',
      '/Finances/Savings/Add',
      expect.stringMatching(/^\/Finances\/Savings\/:SavingGoalId\(.+\)$/),
      '/Finances/Settings',
    ]);
  });
});
