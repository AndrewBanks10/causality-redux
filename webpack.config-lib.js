// webpack.config.js
const path = require('path');

const theModule = {
    loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }
    ]
};

const externalsLib = {
    'redux': 'redux'
};

const source = 'causality-redux.js';

module.exports = {
    entry: path.join(__dirname, 'src', source),
    output: {
        path: path.join(__dirname, 'lib'),
        filename: source,
        libraryTarget: 'commonjs2'
    },
    externals: externalsLib,
    module: theModule
};

