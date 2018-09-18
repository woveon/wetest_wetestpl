

const Logger                = require('woveon-logger');

const RemoteListenerService = require('woveon-engine-p').MicroServices.RemoteListener;
const Listener              = require('woveon-engine-p').Service.Listener;
const Requester             = require('woveon-engine-p').Service.Requester;


module.exports = class pltestRemoteListener extends RemoteListenerService {

  /**
   * Constructor.
   * @param {*} _config
   * @param {*} _options
   */
  constructor(_config, _options = {name: 'testRemoteListener'}) {
    super(_config, _options);
    let logger = new Logger('pltestrl'.toUpperCase(),
                  {showName: true, debug: true, level: 'info'},
                  {listener: false, requester: false});
    this.toTestPlugin= new Requester(logger, 'http://localhost:3010');
  }

  // This makes it so it maxes out at 10 channels.
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
   * @param {object} _ref - { ref : channel, args: _args, re:  }
   *   - This is a reference to data in the calling function so changes can be made to the values.
   *     - ref - the channel object, only with 'token' so far.
   *     - args - are the params passed directly from WoveonListener. if args is null, then
   *       channel already has those values (i.e. restarting)
   *     - re - The running entry for the channel is empty by default, but stores runtime data
   *       such as code to interpret the pushed data. Stored in the myChannelsLocalData variable
   *       on return.
   * @return {*} - server time of when connection was enabled; this is the monitoring time
   */
  async doConnectChannel(_ref) { // enableRSChannelConnection(_ref)
    this.logger.verbose(`pltestRemoteListener.doConnectChannelToRS ... start : ${JSON.stringify(_ref)}`);

    // set vales in mongodb channel document (i.e. row), to be saved to database
    if ( _ref.args != null ) {
      _ref.ref.pluginData = {oauth_token : _ref.args.oauth_token};
    }

    // enabled connection
    let v = {channel : _ref.ref.token, oauth_token : _ref.ref.pluginData.oauth_token};
    const result        = await this.toTestPlugin.post('/connect_channel', null, v, true);
    let retval = await result.json();
    this.logger.info('result of /connect_channel', retval);
    if ( retval.success == false ) {
      this.logger.error('Failed enabling connection. Does channel exist on server?', retval);
    } else if ( retval.success == true ) {
      let d = new Date(result.headers.get('date')).getTime();
      retval.data = {time : d};
    }

    this.logger.verbose('/connect_channel result ', retval);
    this.logger.verbose('pltestRemoteListener.enableRSChannelConnection... end');
    return retval;
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
   * Helper function abstraction to get the identifying information from a post.
   * @param {object} _post
   * @return {*} - post
   */
  getMsgId(_channel, _post) { return _post.id; };


  /**
   * Turn the date (down to second) into unix epoc in ms.
   * @param {object} _post
   * @return {int} - ms since unix epoc
   */
  getMsgInc(_channel, _post) {return new Date(_post.created_time).getTime();};


  // for now, just use monitor started time
  async getInc(_channel) { return _channel.e_mon; };


  /**
   * Converts remote service's post data into a Woveon post data item.
   * @param {*} _channel 
   * @param {*} _posts 
   */
  async convertChannelDataToRes(_channel, _res) {
    // TODO: this doesn't work

    // generates { posts:, comments:, likes:, }
    let woveondata = await ConvertToW.convertPosts(this, _channel, _res);
    return woveondata;
  }

};
