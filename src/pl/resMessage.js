
const ResLib = require('../../../src/service').ResLib;
const Logger   = require('woveon-logger');
let logger    = new Logger('respltest', {debug : true, showName : true, level : 'verbose', color : 'blue'});
const pad    = require('woveon-engine-p').Service.pad;


/**
 * Specializes a Res Message object for the Test plugin.
 */
module.exports = class pltestMessageRSProto extends ResLib.prot.RSProto {

  /**
  */
  constructor() {
    super('test');

    Object.assign(this.plschema, {staysInPluginDB : {type : String}, plauthor : {type : String}});
  }

  /**
   * only in plugin data
   * @return {*} - some data that is stored in mongodb for testing
   */
  getStaysInPluginDB() {
    logger.info('pltestMessageRSProto getStaysInPluginDB');
    if ( this._rsdata ) return this._rsdata.staysInPluginDB;
    return undefined;
  };

  /**
   * in both, with different values
   * @return {String} - Author or undefined
   */
  getAuthor() {
    let retval = undefined;
    if ( this._rsdata && this._rsdata.plauthor ) retval = this._rsdata.plauthor;
    return retval;
  };

  /**
   * @return {String} - Subject or undefined
   */
  getSubject() {
    if ( this._rsdata  ) return this._rsdata.subject;
    return undefined;
  };

  /**
   * For this message, lookup parents in database, or pass in a completing Res.
   *
   * assumes remoteParentId is set (be it null or a value)
   *  NOTE: some RS protocols might not keep that assumption
   *
   * @param {Res} _withThisRes - A passed in Res to complete this with (or try). This is
   *                             used when you know the Res that completes this already.
   * @return {Object} - data to be merged into _wovdata
   */
  async tryToCompleteWithRes(_withThisRes) {
    let retval = await super.tryToCompleteWithRes(_withThisRes); // this._resmodel.wovproto._wovreq.forEach( (k) => retval[k] = undefined );

    logger.info(`tryToCompleteWithRes: complete:${this.getRemoteID()}   and retval: `, retval);

    // if this has no parent, set it all here (and complete)
    let rpid = this.getRemoteParentID();
    logger.info('  rpid: ', rpid);
    if ( rpid === null ) {
      retval.xidParent = this.getXIDParent();    // will set to null;
      retval.xidTop    = this.getXIDTop();       // will set to self
    }

    // if there is a parent, see if it is the passed in Res, or fetch
    else {
      if ( _withThisRes && rpid == _withThisRes.getRemoteID() ) {
        logger.info('  complete with passed in data');
        retval.xidParent = _withThisRes.getXIDParent();
        retval.xidTop    = _withThisRes.getXIDTop();
      }
      else {
        let parentdata = await this._resmodel.models.findOne({remoteId : rpid}).lean();
        if ( parentdata != null ) {
          logger.info('  fetched, complete with parent');
          retval.xidParent = parentdata.xid;
          retval.xidTop    = parentdata.xidTop;
        }
        // else incomplete
      }
    }

    logger.info('retval should have all the values to complete this now: ', retval);

    return retval;
  };
    /*

    // TODO: post processing

    // set remoteParentId
    this._wovdata.remoteParentId = pltestMessageRSProto.genRemoteParentID(this._rsdata);

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
    */


  /**
   * Data for reply to.
   * TODO: auto add the schema vars or at least check them here
   * @return {object} - The object
   */
  _reqPLData() {
    let retval = super._reqPLData();
    retval.remoteParentId  = this.getRemoteParentID();
    retval.xidTop          = this.getXIDTop();          // FIXME - these should be added in by default in MessageWovProto
    retval.xidParent       = this.getXIDParent();
    retval.plauthor        = this.getAuthor();
    retval.staysInPluginDB = this.getStaysInPluginDB();
    return retval;
  }


  /**
   * Just create based upon the created time field of the message.
   * @param {object} _rawmsg - data'
   * @return {Long} - An inc.
   */
  getResInc() {
    let retval = this._wovdata.resInc; // check this first, then try to compute
    if ( retval == null ) {
      if (this._rsdata && this._rsdata.created_time !== undefined ) {
        let epoc = 0;

        // get time from created_time on message or now
        if ( this._rsdata.created_time ) { epoc = new Date(this._rsdata.created_time).getTime(); }
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

        // set the value on wovdata since it needs it
        this._wovdata.resInc = retval;
      }

      // should always be able to compute this
      else { logger.throwError('plTestMessageModel::getResInc missing rsdata.created_time'); }
    }
    return retval;
  }
  /*
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
  */

  /**
   * pltest's remote id is 'pltestRemoteId'. returns null if that not set
   * @param {object} _rawmsg - data'
   * @return {String} -
   */
  getRemoteID() {
    let retval = undefined;
    if ( this._rsdata && this._rsdata.pltestRemoteId !== undefined ) {
      retval = this._rsdata.pltestRemoteId;
      this._wovdata.remoteId = retval;
    }
    // else { logger.throwError('plTestMessageModel::getRemoteID missing rsdata.pltestRemoteId'); }
    return retval;
  }
  // static genRemoteID(_rawmsg) { return _rawmsg.pltestRemoteId || null; }

  /**
   * pltest's remote parent id is 'pltestRemoteParentId'. returns null if that not set
   * @param {object} _rawmsg - data'
   * @return {String} -
   */
  getRemoteParentID() {
    let retval = undefined;
//     logger.info('getRemoteParentID : ', this._rsdata.pltestRemoteParentId );
    if ( this._rsdata && this._rsdata.pltestRemoteParentId !== undefined ) {
      retval = this._rsdata.pltestRemoteParentId;
      this._wovdata.remoteParentId = retval;
//       logger.info('    - getRemoteParentID : setting ', retval);

      // update wovdata if possible
      if ( this._wovdata.xidParent === undefined ) {
        // if no parent, then no xidParent and xidTop is self
        // if parent, then have to wait to complete the xidTop/Parent when we have the parent
        if ( retval == null ) { this._wovdata.xidParent = null; this._wovdata.xidTop = this._wovdata.xid; }
      }
    }
    // else { logger.throwError('plTestMessageModel::getRemoteParentID missing rsdata.pltestRemoteParentId'); }
    return retval;
  }
  // static genRemoteParentID(_rawmsg) { return _rawmsg.pltestRemoteParentId || null; }


};
