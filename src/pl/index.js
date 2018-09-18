
module.exports = {
  // Plugin dependencies
  PE             : require('woveon-engine-p'),
  Logger         : require('woveon-logger'),


  Config         : require('./Config'),
  WoveonListener : require('./WoveonListener'),
  RemoteListener : require('./RemoteListener'),
  Overseer       : require('./Overseer'),

  plResource     : require('./plresource'),
};
