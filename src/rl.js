const PL   = require('./pl');


// Set up logging
// NOTE: should probably makes these env variables
let logger           = new PL.Logger('pltestRL', {showName: true, debug: true, level: 'verbose'},
                                            {listener: true, woveon: true, requester: true});

let config = new PL.WEConfig(logger);

// Spew config if in dev mode
logger.info(' config : ', config);


rl= new PL.RemoteListener({ logger: logger, name: 'pltestRemoteListener'}, config);

rl.init()
  .catch((err) => { console.log(err); throw new Error('failed rl.init'); })
  .then(() => { return rl.startup(); })
  .catch((err) => { console.log(err); throw new Error('failed rl.startup'); })
  .then(() => { logger.info('  ... launched'); })
  .catch((err) => { console.log(err); throw new Error('Failed setting up'); });
