var path = require('path')
var webpack = require('webpack')
var ElectronConnectWebpackPlugin = require('electron-connect-webpack-plugin')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
})

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, 'src/main.js')
    ],
    vendor: ['pixi', 'p2', 'phaser', 'webfontloader']
  },
  devtool: 'cheap-source-map',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'out'),
    publicPath: './out/',
    filename: 'bundle.js'
  },
  watch: true,
  plugins: [
    definePlugin,
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),
    new ElectronConnectWebpackPlugin({
        test: /^.\/src/,
        path: "start.js",
        logLevel: 0
    })
  ],
  module: {
    preLoaders: [
      { test: /\.js?$/, loader: 'eslint', include: path.join(__dirname, 'src') }
    ],
    loaders: [
      { test: /\.js$/, loader: 'babel', include: path.join(__dirname, 'src') },
      { test: /pixi\.js/, loader: 'expose?PIXI' },
      { test: /phaser-split\.js$/, loader: 'expose?Phaser' },
      { test: /p2\.js/, loader: 'expose?p2' }
    ]
  },
  eslint: {
    failOnWarning: false,
    failOnError: true
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolve: {
    alias: {
      'phaser': phaser,
      'pixi': pixi,
      'p2': p2
    }
  }
}
