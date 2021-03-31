const loadConfig = require('./config-loader');

const defaultConfig = {
  'a': 1,
  'b': {
    'c': 'cc',
    'd': 44,
  },
  'domain': 'default',
};


test('should apply default config if no override is provided', () => {
  expect(loadConfig(defaultConfig)).toEqual(defaultConfig);
});

test('should apply loaded config', () => {
  const loaded = loadConfig(defaultConfig, '../sample', 'config.json');
  expect(loaded.a).toBe(1);
  expect(loaded.domain).toBe('example.domain.com');
  expect(loaded.port).toBe(8080);
});
