let WEConfig = require('woveon-engine-p').Service.WEConfig;

module.exports = class PltestConfig extends WEConfig {

  /**
   * @param {Logger} _logger - logger for config
   */
  constructor(_logger) {
    super(_logger,
      //[],
      //[ 'WOV_api_ver', 'WOV_testserver_redirectUrl', 'WOV_api_port_ext', 'WOV_api_fullurl',
       [ 'WOV_we_wl_port', 'WOV_we_db_url', 'WOV_we_db_collection', 'WOV_we_fullurl'],
      //['WOV_plem_testing_imap_host', 'WOV_plem_testing_imap_port', 'WOV_plem_testing_smtp_host', 'WOV_plem_testing_smtp_port', 'WOV_plem_testing_user'],
      []);
  }
};
