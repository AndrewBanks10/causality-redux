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

const externalsDist = {
    'redux': 'Redux'
};

const source = 'causality-redux.js';

module.exports = {
    entry: [path.join(__dirname, 'src/', source), path.join(__dirname, 'src/', 'linkcode.js')],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: source
    },
    externals: externalsDist,
    module: theModule
};



