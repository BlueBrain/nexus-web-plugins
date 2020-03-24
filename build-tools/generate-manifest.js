const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const modulePathRe = /^([a-zA-Z0-9-]*)\.\w*\.js$/;
const pluginConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../plugins.config.json'))
);

const pluginModulePaths = fs
  .readdirSync('./dist')
  .filter(path => modulePathRe.test(path));

const manifest = pluginModulePaths.reduce((acc, modulePath) => {
  const pluginId = modulePath.match(modulePathRe)[1];

  let pluginInfo = {};

  const infoPath = `./src/plugins/${pluginId}/package.json`;

  try {
    if (fs.existsSync(infoPath)) {
      pluginInfo = JSON.parse(
        fs.readFileSync(`./src/plugins/${pluginId}/package.json`, 'utf8')
      );
    }
  } catch (err) {
    console.error(err);
  }

  const {
    version = '',
    description = '',
    author = '',
    license = '',
    tags = [],
  } = pluginInfo;

  const plugin = {
    modulePath,
    name: _.upperFirst(pluginId).replace(/-/g, ' '),
    description,
    version,
    tags,
    author,
    license,
    mapping: pluginConfig[pluginId] || {},
  };

  return {
    ...acc,
    ...{ [pluginId]: plugin },
  };
}, {});

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));
