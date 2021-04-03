const fs = require('fs');

// send OK result, with matching icon content
const sendIcon = async (res, iconFilePath) => {
  console.debug('returning icon', iconFilePath);
  const stat = fs.statSync(iconFilePath);
  res.writeHead(200, {
    'Content-Type': 'image/x-icon',
    'Content-Length': stat.size,
  });

  const readStream = fs.createReadStream(iconFilePath);
  readStream.pipe(res);
};

// send missing result, when requested icon was not found
const sendMissing = async (res) => {
  console.debug('icon not found');
  res.writeHead(404);
  res.end('File not Found');
};

// send an error message
const sendError = async (res, exception) => {
  console.error('failed to process request', exception);
  res.writeHead(500);
  res.end();
};

// handle an icon request
const handleIcon = (parse, lookup) => async (req, res) => {
  const parsed = parse(req);
  console.debug('parsed request', parsed);

  if (!parsed) {
    sendMissing(res);
  } else {
    const iconFilePath = lookup(parsed.icon, parsed.namespace);

    if (iconFilePath) {
      sendIcon(res, iconFilePath);
    } else {
      sendMissing(res);
    }
  }
};

// handle a ping request
const handlePing = async (req, res) => {
  const usage = process.memoryUsage();
  console.debug('memory usage', usage);
  res.writeHead(200);
  res.end(`OK ${usage.rss}`);
};

// export definitions
module.exports = (parse, lookup) => ({
  sendMissing,
  sendError,
  handleIcon: handleIcon(parse, lookup),
  handlePing,
});
