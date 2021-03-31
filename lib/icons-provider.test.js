const iconsProvider = require('./icons-provider');


test('should fail to load from missing icons', () => {
  expect(
      () => iconsProvider('missing'),
  ).toThrow(/not found/);
});

test('should be able to load icons and lookup by namespace', () => {
  expect(
      iconsProvider('icons')
          .lookupIcon('github', 'default'),
  ).toBeDefined();
  expect(
      iconsProvider('icons')
          .lookupIcon('randomiconthatdoesnotexist', 'default'),
  ).toBeUndefined();
});

test('should be able to load icons and lookup without namespace', () => {
  expect(
      iconsProvider('icons')
          .lookupIcon('mail'),
  ).toBeDefined();
  expect(
      iconsProvider('icons')
          .lookupIcon('randomiconthatdoesnotexist'),
  ).toBeUndefined();
});
