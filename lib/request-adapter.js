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
  const reqHost = new URL(req.headers.host).host;
  const subdomainLength = reqHost.lastIndexOf(`.${domain}`);
  const reqIcon = reqHost.substr(0, subdomainLength).split('.');

  return ({
    icon: reqIcon[0],
    namespace: reqIcon[1],
  });
};

module.exports = (domain) => buildAdapter(domain);

