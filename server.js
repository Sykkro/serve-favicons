const http = require('http');

const global = {}; // will hold global state

const defaultConfig = { // base config
  'domain': 'icons.local',
  'port': 8080,
  'icons': {
    'basedir': 'icons',
  },
};

// load environment variables
const inDebugMode = !!process.env.ICONS_DEBUG_MODE;
const iconsConfigDir = process.env.ICONS_CONFIG_DIR || __dirname;

if (!inDebugMode) {
  console.debug = () => {};
}

// load utility modules
global.config = require('./lib/config-loader')(defaultConfig, iconsConfigDir);
const icons = require('./lib/icons-provider')(global.config.icons.basedir);
const parser = require('./lib/request-parser')(global.config.domain);
const handlers = require('./lib/request-handlers')(parser, icons.lookupIcon);

const requestListener = async (req, res) => {
  try {
    if (/^\/?(favicon.ico)?$/i.test(req.url)) {
      handlers.handleIcon(req, res);
    } else if (/^\/ping\/?/i.test(req.url)) {
      handlers.handlePing(req, res);
    } else {
      handlers.sendMissing(res);
    }
  } catch (exception) {
    handlers.sendError(res, exception);
  }
};

const server = http.createServer(requestListener);
server.listen(global.config.port);
console.log(`Server started on port ${global.config.port}; pid ${process.pid}`);
