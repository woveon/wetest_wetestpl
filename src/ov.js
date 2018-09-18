const PL   = require('./pl');


// Set up logging
// NOTE: should probably makes these env variables
let logger = new PL.Logger('pltestov', 
    {showName: true, debug: true, level: 'verbose'},
    {listener: true, requester: true});

// Configure project
let config           = PL.PE.Service.Config;


config.service.port =  config.plugin.ov_port; // 0

// Spew config if in dev mode
logger.info(' config : ', config);


rl= new PL.Overseer({ logger: logger, outofdateseconds : 7 }, config); // 2 second buffer

rl.init()
  .catch((err) => { console.log(err); throw new Error('failed rl.init'); })
  .then(() => { return rl.startup(); })
  .catch((err) => { console.log(err); throw new Error('failed rl.startup'); })
  .then(() => { logger.info('  ... launched'); })
  .catch((err) => { console.log(err); throw new Error('Failed setting up'); });
