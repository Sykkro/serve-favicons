const path = require('path');

const configLoader =
(defaultConfig = {}, configDir = process.cwd(), configFile = 'config.json') => {
  // private function for merging configs
  merge = (...objects) => {
    const isObject = (obj) => obj && typeof obj === 'object';
    const unique = (item, index) => array.indexOf(item) === index;

    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = [...pVal, ...oVal].filter(unique);
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = merge(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    }, {});
  };

  let externalConfig = {};
  const configPath= path.join(configDir, configFile);
  try {
    // try load external configuration
    externalConfig = require(configPath);
  } catch (exception) {
    console.warn(`config file ${configPath} not found, using defaults`);
  }

  // return the merge of defaults and external config
  const config = merge(defaultConfig, externalConfig);
  console.log('config loaded', config);
  return config;
};

module.exports = configLoader;
