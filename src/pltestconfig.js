let WEConfig = require('woveon-engine-p').Service.WEConfig;

module.exports = class PltestConfig extends WEConfig {

  /**
   * @param {Logger} _logger - logger for config
   */
  constructor(_logger) {
    super(_logger,
      [],
      []);
  }
};
