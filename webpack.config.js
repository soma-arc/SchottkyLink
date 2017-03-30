require('babel-core/register');
const path = require('path');

const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = (env) => {
    if (!env.release) env.release = false;
    console.log((env.release === true) ?
                'Build for release.' :
                'Build for debug.\nGenerate source maps.');
    return {
        entry: src + '/index.js',

        output: {
            path: dist,
            filename: 'bundle.js',
        },

        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                },
            ],
        },

        devtool: (env.release === true) ? false : 'inline-source-map',


        resolve: {
            extensions: ['.js'],
        },

        devServer: {
            contentBase: 'dist',
            port: 3000,
        },

        plugins: [],
    };
};
