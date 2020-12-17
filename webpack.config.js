const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: [
      path.join(__dirname, 'web/html'),
      path.join(__dirname, 'web/res'),
      path.join(__dirname, 'web/dist'),
    ],
    compress: true,
    port: 8080
  }
};