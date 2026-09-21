import { describeCatalogs } from '@homebook/test-utils';

import { platformInfoModule } from './index';

describeCatalogs('platform info', platformInfoModule.messages);

describe('platformInfoModule', () => {
  it('uses the backend module key', () => {
    expect(platformInfoModule.key).toBe('homebook.platforminfo');
  });
});
