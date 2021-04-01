const auth = require('basic-auth');

const buildAdapter = (domain) => (req) => {
  // if HTTP basic auth was provided, use it
  const credentials = auth(req);
  if (credentials) {
    return ({
      namespace: credentials.pass,
      icon: credentials.name,
    });
  }

  // otherwise, attempt with subdomain
  const headersHost = req.headers.host;
  try {
    const reqHost = new URL(headersHost).host;
    const subdomainLength = reqHost.lastIndexOf(`.${domain}`);
    const reqIcon = reqHost.substr(0, subdomainLength).split('.');

    return ({
      icon: reqIcon[0],
      namespace: reqIcon[1],
    });
  } catch (exception) {
    console.debug(`ignoring failed url parse of ${headersHost}`);
  }

  return undefined;
};

module.exports = (domain) => buildAdapter(domain);

