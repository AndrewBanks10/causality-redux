// webpack.config.js
var path = require('path');
var webpack = require('webpack');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

var theModule = {
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

var sourceTemplate = 'causality-redux';
var source = sourceTemplate + ".js";
var minFileName = sourceTemplate + ".min.js";

var externalsDist = {
    "redux": "Redux"
}

var externalsLib = {
    "redux": "redux"
}

var configDistCausalityRedux = {
        entry: path.join(__dirname, 'src/' + source),
        output: {
            path: path.join(__dirname, 'dist'),
            filename: source,
        },
        externals: externalsDist,
        module: theModule
}

var configDistCausalityReduxMin = {
        entry: path.join(__dirname, 'dist/' + source),
        output: {
            path: path.join(__dirname, 'dist'),
            filename: minFileName,
        },
        plugins: [
           new ClosureCompilerPlugin({
              compiler: {
                language_in: "ECMASCRIPT5",
                language_out: "ECMASCRIPT5",
                compilation_level: "SIMPLE"
              },
            })
        ]
}

var configLibCausalityRedux = {
    entry: path.join(__dirname, 'src/' + source),
    output: {
        path: path.join(__dirname, 'lib'),
        filename: source,
        libraryTarget: 'commonjs2',
    },
    externals: externalsLib,
    module: theModule
}

if ( process.env.NODE_ENV != 'min' ) {
    module.exports = [
        configDistCausalityRedux,
        configLibCausalityRedux,
    ];
} else {
    module.exports = [
        configDistCausalityReduxMin,
    ];
}

