// const Logger          = require('woveon-logger');

const OverseerService = require('woveon-engine-p').MicroServices.Overseer;
// const Listener        = require('woveon-engine-p').Service.Listener;


module.exports = class pltestOverseer extends OverseerService {

  /**
   * Constructor.
   * @param {*} _config
   */
  constructor({name = 'testOverseerListener', logger= null}, _config) {
    super({name, logger}, _config);
  }
};
