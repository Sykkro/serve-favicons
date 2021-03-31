const path = require('path');
const fs = require('fs');

// auxiliary function to sanitize lookup keys
const buildLookupKey = (filename) =>
  filename.replace(/\..+$/, '').replace(/[^\w]/g, '').toLowerCase();

// auxiliary function to initialize data,
// by loading icons from all sub-directories of a provided directory
const loadIcons = (iconsDir) => {
  const validFiles = (item) => !(/(^|\/)\.[^\/\.]/g).test(item);

  if (!fs.existsSync(iconsDir)) {
    console.warn(`${iconsDir} not found`);
    throw new Error(`LoadIcons init failed — directory ${iconsDir} not found`);
  }

  const dirs = fs.readdirSync(iconsDir).filter(validFiles);

  const icons = {
    dir: iconsDir,
    ns: {},
  };

  dirs.forEach((namespace) => {
    icons.ns[namespace] = {};
    const nsDir = path.join(iconsDir, namespace);
    const files = fs.readdirSync(nsDir).filter(validFiles);
    files.forEach((icon) => icons.ns[namespace][buildLookupKey(icon)] = icon);
  });

  console.log('Icons loaded', icons);
  return icons;
};

// auxiliary function to build a lookup function
// (by name and optional namespace), based on a preloaded set of icons
const buildLookup = (icons) => {
  const doLookup = (name, namespace) => {
    if (namespace) {
      if (!icons.ns[namespace]) {
        return undefined; // unknown namespace
      }
      // lookup specific namespace
      const iconKey = buildLookupKey(name);
      const match = icons.ns[namespace][iconKey];
      if (match) {
        return path.format({
          dir: path.join(icons.dir, namespace),
          base: match,
        });
      } else {
        // not found in this namespace
        return undefined;
      }
    } else {
      // lookup in all namespaces, recursively
      return Object.keys(icons.ns)
          .map((each) => doLookup(name, each))
          .find((_) => _);
    }
  };
  return doLookup;
};

// load icons on import and export a function to lookup for icons
module.exports = (iconsDir) => {
  const icons = loadIcons(iconsDir);
  const doLookup = buildLookup(icons);
  return {
    lookupIcon: doLookup,
  };
};
