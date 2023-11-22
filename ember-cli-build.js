'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // babel: {
    //   loose: true,
    //   plugins: [
    //     ['@babel/plugin-proposal-decorators', { legacy: true }],
    //     ['@babel/plugin-transform-class-properties', { loose: true }],
    //     [require.resolve('@babel/plugin-transform-private-methods'), { loose: true }],
    //   ],
    //   plugins: [
    //     require.resolve('@babel/plugin-transform-private-methods')
    //   ],
    // },
  });

  return app.toTree();
};
