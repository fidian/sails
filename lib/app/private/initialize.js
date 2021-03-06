/**
 * Module dependencies
 */


/**
 * Sails.prototype.initialize()
 *
 * Start the Sails server
 * NOTE: sails.load() should be run first.
 *
 * @api private
 */

module.exports = function initialize(cb) {

  var sails = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) sails.log.error(err);
  };

  // Indicate that server is starting
  sails.log.verbose('Starting app at ' + sails.config.appPath + '...');

  var listeners = {
    sigusr2: function() {
      sails.lower(function() {
        process.kill(process.pid, 'SIGUSR2');
      });
    },
    sigint: function() {
      sails.lower(process.exit);
    },
    sigterm: function() {
      sails.lower(process.exit);
    },
    exit: function() {
      if (!sails._exiting) sails.lower();
    }
  };

  // Add "beforeShutdown" events
  process.once('SIGUSR2', listeners.sigusr2);

  process.on('SIGINT', listeners.sigint);
  process.on('SIGTERM', listeners.sigterm);
  process.on('exit', listeners.exit);

  sails._processListeners = listeners;

  // Run the app bootstrap
  sails.runBootstrap(function afterBootstrap(err) {
    if (err) {
      sails.log.error('Bootstrap encountered an error: (see below)');
      return cb(err);
    }

    // And fire the `ready` event
    // This is listened to by attached servers, etc.
    sails.emit('ready');
    cb(null, sails);
  });
};
