
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const modulePathRe = /^([a-zA-Z0-9-]*)\.\w*\.js$/;
const pluginConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../plugins.config.json')));


const pluginModulePaths = fs.readdirSync('./dist')
  .filter(path => modulePathRe.test(path));

const manifest = pluginModulePaths.reduce((acc, modulePath) => {
  const pluginId = modulePath.match(modulePathRe)[1];

  const plugin = {
    modulePath,
    name: _.upperFirst(pluginId).replace(/-/g, ' '),
    description: '',
    version: '',
    tags: [],
    author: '',
    license: '',
    mapping: pluginConfig[pluginId] || {}
  };

  return {
    ...acc,
    ...{ [pluginId]: plugin }}
}, {});

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));
