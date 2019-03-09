
const ResLib = require('../../../src/service').ResLib;
const Logger   = require('woveon-logger');
let logger    = new Logger('respltest', {debug : true, showName : true, level : 'verbose', color : 'blue'});
const pad    = require('woveon-engine-p').Service.pad;



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

      /**
       * lookup parents in database, or pass in a completing Res.
       *
       * assumes remoteParentId is set (be it null or a value)
       *  NOTE: some RS protocols might not keep that assumption
       *
       * @param {Res} _withThisRes - A passed in Res to complete this with (or try). This is
       *                             used when you know the Res that completes this already.
       * @return {Res} - returns itself for chaining commands
       */
      async tryToCompleteRL(_withThisRes = null) {

        // set remoteParentId
        this._wovdata.remoteParentId = TestMessagePLProto.genRemoteParentID(this._pldata);

        // logger.info('look for parent: ', this.getRemoteParentID());
        if ( this._wovdata.remoteParentId === null ) {
          this._wovdata.xidParent = null;
          this._wovdata.xidTop    = this._wovdata.xid;
        }
        else {

          // complete with a Res
          if ( _withThisRes ) {
            this._wovdata.xidTop    = _withThisRes.getXIDTop();
            this._wovdata.xidParent = _withThisRes.getXID();
          }

          // complete with an entry from db.posts (i.e. the reqPLData() values)
          else {
            let p = await this.model().findOne({remoteId : this.getRemoteParentID()}).lean();

            if ( p != null ) {
              // logger.info(`complete this ${this.getRemoteID()} with : ${p}`);
              this._wovdata.xidTop    = p.xidTop;
              this._wovdata.xidParent = p.xid;
            }
          }
        }

        return this;
      },

    });

    Object.assign(this.schema, {staysInPluginDB : {type : String}, author : {type : String}});
  }


  /**
   * Data for reply to.
   * TODO: auto add the schema vars or at least check them here
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
  static genResInc(_rawmsg) {
    let retval = null;
    if ( _rawmsg != null ) {
      let epoc = 0;

      // get time from created_time on message or now
      if ( _rawmsg.created_time ) { epoc = new Date(_rawmsg.created_time).getTime(); }
      else epoc = new Date().getTime();

      // get a counter, with 6 digits
      let staticcounter = module.exports.RESCOUNTER || 1;
      module.exports.RESCOUNTER = (staticcounter+1)%1000000;

      // git 3 random digits (starting at 0)
      let randbits = Math.floor(Math.random() * 1000) + 0;

      // put together with precedence: time > counter > random
      let lowbits= parseInt(`${pad(staticcounter, 6)}${pad(randbits, 3)}`);
      retval = new ResLib.Long(lowbits, epoc); // counter/rand(low), milliseconds (high)
      // logger.info('retval : ', retval);
    }
    return retval;
  };

  /**
   * pltest's remote id is 'pltestRemoteId'. returns null if that not set
   * @param {object} _rawmsg - data'
   * @return {String} -
   */
  static genRemoteID(_rawmsg) { return _rawmsg.pltestRemoteId || null; }

  /**
   * pltest's remote parent id is 'pltestRemoteParentId'. returns null if that not set
   * @param {object} _rawmsg - data'
   * @return {String} -
   */
  static genRemoteParentID(_rawmsg) { return _rawmsg.pltestRemoteParentId || null; }


};
