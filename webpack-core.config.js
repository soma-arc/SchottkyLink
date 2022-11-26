const path = require('path');
const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = () => ({
    entry: [`${src}/core/core.js`],

    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename]
        }
    },

    output: {
        library: 'SchottkyLink',
        path: dist,
        filename: (process.env.NODE_ENV === 'production') ?
            'schottky-link-core.min.js' : 'schottky-link-core.js'
    },
    mode: 'development',

    module: {
        rules: [
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
                            presets: [['@babel/preset-env']]
                        }
                    }
                ]
            },
            {
                test: /\.png$/,
                exclude: /node_modules/,
                type: 'asset/resource'
            },
        ]
    },

    devtool: (process.env.NODE_ENV === 'production') ? false : 'eval',

    resolve: {
        extensions: ['.js'],
    }
});
