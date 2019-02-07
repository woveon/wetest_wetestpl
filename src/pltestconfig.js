let WEConfig = require('woveon-engine-p').Service.WEConfig;

module.exports = class PltestConfig extends WEConfig {

  /**
   * @param {Logger} _logger - logger for config
   */
  constructor(_logger) {
    super(_logger,
      ['WOV_we_wl_port', 'WOV_we_db_url', 'WOV_we_db_collection', 'WOV_we_fullurl'],
      []);
  }
};
