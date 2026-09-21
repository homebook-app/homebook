import { isGuid } from './routes';

describe('isGuid', () => {
  it('accepts a GUID in either case', () => {
    expect(isGuid('0f8fad5b-d9cb-469f-a165-70867728950e')).toBe(true);
    expect(isGuid('0F8FAD5B-D9CB-469F-A165-70867728950E')).toBe(true);
  });

  it.each(['', '42', '0f8fad5b-d9cb-469f-a165', '{0f8fad5b-d9cb-469f-a165-70867728950e}'])('rejects %s', (value) => {
    expect(isGuid(value)).toBe(false);
  });
});
