const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require("vue-loader");

const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'docs');

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
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                    }
                ]
            },
            {
                test: /\.csv$/,
                use: [
                    {
                        loader: 'csv-loader'
                    }
                ]
            },
            {
                test: /\.(glsl|vert|frag)$/,
                exclude: /\.(njk|nunjucks)\.(glsl|vert|frag)$/,
                use: [
                    {
                        loader: 'shader-loader',
                    }
                ]
            },
            {
                test: /\.(njk|nunjucks)\.(glsl|vert|frag)$/,
                use: [
                    {
                        loader: 'nunjucks-loader'
                    }
                ]
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-env', { modules: false }]]
                        }
                    }
                ]
            },
            {
                test: /\.png$/,
                exclude: /node_modules/,
                type: 'asset/resource'
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ],
            }
        ]
    },

    devtool: (process.env.NODE_ENV === 'production') ? false : 'inline-source-map',

    resolve: {
        extensions: ['.js'],
    },

    devServer: {
        static: {
            directory: path.join(__dirname, "docs"),
        },
        port: 3000,
    },

    plugins: [
        new VueLoaderPlugin()
    ],
});
