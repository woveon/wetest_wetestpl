const WL     = require('./pl/WoveonListener');

// Set up logging
// NOTE: should probably makes these env variables
let logger           = new (require('woveon-logger'))('pltest', 
			{showName: true, debug: true, level: 'verbose'},
			{listener: true, woveon: true, requester: true});

// Configure project
//let config           = require('./pl/Config');
//config.service.port = config.plugin.wl_port;
let config = new WL.WEConfig(logger);

// Spew config if in dev mode 
logger.info(' config : ', config);


// Create plugin listener
wl= new WL({logger: logger}, config);

// Start
wl.init()
	.catch((err) => { console.log(err); throw new Error('failed wl.init'); })
	.then(() => { return wl.startup(); })
	.catch((err) => { console.log(err); throw new Error('failed wl.startup'); })
	.then(() => { logger.info('  ... launched'); })
	.catch((err) => { console.log(err); throw new Error('Failed setting up'); });

