

const Logger                = require('woveon-logger');

const WE                    = require('woveon-engine-p');
const WEService             = WE.Service;
const ResLib                = WEService.ResLib;
const RemoteListenerService = WE.MicroServices.RemoteListener;
// const Listener              = WEService.Listener;
const Requester             = WEService.Requester;
const WovReturn             = WEService.WovReturn;
const Long                  = WEService.DB.Mongoose.Types.Long;


const C                     = require('woveon-engine-p').Service.Config;

module.exports = class pltestRemoteListener extends RemoteListenerService {

  /**
   * Constructor.
   * @param {*} _options
   */
  constructor(_options = {}) {
    let options = Object.assign({}, {
      name : 'pltestrl',
    }, _options);
    super(options);
    let logger = new Logger('pltestrl'.toUpperCase(),
                  {showName : true, debug : true, level : 'info'},
                  {listener : false, requester : false});
    this.toTestPlugin= new Requester(logger, 'http://localhost:3010');

    // standard is fine
    this.postProcessRes_Messages = this.postProcessRes_Messages_Hierarchy;
    logger.info('this.postProcessRes_Messages: ', this.postProcessRes_Messages);
  }

  /**
   * Create a model to genereate Resource objects
   * @return {ResModel} - the model representing both the Message and the RemoteService
   */
  doInitMessageModel() {
    const resp = new WEService.ResTypes.Message();
    const plp  = new (require('./resMessage'))();
    const MessageModel = new ResLib.ResModel(resp, plp);
    return MessageModel;
  }

  /**
   * This makes it so it maxes out at 10 channels.
   * @return {float} - fraction of capacity this RL is operating at (i.e. .1 is 10%)
   */
  getCapacity() {
//    this.logger.info('getCapacity :', Object.keys(this.myChannels).length);
    return Object.keys(this.myChannels).length / 10;
  }


  /**
   * Add routes to the listener for push updates from the remote service. For
   * example, webhooks. This test service does not have this.
   */
  async onInit() {
    await super.onInit();
    this.logger.verbose('HERE: Add routes, such as webhooks and health checks');
  };


  /**
   * NOTE: This is not a route handler.
   *
   * Called during /start_channel. Connects to the remote service to start the
   * notification of changes. Do any additional code to connect to the remote
   * service or complete authentication.
   *
   * - The _ref.ref.pluginData value stores channel specific variables needed
   *   to start/restart the channel. This will be stored to the database.
   * - To store running channel specific code/data relevant to the current listener,
   *   store it in myChannelsLocalData[token].
   *
   *
   *   ex. for Facebook, obtain an extended token, then turn on webhooks
   * @param {object} _ref - { cref : channel, args: _args, lref:  }
   *   - This is a reference to data in the calling function so changes can be made to the values.
   *     - ref - the channel object, only with 'token' so far.
   *     - args - are the params passed directly from WoveonListener. if args is null, then
   *       channel already has those values (i.e. restarting)
   *     - re - The running entry for the channel is empty by default, but stores runtime data
   *       such as code to interpret the pushed data. Stored in the myChannelsLocalData variable
   *       on return.
   * // @return {*} - server time of when connection was enabled; this is the monitoring time
   * @return {Array} - empty array since this doesn't do subchannels
   *
   */
  async doConnectChannel(_ref) { // enableRSChannelConnection(_ref)
    this.logger.aspect('doConnectChannel', `pltestRemoteListener.doConnectChannelToRS ... start : ${JSON.stringify(_ref)}`);
    let retval = WovReturn.checkAttributes(_ref, ['cref', 'args', 'lref']);

    if ( retval == null ) {
      let v = {token : _ref.cref.token, oauthtoken : _ref.cref.pluginData.oauthtoken};
      this.logger.aspect('doConnectChannel', 'calling /hook_start with ', v);
      let result = await this.toTestPlugin.post(`/rs/${C.get('WOV_api_ver')}/hook_start`, null, v );
      this.logger.aspect('doConnectChannel', 'result of /hook_start', result);
      if ( result.success == false ) {
        retval = WovReturn.retError(result, 'Failed enabling connection. Does channel exist on server?');
      }
      else if ( result.success == true ) {
        // let d = new Date().getTime();
        // retval = WovReturn.retSuccess( Object.assign({}, result.data, {time : d}));
        _ref.cref.e_mon = Long.fromBits((new Date()).getTime(), 0);
      }
    }
    /*

    // enabled connection
    if ( retval == null ) {
      let v = {token: _ref.ref.token, oauthtoken : _ref.ref.pluginData.oauthtoken}; // _ref.ref.pluginData.oauthtoken};
      this.logger.aspect('doConnectChannel', 'calling /hook_start with ', v);
      let result = await this.toTestPlugin.post(`/rs/${C.get('WOV_api_ver')}/hook_start`, null, v );
      this.logger.aspect('doConnectChannel', 'result of /hook_start', result);
      if ( result.success == false ) {
        retval = WovReturn.retError(result, 'Failed enabling connection. Does channel exist on server?');
      } else if ( result.success == true ) {
        let d = new Date().getTime();
        retval = WovReturn.retSuccess( Object.assign({}, result.data, {time : d}));
      }
    }
    this.logger.aspect('doConnectChannel', '/connect_channel result ', retval);
    */

    this.logger.aspect('doConnectChannel', 'pltestRemoteListener.enableRSChannelConnection... end');
    return []; // return no subchannels
  };


  /**
   * NOTE: not a route handler (called from doStopChannel or when first starting a channel
   * Disable the remote service notification of changes.
   * @param {object} _channel - the channel object
   */
  async doDisableChannel(_channel) { // disableRSChannelConnection
    this.logger.info(`NEED TO IMPLEMENT disableRSChannelConnection on ${JSON.stringify(_channel)}.`);
  };


  /** 
   * Get messages on and going back from a time.
   */
  async fetchRSOnAndBefore(_time, _limit, _channel) {
    let removedMsgs =0;
    this.logger.verbose(`fetchRSOnAndBefore: time:'${_time}' l:'${_limit}' channel:'${_channel}'`);

    let msgs = await this.toTestPlugin.get()
      .catch((e) => {console.log(e); throw new Error('Error fetchRSOnAndBefore');});

    this.logger.verbose('  fetchRSOnAndBefore msgs - ', msgs);
    return msgs.data;
  };


  /**
   * Inc of the channel.
   *
   * @param {object} _channel -
   * @return {Long} -
   */
  async getInc(_channel) { return _channel.e_mon; };


  /**
   * Converts remote service's post data into a Woveon post data item.
   * @param {String} _ctoken - channel token
   * @param {Object}_rawdata - for pltest, just json
   * @return {array} - of Res
   */
  convertChannelDataToRes(_ctoken, _rawdata) {
    let retval = [];
    _rawdata.forEach( (_rsdata) => {
      retval.push(this.MessageModel.generateRes(null, _rsdata, _ctoken));
    });
    return retval;
  }

};
