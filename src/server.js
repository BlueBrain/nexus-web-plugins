/**
 * Serve up the /dist directory files i.e. manifest.json and plugin js files
 * Useful when testing internal plugins locally from Fusion
 * Make sure to run make build_dist to populate the dist dir and for changes
 */
const express = require('express');
const path = require('path');

const app = express();

app.use(
  express.static(path.join(__dirname, '../dist'), {
    setHeaders(res) {
      res.set('Access-Control-Allow-Origin', '*');
    },
  })
);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(
    `\n\nPlugins Server is up and running on port ${port}.
    \nThe plugins manifest file should be accessible here: http://localhost:${port}/manifest.json
    \nSet the PLUGINS_MANIFEST_PATH env variable when starting your local Fusion instance to: http://localhost:${port}
    \n\nListening...
    `
  );
});
