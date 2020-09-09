const path = require('path');
const webpack = require('webpack');
// 每次运行打包时清理过期文件
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// css模块资源优化插件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');   //导入插件
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// 文本分离插件，分离js和css
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//设置环境变量
const isDev = process.env.NODE_ENV === 'development';

const config = {
  entry: path.resolve(__dirname, 'src/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,  // 匹配到该的文件由该规则处理
        use: 'vue-loader'
      },
      {
        test: /\.(jpg|png|jpeg|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,   //如果文件大小小于1024字节，就会转义成base64,否则仍然是图片
              name: '[name].[ext]',
              outputPath: 'images/',
              esModule: false,
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE.ENV': isDev ? '"development"' : '"production"'
      }
    }),
    new htmlWebpackPlugin({   //创建一个在内存中生成html页面的插件
      template: 'index.html',   //指定模板页面
      //将来会根据此页面生成内存中的页面
      filename: 'index.html',   //指定生成页面的名称，index.html浏览器才会默认直接打开
      inject: true,
    }),
    new CleanWebpackPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@images': path.resolve(__dirname, 'src/assets/images'),
      '@styles': path.resolve(__dirname, 'src/assets/styles'),
    },
    //寻找文件后缀
    extensions: ['.js', '.css', '.vue', '.scss']
  },
  optimization: {
    //对生成的CSS文件进行代码压缩 mode='production'时生效
    minimizer: [
      new OptimizeCssAssetsWebpackPlugin()
    ]
  }
};

//开发模式
if (isDev) {
  config.devServer = {
    port: 8080,
    host: 'localhost',
    overlay: {
      errors: true
    },
    open: true,
    hot: true
  };
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),   //热加载模块
    new webpack.NoEmitOnErrorsPlugin()   //减少我们不需要的信息的展示
  );
  //开发环境中使用css
  config.module.rules.push(
    {
      test: /\.scss$/,
      use: ['style-loader',
        'css-loader',
        'sass-loader',
        'postcss-loader'
      ]
    }
  )
} else {
  config.module.rules.push(
    {
      test: /\.scss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            publicPath: '../'
          }
        },
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        },
        'postcss-loader'
      ]
    }
  );
  config.plugins.push(
    new MiniCssExtractPlugin({
      //为抽取出的独立的CSS文件设置配置参数
      filename: 'css/[name].css',
    })
  );
  config.output.filename = 'js/[name].js'
}

module.exports = config;




