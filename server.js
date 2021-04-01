const http = require('http');
const fs = require('fs');

const global = {}; // will hold global state

const defaultConfig = { // base config
  'domain': 'icons.local',
  'port': 8080,
  'icons': {
    'basedir': 'icons',
  },
};
const iconsConfigDir = process.env.ICONS_CONFIG_DIR || __dirname;
global.config = require('./lib/config-loader')(defaultConfig, iconsConfigDir);
const icons = require('./lib/icons-provider')(global.config.icons.basedir);
const parseRequest = require('./lib/request-adapter')(global.config.domain);

const sendOk = async (res, iconFilePath) => {
  console.debug('returning icon', iconFilePath);
  const stat = fs.statSync(iconFilePath);
  res.writeHead(200, {
    'Content-Type': 'image/x-icon',
    'Content-Length': stat.size,
  });

  const readStream = fs.createReadStream(iconFilePath);
  readStream.pipe(res);
};

const sendMissing = async (res) => {
  console.debug('icon not found');
  res.writeHead(404);
  res.end('File not Found');
};

const sendError = async (res, exception) => {
  console.error('failed to process request', exception);
  res.writeHead(500);
  res.end();
};

const serveIcon = async (req, res) => {
  const parsed = parseRequest(req);
  console.debug('parsed request', parsed);

  if (!parsed) {
    sendMissing(res);
  } else {
    const iconFilePath = icons.lookupIcon(parsed.icon, parsed.namespace);

    if (iconFilePath) {
      sendOk(res, iconFilePath);
    } else {
      sendMissing(res);
    }
  }
};

const servePing = async (req, res) => {
  const usage = process.memoryUsage();
  console.debug('memory usage', usage);
  res.writeHead(200);
  res.end(`OK ${usage.rss}`);
};

const requestListener = async (req, res) => {
  try {
    if (/^\/?(favicon.ico)?$/i.test(req.url)) {
      serveIcon(req, res);
    } else if (/^\/ping\/?/i.test(req.url)) {
      servePing(req, res);
    } else {
      sendMissing(res);
    }
  } catch (exception) {
    sendError(res, exception);
  }
};

const server = http.createServer(requestListener);
server.listen(global.config.port);
console.log(`Server started on port ${global.config.port}; pid ${process.pid}`);
