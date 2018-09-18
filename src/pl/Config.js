
  
let Config = require('../../../src').Service.Config;


Config.pltest = {

  // Place any additional information necessary to connect to the remote service here
//  appId       : process.env.WOV_plugin_pltest_appId,
  redirectPath: process.env.WOV_plugin_pltest_redirectPath,
  remoteServer: "http://localhost:3010",
//  clientId    : process.env.WOV_plugin_pltest_clientId,
//  clientSecret: process.env.WOV_plugin_pltest_clientSecret,
//	ver         : process.env.WOV_plugin_pltest_ver,

//	appSecret   : process.env.WOV_plugin_pltest_appSecret,
//	verifyToken : process.env.WOV_plugin_pltest_verifyToken,

};

module.exports = Config;
