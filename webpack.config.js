const webpack = require('webpack');
const path = require('path');

const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'docs');

module.exports = () => ({
    entry: `${src}/index.js`,

    output: {
        path: dist,
        filename: 'bundle.js',
    },

    module: {
        rules: [
            {
                test: /\.vue$/, loader: 'vue-loader'
            },
            {
                test: /\.(glsl|vert|frag)$/,
                exclude: /\.(njk|nunjucks)\.(glsl|vert|frag)$/,
                loader: 'shader-loader',
            },
            {
                test: /\.(njk|nunjucks)\.(glsl|vert|frag)$/,
                loader: 'nunjucks-loader',
                query: {
                    root: `${__dirname}/src`,
                },
            },
            {
                loader: 'babel-loader',
                options: {
                    presets: [['@babel/preset-env', { modules: false }]]
                }
            },
            {
                test: /\.png$/,
                exclude: /node_modules/,
                loader: 'url-loader',
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ],
    },

    devtool: (process.env.NODE_ENV === 'production') ? false : 'inline-source-map',

    resolve: {
        extensions: ['.js'],
    },

    devServer: {
        contentBase: dist,
        port: 8080
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
});
