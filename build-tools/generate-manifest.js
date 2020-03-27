
const fs = require('fs');
const _ = require('lodash');

const modulePathRe = /^([a-zA-Z0-9-]*)\.\w*\.js$/;

const pluginModulePaths = fs
  .readdirSync('./dist')
  .filter(path => modulePathRe.test(path));

const manifest = pluginModulePaths.reduce((acc, modulePath) => {
  const pluginId = modulePath.match(modulePathRe)[1];

  const infoPath = `./src/plugins/${pluginId}/package.json`;
  const pluginInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

  const {
    version = '',
    description = '',
    author = '',
    license = '',
    tags = [],
    mapping,
  } = pluginInfo;

  if (!mapping) {
    throw new Error(`No mapping found for ${pluginId} plugin`);
  }

  const plugin = {
    modulePath,
    name: _.upperFirst(pluginId).replace(/-/g, ' '),
    description,
    version,
    tags,
    author,
    license,
    mapping,
  };

  return {
    ...acc,
    ...{ [pluginId]: plugin },
  };
}, {});

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));
