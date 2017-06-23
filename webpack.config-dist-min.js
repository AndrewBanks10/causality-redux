// webpack.config.js
const path = require('path');
const ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = {
    entry: path.join(__dirname, 'dist/causality-redux.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'causality-redux.min.js'
    },
    plugins: [
        new ClosureCompilerPlugin({
            compiler: {
                language_in: 'ECMASCRIPT5',
                language_out: 'ECMASCRIPT5',
                compilation_level: 'SIMPLE'
            }
        })
    ]
};


