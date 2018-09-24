const PL   = require('./pl');


// Set up logging
// NOTE: should probably makes these env variables
let logger = new PL.Logger('pltestov',
  {showName : true, debug : true, level : 'verbose'},
  {listener : true, requester : true});

// Configure project
let config new PL.Overseer.WEService(logger);

let rl= new PL.Overseer({logger : logger}, config);

rl.init()
  .catch((err) => { console.log(err); throw new Error('failed rl.init'); })
  .then(() => { return rl.startup(); })
  .catch((err) => { console.log(err); throw new Error('failed rl.startup'); })
  .then(() => { logger.info('  ... launched'); })
  .catch((err) => { console.log(err); throw new Error('Failed setting up'); });
