const WL     = require('./pl/WoveonListener');

// Set up logging
// NOTE: should probably makes these env variables
let logger           = new (require('woveon-logger'))('pltest', 
			{showName: true, debug: true, level: 'verbose'},
			{listener: true, woveon: true, requester: true});

// Configure project
//let config           = require('./pl/Config');
//config.service.port = config.plugin.wl_port;
new WL.WEConfig(logger);

// Spew config if in dev mode 
if ( WL.WEConfig.get('WOV_STAGE') == 'dev' || WL.WEConfig.get('WOV_STAGE') == WL.WEConfig.get('WOV_ME') )
  WL.WEConfig.displayMe();

// Create plugin listener
let wl= new WL({logger : logger});

// Start
wl.init()
	.catch((err) => { console.log(err); throw new Error('failed wl.init'); })
	.then(() => { return wl.startup(); })
	.catch((err) => { console.log(err); throw new Error('failed wl.startup'); })
	.then(() => { logger.info('  ... launched'); })
	.catch((err) => { console.log(err); throw new Error('Failed setting up'); });

