/*eslint no-console:0 */
'use strict';
require('core-js/fn/object/assign');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');//实时加载特性的开发服务器
const config = require('./webpack.config');
const open = require('open');//open a file or url in the user's preferred application

new WebpackDevServer(webpack(config), config.devServer)//根据config启动server
.listen(config.port, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:' + config.port);
  console.log('Opening your system browser...');
  open('http://localhost:' + config.port + '/webpack-dev-server/');
});
