const path = require('path');

const src  = path.resolve(__dirname, 'test');
const dist = path.resolve(__dirname, 'tmp');

module.exports = {
    entry: `${src}/index.js`,
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
    output: {
        path: dist,
        filename: 'test-bundle.js',
    },
    target: 'node',
    devtool: 'cheap-module-source-map',
};
