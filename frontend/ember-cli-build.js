'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    resolve: {
      fallback: { "url": require.resolve("url/") }
    }
    });

  return app.toTree();
};
