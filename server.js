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


const requestListener = async (req, res) => {
  try {
    console.debug(JSON.stringify(req.headers));

    const parsed = parseRequest(req);
    console.debug('parsed request', parsed);

    const iconFilePath = icons.lookupIcon(parsed.icon, parsed.namespace);

    if (iconFilePath) {
      console.debug('returning icon', iconFilePath);
      const stat = fs.statSync(iconFilePath);
      res.writeHead(200, {
        'Content-Type': 'image/x-icon',
        'Content-Length': stat.size,
      });

      const readStream = fs.createReadStream(iconFilePath);
      readStream.pipe(res);
    } else {
      console.debug('icon not found');
      res.writeHead(404);
      res.end('File not Found');
    }

    console.debug('memory usage', process.memoryUsage());
  } catch (exception) {
    console.error('failed to process request', exception);
    res.writeHead(500);
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(global.config.port);
console.log(`Server started on port ${global.config.port}; pid ${process.pid}`);
