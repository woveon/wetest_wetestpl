
let Config = require('../../../src').Service.Config;

Config.pltest = {

  // Place any additional information necessary to connect to the remote service here
//  redirectPath: process.env.WOV_plugin_pltest_redirectPath,
  remoteServer : 'http://localhost:3010',
};

module.exports = Config;
