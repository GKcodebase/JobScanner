const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/popup.ts',
    content: './src/content/index.ts',
    settings: './src/settings/settings.ts'
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
        { 
          from: 'src/popup/popup.html',
          to: 'popup.html'
        },
        { 
          from: 'src/settings/settings.html',
          to: 'settings.html'
        },
        { 
          from: 'src/popup/popup.css',
          to: 'popup.css'
        },
        { 
          from: 'src/settings/settings.css',
          to: 'settings.css'
        },
        { from: 'src/components', to: 'components' },
        { from: 'src/styles', to: 'styles' }
      ],
    }),
    new Dotenv()
  ],
};