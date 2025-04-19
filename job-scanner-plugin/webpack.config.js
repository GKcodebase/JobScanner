const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/popup.ts',
    content: './src/content/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public' },
        { from: 'src/popup/popup.html' },
        { from: 'src/popup/popup.css' }
      ],
    }),
    new Dotenv()
  ],
};