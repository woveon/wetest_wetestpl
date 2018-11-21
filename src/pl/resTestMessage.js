
const ResLib = require('../../../src/service').ResLib;


/**
 * Specializes a Res Message object for the Test plugin.
 */
module.exports = class TestMessagePLProto extends ResLib.prot.PLProto {

  /**
   */
  constructor() {
    super('test');

    Object.assign(this.interface, {
      getStaysInPluginDB : function() { return this._pldata.staysInPluginDB; },
    });

    Object.assign(this.schema, {staysInPluginDB : {type : String}});
  }


  /**
   * Data for reply to.
   * @return {object} - The object
   */
  _reqPLData() {
    let retval = super._reqPLData();
    retval.author = this.getAuthor();
    retval.sipdb  = this.getStaysInPluginDB();
    return retval;
  }

};
