
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

      // only in plugin data
      getStaysInPluginDB : function() { if ( this._pldata ) return this._pldata.staysInPluginDB; return null; },

      // in both, with different values
      getAuthor : function() {
        if ( this._wovdata && this._wovdata.author ) return this._wovdata.author;
        if ( this._pldata && this._pldata.plauthor ) return this._pldata.plauthor;
        return null;
      },

      // in both
      getSubject : function() {
        if ( this._wovdata && this._wovdata.subject ) return this._wovdata.subject;
        if ( this._pldata  ) return this._pldata.subject;
        return null;
      },
    });

    Object.assign(this.schema, {staysInPluginDB : {type : String}, author : {type : String}});
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


  /**
   * Just create based upon the created time field of the message.
   * @param {object} _rawmsg - data'
   * @return {Long} - An inc.
   */
  static genResInc(_rawmsg) { return new ResLib.Long(new Date(_rawmsg.created_time).getTime(), null); }

};
