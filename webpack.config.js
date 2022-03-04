const path = require('path');
const fs = require('fs');

const pluginEntry = fs
  .readdirSync('./src/plugins')
  .reduce((pluginEntry, pluginName) => {
    return {
      ...pluginEntry,
      ...{ [pluginName]: `./src/plugins/${pluginName}/index.tsx` },
    };
  }, {});

module.exports = {
  mode: 'production',
  cache: {
    type: 'filesystem',
    compression: 'gzip',
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  entry: pluginEntry,
  module: {
    rules: [
      {
        test: /\.(le|sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            noEmit: false,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', 'css'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'system',
    filename: '[name].[contenthash].js',
  },
};
