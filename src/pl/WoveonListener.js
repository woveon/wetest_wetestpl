const WoveonListenerService = require('../../../src/microservices/woveonListenerService');
const ReqRes                = require('../../../src/service/reqRes');
// const Service               = require('../../../src/service/service');
const Service               = require('woveon-service');
const WovReturn             = Service.WovReturn;

module.exports = class pltestWoveonListener extends WoveonListenerService {

  /**
   * Create a WoveonListener service for Test Plugin. Be aware of limits on the remote
   * listener that will effect load balancing.
   *
   * It uses OAuth to authenticate.
   *
   * @param {*} _options
   * @param {*} _config
   */
  constructor(_options, _config) {
    _options.name = _options.name || 'pltestWoveonListener';
    _options.channelValidateLaunch = true; // pseudo oauth validation, so not user-entered, but 'state' needs validation
    super(_options, _config);
  }


  /**
   * This contacts the testserver to do the remote_oauth. Save that oauth for later.
   *
   * @param {*} _args - the token t, or stateful value, create by this WL, when the API contacted
   *                it and told it that a user will be creating a channel.
   * @return {WovReturn} - a redirect to the remote_oauth url
   */
  async onChannelStart(_args) {
    let remoteAuthPath =
      `${this.config.pltest.remoteServer}/api/v1/remote_oauth` +
      `?woveon_id=1` +
      `&state=${_args.t}`;
    this.logger.info(`channel "${_args.t}" redirect to: "${remoteAuthPath}"`);
    return WovReturn.retRedirect(remoteAuthPath);
  }


  /**
   * @param {object} _channel - mongoose model for channel
   * @param {object} _args - contains 'state'
   * @return {WovReturn} - error on error, null on success
   */
  async onValidateLaunch(_channel, _args) {
    let retval = WovReturn.checkAttributes(_args, ['state', 'oauthtoken']);

    if ( retval == null ) {
      if ( _channel.state != _args.state ) {
        retval = WovReturn.retError(_args.state, 'Remote service returning back state variable');
      }
    }

    return retval;
  }


  /**
   *
   * @param {object} _channeldata - oauth token
   * @return {object} - oauthtoken and state
   */
  packPluginData(_channeldata) { return {oauthtoken : _channeldata.oauthtoken, state : _channeldata.state}; }


  /**
   * Creates a post in Test Plugin for the channel.
   * @param {*} _args - { token:, message:, }
   * @return {object} {postId:, authroUrl:}
   */
  async onCreatePost(_args) {
    this.logger.info('createPost token ', _args);
    let channel = await this.ChannelModel.findOne({token : _args.token});
    this.logger.info('channel: ', channel);
    if (channel == null) {
      throw new Error(
        `API asked for 'createPost' to unknown channel of token ${_args.token}.`
      );
    }

    const result = await this.toTestPlugin.post(
      `/${this.config.pltest.ver}/me/feed`,
      null,
      { access_token: channel.pluginData.pageToken, message: _args.message }
    );
    this.logger.info("createPost returned: ", result);
    if (result.id == null) this.logger.throwError("Should not be null.");
    if (result.error) {
      throw new Error(result.error.message);
    }

    return { postId: result.id, authorUrl: channel.pluginData.pageImage };
  }

  /**
   * Update a post in TestPlugin for the channel.
   * @param {*} _args - { token:, postId:, message:, }
   * @return {object} - ???
   */
  async onUpdatePost(_args) {
    const { pluginData } = await this.ChannelModel.findOne({
      token: _args.token
    });
    const result = await this.toTestPlugin.post(
      `/${this.config.pltest.ver}/${_args.postId}`,
      null,
      { access_token: pluginData.pageToken, message: _args.message }
    );
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  }

  /**
   * Delete a post in Test Plugin for the channel.
   * @param {*} _args - { token:, postId:, }
   * @return {*} ???
   */
  async onDeletePost(_args) {
    // this.logger.info('onDeletePost args: ', _args);
    let channel = await this.ChannelModel.findOne({ token: _args.token });
    // this.logger.info('channel ', channel);
    if (channel == null) {
      throw new Error(
        `API asked for 'deletePost' to unknown channel of token ${_args.token}.`
      );
    }
    const result = await this.toTestPlugin.delete(
      `/${this.config.pltest.ver}/${_args.postId}`,
      null,
      { access_token: channel.pluginData.pageToken }
    );
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  }

  /**
   * Creates a comment in Test Plugin for the channel.
   *
   * example from Woveon:
   * {
   *   "token": "PALR5WCJQSXOECUAXZRC",
   *   "type": "createComment",
   *   "postId": "142118089752457_148591905771742",
   *   "message": "C",
   *   "image": null,
   *   "video": null,
   *   "subject": "Facebook",
   *   "recipient": "asdf"
   * }
   *
   * @param {*} _args - { token:, postId:, message:, }
   *   - Channel token
   *   - A Test Plugin post identifier that this comment will be attached to.
   *   - Message to post as a comment.
   * @return {object} {postId:, authroUrl:}
   */
  async onCreateComment(_args) {
    console.log("createComment token ", _args.token);
    let channel = await this.ChannelModel.findOne({ token: _args.token });
    console.log("channel ", channel);

    if (channel == null) {
      throw new Error(
        `API asked for 'createComment' to unknown channel of token ${
          _args.token
        }.`
      );
    }

    const result = await this.toTestPlugin.post(
      `/${this.config.pltest.ver}/${_args.postId}/comments`,
      null,
      { access_token: channel.pluginData.pageToken, message: _args.message }
    );
    this.logger.info("createPost returned: ", result);

    //should.notEqual(result.id, null);
    if (result.id == null) this.logger.throwError("Should not be null.");
    if (result.error) {
      throw new Error(result.error.message);
    }

    return { commentId: result.id, authorUrl: channel.pluginData.pageImage };
  }
};