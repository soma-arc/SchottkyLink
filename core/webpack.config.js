const path = require('path');
const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = () => ({
    entry: [`${src}/main.js`],

    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename]
        }
    },

    output: {
        path: dist,
        filename: 'bundle.js',
    },
    mode: 'development',

    module: {
        rules: [
        ]
    },

    devtool: (process.env.NODE_ENV === 'production') ? false : 'inline-source-map',

    resolve: {
        extensions: ['.js'],
    },

    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 8654
    },

    plugins: [
    ],
});
