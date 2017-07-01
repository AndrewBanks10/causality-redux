const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config.config');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: [
        'react-hot-loader/patch',
        `webpack-dev-server/client?http://${process.env.npm_package_config_host}:${process.env.npm_package_config_port}`,
        'webpack/hot/only-dev-server',
        path.join(config.basePath, config.testEntryJs) 
    ],
    output: {
        path: config.absoluteBuildPath,
        filename: `${config.bundleName}.js`
    },
    plugins: [
        new webpack.DefinePlugin({
            '__DEV__': true,
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.DllReferencePlugin({
            context:config.absoluteDllPath, 
            manifest: require(path.join(config.absoluteDllPath, `${config.dllBundleName}.json`))
        }),
        new HtmlWebpackPlugin({
            template: config.htmlDevTemplate, 
            inject: 'body' 
        })
    ],
    module: config.module,
    resolve: config.resolveEntry
};


