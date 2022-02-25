
const path = require('path');
const fs = require('fs');

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;



const pluginEntry = fs.readdirSync('./src/plugins')
  .reduce((pluginEntry, pluginName) => ({
    ...pluginEntry,
    ...{ [pluginName]: `./src/plugins/${pluginName}/index.tsx` },
  }), {});


module.exports = {
  mode: 'production',
  plugins: [
    // new BundleAnalyzerPlugin(),
  ],
  externals: {
    react: 'react',
    'react-dom': 'react-dom'
  },
  entry: pluginEntry,
  module: {
    rules: [
      {
        test: /\.(le|sa|sc|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
        ]
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
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', 'css']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'system',
    filename: '[name].[contenthash].js',
  },
};
