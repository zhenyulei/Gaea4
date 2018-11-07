const webpack              = require('webpack');
const path                 = require('path');
const config               = require('./package.json');
const MinicssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin    = require('html-webpack-plugin');
const autoprefixer         = require('autoprefixer');
const CleanWebpackPlugin   = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { VueLoaderPlugin }    = require('vue-loader');
const WebpackUploadPlugin  = require('jdf2e-webpack-upload-plugin');
const htmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const AddAssetHtmlPlugin   = require('add-asset-html-webpack-plugin');
const CopyWebpackPlugin    = require('copy-webpack-plugin');
const moment               = require('moment');

module.exports = (env,argv)=> {

    let  webpackConfig = {
        entry:{
            app:'./src/app.js'
        },
        output:{
            path: path.resolve(__dirname, 'build' + '/' + config.version),
            publicPath: config.publicPath + '/'+config.version+'/',
            filename: 'js/[name].js'
        },
        stats: {
            entrypoints: false,
            children: false
        },
        resolve:{
            extensions:['.js','.vue','json'],
        },
        module:{
           rules:[
                {
                    test:/\.css$/,
                    use: [
                        MinicssExtractPlugin.loader,
                        "css-loader",
                        "postcss-loader"
                    ],
                    exclude:/node_modules/,
                    include:path.resolve(__dirname,'src')

                },
                {
                    test: /\.scss$/,
                    use: [
                        MinicssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader",
                        "postcss-loader"
                    ],
                    exclude:/node_modules/,
                    include:path.resolve(__dirname,'src')
                },
                {
                    test: /\.(png|jpg|gif|webp|woff|eot|ttf)$/,
                    use:{
                        loader:'url-loader',
                        options:{
                            name:'img/[name].[ext]',
                            limit:3000
                        }
                    },
                    exclude:/node_modules/,
                    include:path.resolve(__dirname,'src')
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-sprite-loader',
                    exclude:/node_modules/,
                    include:path.resolve(__dirname,'src')
                },
                {
                    test:/\.vue$/,
                    use:[
                        {
                            loader:'vue-loader',
                            options:{
                                loaders:{
                                    scss:[
                                        'vue-style-loader',
                                        MinicssExtractPlugin.loader,
                                        'css-loader',
                                        'sass-loader'
                                    ]
                                },
                                postcss: [autoprefixer()]
                            }
                        }
                    ],
                    exclude:/node_modules/,
                    include:path.resolve(__dirname,'src')
                },
                {
                    test:/\.js$/,
                    use:'babel-loader',
                    exclude:/node_modules/,
                    include:path.resolve(__dirname,'src')
                }
           ]
        },
        plugins:[
            new CleanWebpackPlugin('build'),
            new VueLoaderPlugin(),
            new HtmlWebpackPlugin({
                template:'./src/index.html'
    
            }),
            new MinicssExtractPlugin({
                filename: 'css/[name].css'
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css\.*(?!.*map)$/g,
                cssProcessorOptions: {
                    discardComments: { removeAll: true },
                    safe: true,
                    autoprefixer: false,
                },
    
            })
        ],
    }
    
    if(argv.mode === 'production'){
        webpackConfig.plugins = (webpackConfig.plugins || []).concat([
            new webpack.DllReferencePlugin({
                context:__dirname,
                manifest:require('./static/vendor-manifest.json')
            }),
            new htmlWebpackIncludeAssetsPlugin({
                assets:['/lib/vendor.dll.js'],
                publicPath:config.publicPath,
                append:false
                
            }),
            new CopyWebpackPlugin([
                { from: path.join(__dirname, "./static/vendor.dll.js"), to: path.join(__dirname, "./build/lib/vendor.dll.js") }
            ]),
            new webpack.BannerPlugin({
                banner:`${config.name} ${config.version} ${moment().format()}` 
            })
        ]);
        if(env && env.upload){
            webpackConfig.plugins = (webpackConfig.plugins || []).concat([
                new WebpackUploadPlugin({
                    host: '{{uploadHost}}',
                    source: 'build',
                    serverDir: config.ftpServer,
                    target: config.ftpTarget
                })
            ]);
        }
    
    }else{
        webpackConfig.output.publicPath = '/';
        webpackConfig.devtool = '#cheap-module-eval-source-map';
        webpackConfig.plugins = (webpackConfig.plugins || []).concat([
            new webpack.DllReferencePlugin({
                context:__dirname,
                manifest:require('./static/vendordev-manifest.json')
            }),
            new AddAssetHtmlPlugin({
                filepath: require.resolve('./static/vendordev.dll.js'),
                includeSourcemap: false
    
            })
        ]);
        webpackConfig.devServer = {
            contentBase:path.resolve(__dirname,'build'),
            //host:'192.168.191.2',
            //port:8080,
            compress:true,
            historyApiFallback:true
        }
    }
    
    return webpackConfig;
 
}
    

