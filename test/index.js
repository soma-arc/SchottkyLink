// Producing a single test bundle
// https://github.com/webpack-contrib/karma-webpack/issues/23
const testsContext = require.context('.', true, /_test.js$/);
testsContext.keys().forEach(testsContext);
